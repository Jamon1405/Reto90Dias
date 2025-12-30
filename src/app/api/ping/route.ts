import { NextResponse } from 'next/server';
import { getNowIso } from '@/lib/date';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ success: true, ver: 'omega', nowIso: getNowIso() });
}
