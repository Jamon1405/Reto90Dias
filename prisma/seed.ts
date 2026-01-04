import { PrismaClient } from '@prisma/client';
import { defaultCheckin, defaultExtraBurn, defaultInbody, defaultMacros, defaultRecovery, defaultSupps } from '../src/lib/zodSchemas';
import { stringifyJson } from '../src/lib/json';

const prisma = new PrismaClient();

async function main() {
  await prisma.appConfig.upsert({
    where: { key: 'fastingStartMs' },
    update: {},
    create: { key: 'fastingStartMs', value: null },
  });

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  await prisma.dailyLog.upsert({
    where: { dateISO: todayIso },
    update: {},
    create: {
      dateISO: todayIso,
      suppsJson: stringifyJson(defaultSupps),
      extraBurnJson: stringifyJson(defaultExtraBurn),
      macrosJson: stringifyJson(defaultMacros),
      recoveryJson: stringifyJson(defaultRecovery),
      checkinJson: stringifyJson(defaultCheckin),
      inbodyJson: stringifyJson(defaultInbody),
      flagsJson: stringifyJson({ list: [], bmr: 0, net: 0 }),
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
