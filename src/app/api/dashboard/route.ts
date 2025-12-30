import { NextResponse } from 'next/server';
import { dashboardSchema } from '@/lib/validation';
import { buildDashboardResponse } from '@/lib/dashboard';
import { getAgeFromDob, getMonthRange, getNowIso, getTodayStr } from '@/lib/date';
import { addDays } from '@/lib/date';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function buildFallbackDashboard(message?: string) {
  const todayStr = getTodayStr();
  const { start, end } = getMonthRange(todayStr);
  const monthDates: { date: string; score: number }[] = [];
  let cursor = start;
  while (cursor <= end) {
    monthDates.push({ date: cursor, score: 0 });
    cursor = addDays(cursor, 1);
  }
  return {
    success: true,
    meta: {
      targetDate: todayStr,
      todayStr,
      daysLeft: (() => {
        const [fromYear, fromMonth, fromDay] = todayStr.split('-').map(Number);
        const [toYear, toMonth, toDay] = '2026-03-15'.split('-').map(Number);
        const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
        const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
        return Math.ceil((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
      })(),
      season: todayStr < '2026-01-05' ? 'PRE-SEASON' : 'SEASON',
      fastStartMs: null,
      nowIso: getNowIso(),
      dbStatus: 'DOWN',
      dbError: message,
    },
    user: {
      age: getAgeFromDob('1997-05-14'),
      lastWeight: 97,
    },
    dayLog: null,
    calendar: monthDates,
    history: [],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') ?? undefined;
    const parsed = dashboardSchema.safeParse({ date: dateParam });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid date format.' }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(buildFallbackDashboard('DATABASE_URL not set.'));
    }

    const response = await buildDashboardResponse(parsed.data.date);
    return NextResponse.json({
      ...response,
      meta: {
        ...response.meta,
        dbStatus: 'UP',
      },
    });
  } catch (error) {
    console.error('[TITAN] dashboard error', error);
    const message = error instanceof Error ? error.message : 'Failed to load dashboard.';
    return NextResponse.json(buildFallbackDashboard(message));
  }
}
