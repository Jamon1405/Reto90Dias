import Dexie, { Table } from 'dexie';
import { computeBmr, computeNet, computeTitanScore, computeFlags } from './analytics';
import { addDays, getAgeFromDob, getMonthRange, getNowIso, getTodayStr } from './date';
import type { ActivityEntry, TitanDay } from './types';

type StorageMode = 'indexeddb' | 'localstorage';

type DayRecord = TitanDay;
type StateRecord = { key: string; value: number | null };

const TARGET_DATE = '2026-03-15';
const SEASON_START = '2026-01-05';
const DAYS_KEY = 'titanOmegaDays';
const STATE_KEY = 'titanOmegaState';

class TitanDB extends Dexie {
  days!: Table<DayRecord, string>;
  state!: Table<StateRecord, string>;

  constructor() {
    super('titan-omega');
    this.version(1).stores({
      days: 'date',
      state: 'key',
    });
  }
}

let dbInstance: TitanDB | null = null;
let storageMode: StorageMode = 'indexeddb';

function getDb() {
  if (!dbInstance) {
    dbInstance = new TitanDB();
  }
  return dbInstance;
}

async function ensureDb(): Promise<TitanDB | null> {
  try {
    const db = getDb();
    await db.open();
    storageMode = 'indexeddb';
    return db;
  } catch {
    storageMode = 'localstorage';
    return null;
  }
}

export async function getStorageMode(): Promise<StorageMode> {
  await ensureDb();
  return storageMode;
}

function readLocalDays(): Record<string, DayRecord> {
  const raw = localStorage.getItem(DAYS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, DayRecord>;
  } catch {
    return {};
  }
}

function writeLocalDays(map: Record<string, DayRecord>) {
  localStorage.setItem(DAYS_KEY, JSON.stringify(map));
}

function readLocalState(): Record<string, number | null> {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, number | null>;
  } catch {
    return {};
  }
}

function writeLocalState(map: Record<string, number | null>) {
  localStorage.setItem(STATE_KEY, JSON.stringify(map));
}

function diffDays(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const [toYear, toMonth, toDay] = to.split('-').map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.ceil((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

function createEmptyDay(date: string): DayRecord {
  return {
    date,
    tsUpdated: null,
    weight: 0,
    waist: 0,
    workout: '',
    calIn: 0,
    calOut: 0,
    water: 0,
    suppsJson: {},
    macrosJson: {},
    fastHours: 0,
    steps: 0,
    notes: '',
    activityJson: { entries: [] },
    titanScore: 0,
    flagsJson: { list: [], bmr: 0, net: 0 },
  };
}

function normalizeDay(day: DayRecord): DayRecord {
  return {
    ...createEmptyDay(day.date),
    ...day,
    activityJson: { entries: day.activityJson?.entries ?? [] },
    suppsJson: day.suppsJson ?? {},
    macrosJson: day.macrosJson ?? {},
    flagsJson: day.flagsJson ?? { list: [], bmr: 0, net: 0 },
  };
}

async function readDays(): Promise<DayRecord[]> {
  const db = await ensureDb();
  if (db) {
    const rows = await db.days.toArray();
    return rows.map(normalizeDay);
  }
  const map = readLocalDays();
  return Object.values(map).map(normalizeDay);
}

async function writeDay(day: DayRecord): Promise<void> {
  const db = await ensureDb();
  if (db) {
    await db.days.put(day);
    return;
  }
  const map = readLocalDays();
  map[day.date] = day;
  writeLocalDays(map);
}

async function readState(key: string): Promise<number | null> {
  const db = await ensureDb();
  if (db) {
    const record = await db.state.get(key);
    return record?.value ?? null;
  }
  const map = readLocalState();
  return map[key] ?? null;
}

async function writeState(key: string, value: number | null) {
  const db = await ensureDb();
  if (db) {
    await db.state.put({ key, value });
    return;
  }
  const map = readLocalState();
  map[key] = value;
  writeLocalState(map);
}

async function deleteState(key: string) {
  const db = await ensureDb();
  if (db) {
    await db.state.delete(key);
    return;
  }
  const map = readLocalState();
  delete map[key];
  writeLocalState(map);
}

function buildHistoryMap(days: DayRecord[], targetDate: string) {
  const map: Record<string, DayRecord | undefined> = {};
  const dates = [targetDate, addDays(targetDate, -1), addDays(targetDate, -2)];
  for (const day of days) {
    if (dates.includes(day.date)) {
      map[day.date] = day;
    }
  }
  return map;
}

function getLastWeight(days: DayRecord[], targetDate: string) {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1));
  const last = sorted.find((day) => day.weight > 0 && day.date <= targetDate);
  return last?.weight ?? 0;
}

function getPreviousWeight(days: DayRecord[], targetDate: string) {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1));
  const prev = sorted.find((day) => day.weight > 0 && day.date < targetDate);
  return prev?.weight ?? 0;
}

function getMonthCalendar(days: DayRecord[], targetDate: string) {
  const { start, end } = getMonthRange(targetDate);
  const scoreMap = days.reduce<Record<string, number>>((acc, day) => {
    acc[day.date] = day.titanScore ?? 0;
    return acc;
  }, {});
  const monthDates: { date: string; score: number }[] = [];
  let cursor = start;
  while (cursor <= end) {
    monthDates.push({ date: cursor, score: scoreMap[cursor] ?? 0 });
    cursor = addDays(cursor, 1);
  }
  return monthDates;
}

function mapHistory(days: DayRecord[]) {
  return [...days]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30)
    .map((day) => ({
      ...day,
      net: computeNet(day.calIn, day.calOut),
      score: day.titanScore,
    }));
}

function applyModuleUpdate(day: DayRecord, type: string, payload: any): DayRecord {
  if (type === 'BIO') {
    return {
      ...day,
      weight: Number(payload.weight ?? day.weight ?? 0),
      steps: Number(payload.steps ?? day.steps ?? 0),
      water: Number(payload.water ?? day.water ?? 0),
      suppsJson: payload.suppsJson ?? day.suppsJson ?? {},
    };
  }
  if (type === 'GYM') {
    return {
      ...day,
      workout: String(payload.workout ?? day.workout ?? ''),
      calOut: Number(payload.calOut ?? day.calOut ?? 0),
      activityJson: payload.activityJson ?? day.activityJson ?? { entries: [] },
    };
  }
  if (type === 'FUEL') {
    return {
      ...day,
      calIn: Number(payload.calIn ?? day.calIn ?? 0),
      macrosJson: payload.macrosJson ?? day.macrosJson ?? {},
      notes: String(payload.notes ?? day.notes ?? ''),
    };
  }
  return day;
}

function recomputeDay(day: DayRecord, days: DayRecord[], targetDate: string): DayRecord {
  const lastWeight = getLastWeight(days, targetDate);
  const previousWeight = getPreviousWeight(days, targetDate);
  const weightForBmr = day.weight > 0 ? day.weight : lastWeight;
  const flags = computeFlags({
    day,
    lastWeight,
    previousWeight,
    historyMap: buildHistoryMap(days, targetDate),
  });
  return {
    ...day,
    titanScore: computeTitanScore(day),
    flagsJson: { list: flags.list, bmr: flags.bmr, net: flags.net },
  };
}

export async function getDashboardData(date?: string) {
  const todayStr = getTodayStr();
  const targetDate = date ?? todayStr;
  const days = await readDays();
  const dayRow = days.find((day) => day.date === targetDate) ?? createEmptyDay(targetDate);
  const lastWeight = getLastWeight(days, targetDate);
  const weightForBmr = dayRow.weight > 0 ? dayRow.weight : lastWeight;
  const flags = computeFlags({
    day: dayRow,
    lastWeight,
    previousWeight: getPreviousWeight(days, targetDate),
    historyMap: buildHistoryMap(days, targetDate),
  });
  const fastStartMs = await readState('fast_start_ms');

  return {
    success: true,
    meta: {
      targetDate,
      todayStr,
      daysLeft: diffDays(todayStr, TARGET_DATE),
      season: todayStr < SEASON_START ? 'PRE-SEASON' : 'SEASON',
      fastStartMs,
      nowIso: getNowIso(),
    },
    user: {
      age: getAgeFromDob('1997-05-14'),
      lastWeight,
    },
    dayLog: {
      ...normalizeDay(dayRow),
      bmr: computeBmr(weightForBmr),
      net: computeNet(dayRow.calIn, dayRow.calOut),
      titanScoreComputed: computeTitanScore(dayRow),
      flagsComputed: { list: flags.list, bmr: flags.bmr, net: flags.net },
    },
    calendar: getMonthCalendar(days, targetDate),
    history: mapHistory(days),
  };
}

export async function saveModule(type: 'BIO' | 'GYM' | 'FUEL', payload: any) {
  const targetDate = payload.targetDate ?? getTodayStr();
  const days = await readDays();
  const existing = days.find((day) => day.date === targetDate) ?? createEmptyDay(targetDate);
  const updated = normalizeDay(applyModuleUpdate(existing, type, payload));
  const next = {
    ...updated,
    tsUpdated: new Date().toISOString(),
  };
  const nextDays = days.filter((day) => day.date !== targetDate).concat(next);
  const recomputed = recomputeDay(next, nextDays, targetDate);
  await writeDay(recomputed);
  return getDashboardData(targetDate);
}

export async function fastAction(action: 'START' | 'STOP' | 'RESET') {
  const todayStr = getTodayStr();
  if (action === 'START') {
    await writeState('fast_start_ms', Date.now());
    return getDashboardData(todayStr);
  }
  if (action === 'RESET') {
    await deleteState('fast_start_ms');
    return getDashboardData(todayStr);
  }
  const startMs = await readState('fast_start_ms');
  if (!startMs) {
    return getDashboardData(todayStr);
  }
  const hours = Math.round(((Date.now() - startMs) / 3600000) * 100) / 100;
  await deleteState('fast_start_ms');
  const days = await readDays();
  const existing = days.find((day) => day.date === todayStr) ?? createEmptyDay(todayStr);
  const updated: DayRecord = {
    ...normalizeDay(existing),
    fastHours: hours,
    tsUpdated: new Date().toISOString(),
  };
  const nextDays = days.filter((day) => day.date !== todayStr).concat(updated);
  const recomputed = recomputeDay(updated, nextDays, todayStr);
  await writeDay(recomputed);
  return getDashboardData(todayStr);
}

export async function exportAllData() {
  const days = await readDays();
  const state = await (async () => {
    const fastStart = await readState('fast_start_ms');
    return { fast_start_ms: fastStart };
  })();
  return { days, state };
}

export async function importAllData(payload: { days?: DayRecord[]; state?: Record<string, number | null> }) {
  const days = payload.days ?? [];
  const state = payload.state ?? {};
  for (const day of days) {
    await writeDay(normalizeDay(day));
  }
  if ('fast_start_ms' in state) {
    await writeState('fast_start_ms', state.fast_start_ms ?? null);
  }
}

export function normalizeActivityEntries(entries?: ActivityEntry[]) {
  return Array.isArray(entries) ? entries : [];
}
