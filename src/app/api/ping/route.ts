import { NextResponse } from 'next/server';
import { getNowIso } from '@/lib/date';

export async function GET() {
  return NextResponse.json({ success: true, ver: 'omega', nowIso: getNowIso() });
}
