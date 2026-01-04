import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { todayISO } from '@/lib/timezone';
import { defaultCheckin, defaultExtraBurn, defaultInbody, defaultMacros, defaultRecovery, defaultSupps } from '@/lib/zodSchemas';
import { stringifyJson } from '@/lib/json';

export async function POST() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL is not set' }, { status: 500 });
  }
  const config = await prisma.appConfig.findUnique({ where: { key: 'fastingStartMs' } });
  if (!config?.value) {
    return NextResponse.json({ success: false, error: 'No hay ayuno activo.' }, { status: 400 });
  }
  const elapsedMs = Date.now() - Number(config.value);
  const hours = Math.round((elapsedMs / 3600000) * 100) / 100;
  await prisma.appConfig.update({ where: { key: 'fastingStartMs' }, data: { value: null } });

  const dateISO = todayISO();
  const existing = await prisma.dailyLog.findUnique({ where: { dateISO } });
  const log = existing
    ? existing
      : await prisma.dailyLog.create({
        data: {
          dateISO,
          suppsJson: stringifyJson(defaultSupps),
          extraBurnJson: stringifyJson(defaultExtraBurn),
          macrosJson: stringifyJson(defaultMacros),
          recoveryJson: stringifyJson(defaultRecovery),
          checkinJson: stringifyJson(defaultCheckin),
          inbodyJson: stringifyJson(defaultInbody),
          flagsJson: stringifyJson({ list: [], bmr: 0, net: 0 }),
        },
      });

  await prisma.dailyLog.update({
    where: { dateISO: log.dateISO },
    data: { fastingHours: hours },
  });

  return NextResponse.json({ success: true, data: { fastingHours: hours } });
}
