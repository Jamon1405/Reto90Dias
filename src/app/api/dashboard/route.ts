import { NextResponse } from 'next/server';
import { dashboardSchema } from '@/lib/validation';
import { buildDashboardResponse } from '@/lib/dashboard';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') ?? undefined;
    const parsed = dashboardSchema.safeParse({ date: dateParam });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid date format.' }, { status: 400 });
    }

    const response = await buildDashboardResponse(parsed.data.date);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load dashboard.' }, { status: 500 });
  }
}
