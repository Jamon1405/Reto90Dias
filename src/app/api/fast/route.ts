import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { fastSchema } from '@/lib/validation';
import { getNowIso, getTodayStr } from '@/lib/date';
import { computeTitanScore } from '@/lib/analytics';
import { buildDashboardResponse } from '@/lib/dashboard';
import { buildFlags, mapRow } from '@/lib/server';
import { addDays } from '@/lib/date';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: false, error: 'DATABASE_URL not set.' }, { status: 500 });
    }
    const prisma = getPrisma();
    const body = await request.json();
    const parsed = fastSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Acción inválida.' }, { status: 400 });
    }

    const action = parsed.data.action;
    const key = 'fast_start_ms';

    if (action === 'RESET') {
      await prisma.titanState.deleteMany({ where: { key } });
      return NextResponse.json({ success: true, meta: { fastStartMs: null, nowIso: getNowIso() } });
    }

    if (action === 'START') {
      const now = Date.now();
      await prisma.titanState.upsert({
        where: { key },
        update: { value: String(now) },
        create: { key, value: String(now) },
      });
      return NextResponse.json({ success: true, meta: { fastStartMs: now, nowIso: getNowIso() } });
    }

    const state = await prisma.titanState.findUnique({ where: { key } });
    const startMs = state ? Number(state.value) : null;
    if (!startMs) {
      return NextResponse.json({ success: false, error: 'No hay ayuno activo.' }, { status: 400 });
    }

    const hours = Number(((Date.now() - startMs) / 3600000).toFixed(2));
    await prisma.titanState.deleteMany({ where: { key } });

    const targetDate = getTodayStr();
    const upserted = await prisma.titanDay.upsert({
      where: { date: targetDate },
      update: { fastHours: hours },
      create: { date: targetDate, fastHours: hours },
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

    const historyDates = [targetDate, addDays(targetDate, -1), addDays(targetDate, -2)];
    const historyRows = await prisma.titanDay.findMany({ where: { date: { in: historyDates } } });
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
      data: { titanScore, flagsJson: flagsComputed },
    });

    const response = await buildDashboardResponse(targetDate);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'No se pudo actualizar ayuno.' }, { status: 500 });
  }
}
