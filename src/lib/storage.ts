import { db } from './db';
import {
  computeBmi,
  computeBmr,
  computeCaloriesIn,
  computeCaloriesOut,
  computeFlags,
  computeNet,
  computeRoutineLabel,
  computeTitanScore,
} from './analytics';
import { addDays, getAgeFromDob, monthDays, nowIsoInTZ, todayISOInTZ } from './date';
import type { ActivityLog, ActivityManualEntry, ActivityTreadmillEntry, TitanDay, TitanFlags } from './types';

const TARGET_DATE = '2026-03-15';
const SEASON_START = '2026-01-05';
const DOB = '1997-05-14';
const HEIGHT_CM = 173;

function diffDays(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const [toYear, toMonth, toDay] = to.split('-').map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.ceil((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

function emptyActivity(): ActivityLog {
  return { treadmill: [], manual: [] };
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeTreadmill(entries: ActivityTreadmillEntry[] | undefined) {
  return (entries ?? []).map((entry) => ({
    ...entry,
    id: entry.id ?? createId(),
  }));
}

function normalizeManual(entries: ActivityManualEntry[] | undefined) {
  return (entries ?? []).map((entry) => ({
    ...entry,
    id: entry.id ?? createId(),
    kind:
      entry.kind ??
      (entry.label?.toUpperCase().includes('FÚTBOL') || entry.label?.toUpperCase().includes('FUTBOL')
        ? 'FUTBOL'
        : entry.label?.toUpperCase().includes('PÁDEL') || entry.label?.toUpperCase().includes('PADEL')
          ? 'PADEL'
          : 'PESAS'),
  }));
}

type Phase = 'PRE-SEASON' | 'SEASON' | 'POST-SEASON';

function getPhase(date: string): Phase {
  if (date < SEASON_START) return 'PRE-SEASON';
  if (date <= TARGET_DATE) return 'SEASON';
  return 'POST-SEASON';
}

export function createEmptyDay(date: string): TitanDay {
  return {
    date,
    tsUpdated: null,
    weight: 0,
    waist: 0,
    workout: '',
    calIn: 0,
    calOut: 0,
    water: 0,
    supps: { creat: false, sod: false, mag: false, omega: false },
    macros: { m: 0, e: 0, b: 0 },
    fastHours: 0,
    steps: 0,
    notes: '',
    activity: emptyActivity(),
    titanScore: 0,
    flags: { list: [], bmr: 0, net: 0 },
  };
}

function normalizeDay(day: TitanDay): TitanDay {
  return {
    ...createEmptyDay(day.date),
    ...day,
    supps: day.supps ?? { creat: false, sod: false, mag: false, omega: false },
    macros: day.macros ?? { m: 0, e: 0, b: 0 },
    activity: {
      treadmill: normalizeTreadmill(day.activity?.treadmill),
      manual: normalizeManual(day.activity?.manual),
    },
    flags: day.flags ?? { list: [], bmr: 0, net: 0 },
  };
}

async function readDays() {
  const rows = await db.days.toArray();
  return rows.map(normalizeDay);
}

function getLastWeight(days: TitanDay[], targetDate: string) {
  return (
    [...days]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .find((day) => day.weight > 0 && day.date <= targetDate)?.weight ?? 97
  );
}

function getPreviousWeight(days: TitanDay[], targetDate: string) {
  return (
    [...days]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .find((day) => day.weight > 0 && day.date < targetDate)?.weight ?? 0
  );
}

function getHistoryMap(days: TitanDay[], targetDate: string) {
  const map: Record<string, TitanDay | undefined> = {};
  const dates = [targetDate, addDays(targetDate, -1), addDays(targetDate, -2)];
  for (const day of days) {
    if (dates.includes(day.date)) {
      map[day.date] = day;
    }
  }
  return map;
}

function computeFlagsForDay(day: TitanDay, days: TitanDay[]): TitanFlags {
  const lastWeight = getLastWeight(days, day.date);
  const previousWeight = getPreviousWeight(days, day.date);
  const flags = computeFlags({
    day,
    lastWeight,
    previousWeight,
    historyMap: getHistoryMap(days, day.date),
  });
  return { list: flags.list, bmr: flags.bmr, net: flags.net };
}

function computeDerived(day: TitanDay, days: TitanDay[]) {
  const weightForBmr = day.weight > 0 ? day.weight : getLastWeight(days, day.date);
  const calIn = computeCaloriesIn(day.macros);
  const calOut = computeCaloriesOut({ weight: weightForBmr, activity: day.activity });
  const titanScore = computeTitanScore({ ...day, calIn, calOut });
  const flags = computeFlagsForDay({ ...day, calIn, calOut }, days);
  return { calIn, calOut, titanScore, flags, weightForBmr };
}

function mapHistory(days: TitanDay[]) {
  return [...days]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30)
    .map((day) => ({
      ...day,
      net: computeNet(day.calIn, day.calOut),
      score: day.titanScore,
    }));
}

export async function getMonthCalendar(monthKey: string) {
  const days = await readDays();
  const monthDate = `${monthKey}-01`;
  return monthDays(monthDate).map((iso) => ({
    date: iso,
    score: days.find((day) => day.date === iso)?.titanScore ?? 0,
    phase: getPhase(iso),
  }));
}

export async function ping() {
  return {
    success: true,
    ver: 'omega-local-1.0',
    nowIso: nowIsoInTZ(),
    todayStr: todayISOInTZ(),
  };
}

export async function getDashboardData(date?: string) {
  const todayStr = todayISOInTZ();
  const targetDate = date ?? todayStr;
  const days = await readDays();
  const dayRow = days.find((day) => day.date === targetDate) ?? createEmptyDay(targetDate);
  const normalized = normalizeDay(dayRow);
  const { calIn, calOut, titanScore, flags, weightForBmr } = computeDerived(normalized, days);

  const calendar = monthDays(targetDate).map((iso) => ({
    date: iso,
    score: days.find((day) => day.date === iso)?.titanScore ?? 0,
    phase: getPhase(iso),
  }));

  const fastState = await db.state.get('fast_start_ms');
  const lastWeight = getLastWeight(days, targetDate);

  return {
    success: true,
    ver: 'omega-local-1.0',
    meta: {
      targetDate,
      todayStr,
      daysLeft: diffDays(todayStr, TARGET_DATE),
      season: todayStr < SEASON_START ? 'PRE-SEASON' : 'SEASON',
      fastStartMs: fastState?.value ? Number(fastState.value) : null,
      nowIso: nowIsoInTZ(),
      routineLabel: computeRoutineLabel(days, targetDate),
    },
    user: {
      age: getAgeFromDob(DOB),
      lastWeight,
      heightCm: HEIGHT_CM,
    },
    dayLog: {
      ...normalized,
      calIn,
      calOut,
      titanScore,
      flagsComputed: flags,
      titanScoreComputed: titanScore,
      bmr: computeBmr(weightForBmr),
      bmi: computeBmi(weightForBmr),
      net: computeNet(calIn, calOut),
    },
    calendar,
    history: mapHistory(days),
  };
}

export async function saveModule(type: 'BIO' | 'GYM' | 'FUEL', payload: any) {
  const targetDate = payload.targetDate ?? todayISOInTZ();
  const days = await readDays();
  const current = days.find((day) => day.date === targetDate) ?? createEmptyDay(targetDate);
  let next = normalizeDay(current);

  if (type === 'BIO') {
    next = {
      ...next,
      weight: Number(payload.weight ?? next.weight ?? 0),
      waist: Number(payload.waist ?? next.waist ?? 0),
      steps: Number(payload.steps ?? next.steps ?? 0),
      water: Number(payload.water ?? next.water ?? 0),
      supps: payload.supps ?? next.supps,
    };
  }
  if (type === 'GYM') {
    next = {
      ...next,
      workout: String(payload.workout ?? next.workout ?? ''),
      activity: payload.activity ?? next.activity,
    };
  }
  if (type === 'FUEL') {
    next = {
      ...next,
      macros: payload.macros ?? next.macros,
      notes: String(payload.notes ?? next.notes ?? ''),
    };
  }

  const enriched = { ...next, tsUpdated: nowIsoInTZ() };
  const merged = days.filter((day) => day.date !== targetDate).concat(enriched);
  const derived = computeDerived(enriched, merged);
  const toSave = {
    ...enriched,
    calIn: derived.calIn,
    calOut: derived.calOut,
    titanScore: derived.titanScore,
    flags: derived.flags,
  };
  await db.days.put(toSave);
  return getDashboardData(targetDate);
}

export async function fastingOp(action: 'START' | 'STOP' | 'RESET') {
  const todayStr = todayISOInTZ();
  if (action === 'START') {
    await db.state.put({ key: 'fast_start_ms', value: String(Date.now()) });
    return getDashboardData(todayStr);
  }
  if (action === 'RESET') {
    await db.state.put({ key: 'fast_start_ms', value: null });
    return getDashboardData(todayStr);
  }
  const fastState = await db.state.get('fast_start_ms');
  if (!fastState?.value) {
    return getDashboardData(todayStr);
  }
  const hours = Math.round(((Date.now() - Number(fastState.value)) / 3600000) * 100) / 100;
  await db.state.put({ key: 'fast_start_ms', value: null });
  const days = await readDays();
  const current = days.find((day) => day.date === todayStr) ?? createEmptyDay(todayStr);
  const updated = { ...normalizeDay(current), fastHours: hours, tsUpdated: nowIsoInTZ() };
  const merged = days.filter((day) => day.date !== todayStr).concat(updated);
  const derived = computeDerived(updated, merged);
  await db.days.put({
    ...updated,
    calIn: derived.calIn,
    calOut: derived.calOut,
    titanScore: derived.titanScore,
    flags: derived.flags,
  });
  return getDashboardData(todayStr);
}

export async function exportAllData() {
  const days = await readDays();
  const state = await db.state.toArray();
  return { days, state };
}

export async function importAllData(payload: { days?: TitanDay[]; state?: { key: string; value: string | null }[] }) {
  const days = payload.days ?? [];
  const state = payload.state ?? [];
  const existing = await readDays();
  const mergedMap = new Map<string, TitanDay>();
  for (const day of existing) {
    mergedMap.set(day.date, day);
  }
  for (const day of days) {
    const normalized = normalizeDay(day);
    const prev = mergedMap.get(normalized.date);
    if (!prev || (prev.tsUpdated ?? '') < (normalized.tsUpdated ?? '')) {
      mergedMap.set(normalized.date, normalized);
    }
  }
  await db.days.bulkPut([...mergedMap.values()]);
  if (state.length > 0) {
    await db.state.bulkPut(state);
  }
}

export async function deleteDay(date: string) {
  await db.days.delete(date);
}
