import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL is not set' }, { status: 500 });
  }
  await prisma.appConfig.upsert({
    where: { key: 'fastingStartMs' },
    update: { value: null },
    create: { key: 'fastingStartMs', value: null },
  });
  return NextResponse.json({ success: true });
}
