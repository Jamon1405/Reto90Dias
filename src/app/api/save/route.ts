import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { saveSchema } from '@/lib/validation';
import { computeTitanScore } from '@/lib/analytics';
import { buildDashboardResponse } from '@/lib/dashboard';
import { buildFlags, computeFuelCalories, computeGymCalOut, mapRow } from '@/lib/server';
import { addDays } from '@/lib/date';

function normalizeSupps(input: any) {
  if (!input || typeof input !== 'object') return {};
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, Boolean(value)]));
}

function normalizeMacros(input: any) {
  if (!input || typeof input !== 'object') return {};
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, Number(value) || 0]));
}

function normalizeActivity(input: any) {
  if (!input || typeof input !== 'object') return {};
  const entries = Array.isArray(input.entries) ? input.entries : [];
  return {
    entries: entries.map((entry) => ({
      label: String(entry.label ?? ''),
      minutes: Number(entry.minutes ?? 0),
      calories: Number(entry.calories ?? 0),
    })),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Payload inválido.' }, { status: 400 });
    }

    const { type, targetDate, payload } = parsed.data;
    let updateData: Record<string, any> = {};

    if (type === 'BIO') {
      updateData = {
        weight: Number(payload.weight ?? 0),
        steps: Number(payload.steps ?? 0),
        water: Number(payload.water ?? 0),
        suppsJson: normalizeSupps(payload.suppsJson),
      };
    }

    if (type === 'GYM') {
      const activityJson = normalizeActivity(payload.activityJson);
      updateData = {
        workout: String(payload.workout ?? ''),
        activityJson,
      };
    }

    if (type === 'FUEL') {
      const macrosJson = normalizeMacros(payload.macrosJson);
      updateData = {
        macrosJson,
        notes: String(payload.notes ?? ''),
      };
    }

    const upserted = await prisma.titanDay.upsert({
      where: { date: targetDate },
      update: updateData,
      create: {
        date: targetDate,
        ...updateData,
      },
    });

    const day = mapRow(upserted);

    const [lastWeightRow, previousWeightRow] = await Promise.all([
      prisma.titanDay.findFirst({
        where: { weight: { gt: 0 }, date: { lte: targetDate } },
        orderBy: { date: 'desc' },
      }),
      prisma.titanDay.findFirst({
        where: { weight: { gt: 0 }, date: { lt: targetDate } },
        orderBy: { date: 'desc' },
      }),
    ]);

    const lastWeight = lastWeightRow?.weight ?? 0;
    const previousWeight = previousWeightRow?.weight ?? 0;
    const weightForBmr = day.weight > 0 ? day.weight : lastWeight;

    if (type === 'GYM') {
      day.calOut = computeGymCalOut(weightForBmr, day.activityJson);
    }

    if (type === 'FUEL') {
      day.calIn = computeFuelCalories(day.macrosJson);
    }

    const historyDates = [targetDate, addDays(targetDate, -1), addDays(targetDate, -2)];
    const historyRows = await prisma.titanDay.findMany({
      where: { date: { in: historyDates } },
    });
    const historyMap = historyRows.reduce<Record<string, ReturnType<typeof mapRow>>>(
      (acc, row) => {
        acc[row.date] = mapRow(row);
        return acc;
      },
      {},
    );
    historyMap[targetDate] = day;

    const titanScore = computeTitanScore(day);
    const flagsComputed = buildFlags(day, lastWeight, previousWeight, historyMap);

    const updated = await prisma.titanDay.update({
      where: { date: targetDate },
      data: {
        calIn: day.calIn,
        calOut: day.calOut,
        titanScore,
        flagsJson: flagsComputed,
      },
    });

    const response = await buildDashboardResponse(targetDate);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'No se pudo guardar.' }, { status: 500 });
  }
}
