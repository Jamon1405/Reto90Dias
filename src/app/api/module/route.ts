import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeBmr, computeCalIn, computeCalOut, computeFlags, computeNet, computeTitanScore, lastThreeDates } from '@/lib/calc';
import { todayISO } from '@/lib/timezone';
import {
  bioSchema,
  checkinModuleSchema,
  defaultCheckin,
  defaultExtraBurn,
  defaultInbody,
  defaultMacros,
  defaultRecovery,
  defaultSupps,
  extraSchema,
  fuelSchema,
  gymSchema,
  inbodyModuleSchema,
  modulePayloadSchema,
  recoveryModuleSchema,
  sleepSchema,
} from '@/lib/zodSchemas';
import { parseJson, stringifyJson } from '@/lib/json';

async function getOrCreate(dateISO: string) {
  const existing = await prisma.dailyLog.findUnique({ where: { dateISO } });
  if (existing) return existing;
  return prisma.dailyLog.create({
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
}

function validatePayload(type: string, payload: unknown) {
  switch (type) {
    case 'BIO':
      return bioSchema.parse(payload);
    case 'GYM':
      return gymSchema.parse(payload);
    case 'EXTRA':
      return extraSchema.parse(payload);
    case 'FUEL':
      return fuelSchema.parse(payload);
    case 'SLEEP':
      return sleepSchema.parse(payload);
    case 'RECOVERY':
      return recoveryModuleSchema.parse(payload);
    case 'CHECKIN':
      return checkinModuleSchema.parse(payload);
    case 'INBODY':
      return inbodyModuleSchema.parse(payload);
    default:
      throw new Error('Tipo inválido');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = modulePayloadSchema.parse(body);
    const today = todayISO();
    if (parsed.targetDate > today) {
      return NextResponse.json({ success: false, error: 'No se puede guardar en fechas futuras.' }, { status: 400 });
    }

    const current = await getOrCreate(parsed.targetDate);
    const payload = validatePayload(parsed.type, parsed.payload);

    const data: Record<string, unknown> = {};
    if (parsed.type === 'BIO') {
      Object.assign(data, {
        weightKg: payload.weightKg,
        waistCm: payload.waistCm,
        steps: payload.steps,
        waterCups: payload.waterCups,
        suppsJson: stringifyJson(payload.suppsJson),
      });
    }
    if (parsed.type === 'GYM') {
      Object.assign(data, payload);
    }
    if (parsed.type === 'EXTRA') {
      Object.assign(data, { extraBurnJson: stringifyJson(payload.extraBurnJson) });
    }
    if (parsed.type === 'FUEL') {
      Object.assign(data, { macrosJson: stringifyJson(payload.macrosJson), notes: payload.notes });
    }
    if (parsed.type === 'SLEEP') {
      Object.assign(data, payload);
    }
    if (parsed.type === 'RECOVERY') {
      Object.assign(data, { recoveryJson: stringifyJson(payload.recoveryJson) });
    }
    if (parsed.type === 'CHECKIN') {
      Object.assign(data, { checkinJson: stringifyJson(payload.checkinJson) });
    }
    if (parsed.type === 'INBODY') {
      Object.assign(data, { inbodyJson: stringifyJson(payload.inbodyJson), waistCm: payload.waistCm ?? current.waistCm });
    }

    const updated = await prisma.dailyLog.update({
      where: { dateISO: current.dateISO },
      data,
    });

    const macros = parseJson(updated.macrosJson, defaultMacros);
    const extra = parseJson(updated.extraBurnJson, defaultExtraBurn);
    const calIn = computeCalIn(macros);
    const bmr = computeBmr(updated.weightKg, updated.dateISO);
    const calOut = computeCalOut({ bmr, extraBurn: extra.totalCals ?? 0 });
    const net = computeNet(calIn, calOut);
    const titanScore = computeTitanScore({ net, waterCups: updated.waterCups, steps: updated.steps, calOut });

    const previousWeightRow = await prisma.dailyLog.findFirst({
      where: { dateISO: { lt: updated.dateISO }, weightKg: { gt: 0 } },
      orderBy: { dateISO: 'desc' },
    });
    const lastThree = await prisma.dailyLog.findMany({
      where: { dateISO: { in: lastThreeDates(updated.dateISO) } },
      orderBy: { dateISO: 'desc' },
    });
    const { flags } = computeFlags({
      log: { ...updated, calIn, calOut },
      previousWeight: previousWeightRow?.weightKg ?? null,
      lastThree,
      nowIso: today,
    });

    const saved = await prisma.dailyLog.update({
      where: { dateISO: updated.dateISO },
      data: {
        calIn,
        calOut,
        titanScore,
        flagsJson: stringifyJson({ list: flags, bmr, net }),
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
