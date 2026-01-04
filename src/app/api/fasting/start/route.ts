import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST() {
  const prisma = getPrisma();
  await prisma.appConfig.upsert({
    where: { key: 'fastingStartMs' },
    update: { value: String(Date.now()) },
    create: { key: 'fastingStartMs', value: String(Date.now()) },
  });
  return NextResponse.json({ success: true });
}
