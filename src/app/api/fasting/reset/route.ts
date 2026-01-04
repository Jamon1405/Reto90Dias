import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST() {
  const prisma = getPrisma();
  await prisma.appConfig.upsert({
    where: { key: 'fastingStartMs' },
    update: { value: null },
    create: { key: 'fastingStartMs', value: null },
  });
  return NextResponse.json({ success: true });
}
