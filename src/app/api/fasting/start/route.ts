import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  await prisma.appConfig.upsert({
    where: { key: 'fastingStartMs' },
    update: { value: String(Date.now()) },
    create: { key: 'fastingStartMs', value: String(Date.now()) },
  });
  return NextResponse.json({ success: true });
}
