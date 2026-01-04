import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  await prisma.appConfig.upsert({
    where: { key: 'fastingStartMs' },
    update: { value: null },
    create: { key: 'fastingStartMs', value: null },
  });
  return NextResponse.json({ success: true });
}
