import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { parseJson, stringifyJson } from '@/lib/json';
import {
  ageFromDob,
  computeBmr,
  computeCalIn,
  computeCalOut,
  computeFlags,
  computeNet,
  computeTitanScore,
  lastThreeDates,
  seasonForDate,
} from '@/lib/calc';
import { diffDays, monthDays, todayISO } from '@/lib/timezone';
import { defaultCheckin, defaultExtraBurn, defaultInbody, defaultMacros, defaultRecovery, defaultSupps } from '@/lib/zodSchemas';

function coerceLog(log: any) {
  return {
    ...log,
    suppsJson: parseJson(log?.suppsJson, defaultSupps),
    extraBurnJson: parseJson(log?.extraBurnJson, defaultExtraBurn),
    macrosJson: parseJson(log?.macrosJson, defaultMacros),
    recoveryJson: parseJson(log?.recoveryJson, defaultRecovery),
    checkinJson: parseJson(log?.checkinJson, defaultCheckin),
    inbodyJson: parseJson(log?.inbodyJson, defaultInbody),
    flagsJson: parseJson(log?.flagsJson, { list: [], bmr: 0, net: 0 }),
  };
}

async function ensureLog(dateISO: string) {
  const prisma = getPrisma();
  const existing = await prisma.dailyLog.findUnique({ where: { dateISO } });
  if (existing) {
    return coerceLog(existing);
  }
  const created = await prisma.dailyLog.create({
    data: {
      dateISO,
      suppsJson: stringifyJson(defaultSupps),
      extraBurnJson: stringifyJson(defaultExtraBurn),
      macrosJson: stringifyJson(defaultMacros),
      recoveryJson: stringifyJson(defaultRecovery),
      checkinJson: stringifyJson(defaultCheckin),
      inbodyJson: stringifyJson(defaultInbody),
      flagsJson: stringifyJson({ list: [], bmr: 0, net: 0 }),
    },
  });
  return coerceLog(created);
}

async function computeDerived(log: any, todayStr: string) {
  const prisma = getPrisma();
  const calIn = computeCalIn(log.macrosJson);
  const bmr = computeBmr(log.weightKg, log.dateISO);
  const calOut = computeCalOut({ bmr, extraBurn: log.extraBurnJson.totalCals ?? 0 });
  const net = computeNet(calIn, calOut);
  const titanScore = computeTitanScore({ net, waterCups: log.waterCups, steps: log.steps, calOut });

  const previousWeightRow = await prisma.dailyLog.findFirst({
    where: { dateISO: { lt: log.dateISO }, weightKg: { gt: 0 } },
    orderBy: { dateISO: 'desc' },
  });
  const lastThree = await prisma.dailyLog.findMany({
    where: { dateISO: { in: lastThreeDates(log.dateISO) } },
    orderBy: { dateISO: 'desc' },
  });
  const { flags } = computeFlags({
    log: { ...log, calIn, calOut },
    previousWeight: previousWeightRow?.weightKg ?? null,
    lastThree,
    nowIso: todayStr,
  });

  return { calIn, calOut, net, titanScore, bmr, flags };
}

export async function GET(request: Request) {
  const prisma = getPrisma();
  const url = new URL(request.url);
  const dateParam = url.searchParams.get('date');
  const todayStr = todayISO();
  const targetDate = dateParam && dateParam <= todayStr ? dateParam : todayStr;

  const log = await ensureLog(targetDate);
  const derived = await computeDerived(log, todayStr);

  const season = seasonForDate(todayStr);
  const daysLeft = diffDays(todayStr, '2026-03-15');

  const lastWeightRow = await prisma.dailyLog.findFirst({
    where: { dateISO: { lte: targetDate }, weightKg: { gt: 0 } },
    orderBy: { dateISO: 'desc' },
  });

  const fastingStart = await prisma.appConfig.findUnique({ where: { key: 'fastingStartMs' } });

  const calendarDays = monthDays(targetDate);
  const monthLogs = await prisma.dailyLog.findMany({
    where: { dateISO: { in: calendarDays } },
  });
  const monthMap = new Map(monthLogs.map((row) => [row.dateISO, row]));
  const calendar = calendarDays.map((dateISO) => ({
    dateISO,
    score: monthMap.get(dateISO)?.titanScore ?? 0,
  }));

  const historyRows = await prisma.dailyLog.findMany({ orderBy: { dateISO: 'desc' }, take: 30 });
  const historyLast30 = historyRows.map(coerceLog);

  return NextResponse.json({
    success: true,
    data: {
      meta: {
        targetDate,
        todayStr,
        daysLeft,
        season,
        fastingStartMs: fastingStart?.value ? Number(fastingStart.value) : null,
      },
      user: {
        age: ageFromDob(todayStr),
        lastWeight: lastWeightRow?.weightKg ?? 0,
      },
      dayLog: {
        ...log,
        calIn: derived.calIn,
        calOut: derived.calOut,
        titanScore: derived.titanScore,
        flagsJson: { list: derived.flags, bmr: derived.bmr, net: derived.net },
        net: derived.net,
        bmr: derived.bmr,
      },
      calendar,
      historyLast30,
    },
  });
}
