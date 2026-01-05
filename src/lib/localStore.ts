import Dexie, { type Table } from 'dexie';
import type { DayLog } from './models';
import { defaultCheckin, defaultExtraBurn, defaultInbody, defaultMacros, defaultRecovery, defaultSupps } from './zodSchemas';
import { computeCalIn, computeFlags, computeNet, computeOutBreakdown, computeTitanScore } from './calc';
import { addDays, formatDateTime_MX, todayISO_MX } from './timezone';

const SCHEMA_VERSION = 2;

const emptyFlags = { list: [], bmr: 0, net: 0 };

function createEmptyDay(dateISO: string): DayLog {
  return {
    dateISO,
    updatedAt: null,
    weightKg: 0,
    waistCm: 0,
    steps: 0,
    waterCups: 0,
    suppsJson: defaultSupps,
    workout: '',
    extraBurnJson: defaultExtraBurn,
    macrosJson: defaultMacros,
    calIn: 0,
    calOut: 0,
    fastingHours: 0,
    sleepHours: 0,
    recoveryJson: defaultRecovery,
    checkinJson: defaultCheckin,
    inbodyJson: defaultInbody,
    notes: '',
    titanScore: 0,
    flagsJson: emptyFlags,
  };
}

function normalizeDay(day: DayLog): DayLog {
  const base = createEmptyDay(day.dateISO);
  return {
    ...base,
    ...day,
    updatedAt: day.updatedAt ?? base.updatedAt,
    suppsJson: day.suppsJson ?? base.suppsJson,
    extraBurnJson: day.extraBurnJson ?? base.extraBurnJson,
    macrosJson: day.macrosJson ?? base.macrosJson,
    recoveryJson: day.recoveryJson ?? base.recoveryJson,
    checkinJson: { ...base.checkinJson, ...day.checkinJson },
    inbodyJson: day.inbodyJson ?? base.inbodyJson,
    flagsJson: day.flagsJson ?? base.flagsJson,
  };
}

class TitanOmegaDB extends Dexie {
  days!: Table<DayLog, string>;
  meta!: Table<{ key: string; value: string }, string>;

  constructor() {
    super('titan-omega');
    this.version(1).stores({
      days: 'dateISO',
      meta: 'key',
    });
    this.version(2)
      .stores({
        days: 'dateISO',
        meta: 'key',
      })
      .upgrade(async (tx) => {
        const days = await tx.table('days').toArray();
        await Promise.all(
          days.map((day) => {
            const normalized = normalizeDay(day as DayLog);
            return tx.table('days').put(normalized);
          }),
        );
      });
  }
}

const db = new TitanOmegaDB();

async function computeDerived(day: DayLog, allDays: DayLog[]) {
  const calIn = computeCalIn(day.macrosJson);
  const extraOut = Number(day.extraBurnJson.totalCals ?? 0);
  const { bmr, totalOut } = computeOutBreakdown({ weightKg: day.weightKg, extraOut });
  const calOut = totalOut;
  const net = computeNet(calIn, calOut);
  const titanScore = computeTitanScore({ net, waterCups: day.waterCups, steps: day.steps, calOut });

  const previousWeight = [...allDays]
    .filter((row) => row.dateISO < day.dateISO && row.weightKg > 0)
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))[0]?.weightKg ?? null;
  const requiredDates = [day.dateISO, addDays(day.dateISO, -1), addDays(day.dateISO, -2)];
  const lastThree = allDays.filter((row) => requiredDates.includes(row.dateISO));
  const { flags } = computeFlags({ log: { ...day, calIn, calOut }, previousWeight, lastThree, nowIso: todayISO_MX() });

  return { calIn, calOut, net, bmr, titanScore, flags };
}

export async function getDay(dateISO: string) {
  const row = await db.days.get(dateISO);
  return row ? normalizeDay(row) : createEmptyDay(dateISO);
}

export async function upsertDay(dateISO: string, update: Partial<DayLog>) {
  const existing = await getDay(dateISO);
  const merged = normalizeDay({ ...existing, ...update, dateISO });
  const updatedAt = formatDateTime_MX();
  const allDays = (await db.days.toArray()).map(normalizeDay);
  const derived = await computeDerived(merged, allDays.concat(merged));
  const toSave: DayLog = {
    ...merged,
    updatedAt,
    calIn: derived.calIn,
    calOut: derived.calOut,
    titanScore: derived.titanScore,
    flagsJson: { list: derived.flags, bmr: derived.bmr, net: derived.net },
  };
  await db.days.put(toSave);
  return toSave;
}

export async function getHistoryLastN(count: number) {
  const days = (await db.days.toArray()).map(normalizeDay);
  return days.sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, count);
}

export async function getMonthCalendar(year: number, month: number) {
  const monthStr = String(month).padStart(2, '0');
  const prefix = `${year}-${monthStr}`;
  const days = await db.days.where('dateISO').startsWith(prefix).toArray();
  return days.map((day) => ({ dateISO: day.dateISO, score: day.titanScore }));
}

export async function exportJSON() {
  const days = await db.days.toArray();
  return {
    version: SCHEMA_VERSION,
    exportedAt: formatDateTime_MX(),
    days,
  };
}

export async function importJSON(payload: { version?: number; days?: DayLog[] }) {
  const input = (payload.days ?? []).map(normalizeDay);
  const days = await Promise.all(
    input.map(async (day) => {
      const derived = await computeDerived(day, input);
      return {
        ...day,
        calIn: derived.calIn,
        calOut: derived.calOut,
        titanScore: derived.titanScore,
        flagsJson: { list: derived.flags, bmr: derived.bmr, net: derived.net },
      };
    }),
  );
  await db.transaction('rw', db.days, async () => {
    await db.days.clear();
    if (days.length) {
      await db.days.bulkPut(days);
    }
  });
}

export async function getLastSaved(dateISO: string) {
  const day = await db.days.get(dateISO);
  return day?.updatedAt ?? null;
}

export async function setFastingStart(ms: number | null) {
  if (ms === null) {
    await db.meta.put({ key: 'fastingStartMs', value: '' });
  } else {
    await db.meta.put({ key: 'fastingStartMs', value: String(ms) });
  }
}

export async function getFastingStart() {
  const row = await db.meta.get('fastingStartMs');
  return row?.value ? Number(row.value) : null;
}
