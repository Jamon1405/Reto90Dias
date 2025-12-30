import { NextResponse } from 'next/server';
import { getNowIso } from '@/lib/date';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json({ success: true, ver: 'omega', nowIso: getNowIso() });
  } catch (error) {
    console.error('[TITAN] ping error', error);
    return NextResponse.json({ success: false, error: 'Ping failed.' }, { status: 500 });
  }
}
