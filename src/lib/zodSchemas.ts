import { z } from 'zod';

export const suppsSchema = z.object({
  creat: z.boolean(),
  sod: z.boolean(),
  mag: z.boolean(),
  omega: z.boolean(),
});

export const macrosSchema = z.object({
  p: z.number().nonnegative(),
  c: z.number().nonnegative(),
  f: z.number().nonnegative(),
});

export const extraBurnEventSchema = z.object({
  type: z.enum(['PADEL', 'FUTBOL', 'WALK_INCLINE', 'WALK', 'BOX', 'MOVE', 'OTHER']),
  min: z.number().nonnegative(),
  factor: z.number().nonnegative(),
  cals: z.number().nonnegative(),
  notes: z.string(),
});

export const extraBurnSchema = z.object({
  events: z.array(extraBurnEventSchema),
  totalCals: z.number().nonnegative(),
});

export const checkinSchema = z.object({
  energy: z.number().min(1).max(10),
  hunger: z.number().min(1).max(10),
  stress: z.number().min(1).max(10),
  libido: z.enum(['LOW', 'MED', 'HIGH']),
  mood: z.enum(['FOCUS', 'CALM', 'IRRITABLE', 'SAD', 'ANXIOUS']),
  notes: z.string().optional(),
});

export const recoverySchema = z.object({
  saunaMin: z.number().nonnegative(),
  vaporMin: z.number().nonnegative(),
  coldMin: z.number().nonnegative(),
});

export const inbodySchema = z.object({
  weight: z.number().nonnegative(),
  smm: z.number().nonnegative(),
  bf_percent: z.number().nonnegative(),
  bf_mass: z.number().nonnegative(),
  water: z.number().nonnegative(),
});

const moduleBaseSchema = z.object({
  targetDate: z.string(),
});

export const bioSchema = z.object({
  weightKg: z.number().nonnegative(),
  waistCm: z.number().nonnegative(),
  steps: z.number().int().nonnegative(),
  waterCups: z.number().int().min(0).max(10),
  suppsJson: suppsSchema,
});

export const gymSchema = z.object({
  workout: z.string(),
});

export const fuelSchema = z.object({
  macrosJson: macrosSchema,
  notes: z.string(),
});

export const extraSchema = z.object({
  extraBurnJson: extraBurnSchema,
});

export const sleepSchema = z.object({
  sleepHours: z.number().nonnegative(),
});

export const recoveryModuleSchema = z.object({
  recoveryJson: recoverySchema,
});

export const checkinModuleSchema = z.object({
  checkinJson: checkinSchema,
});

export const inbodyModuleSchema = z.object({
  inbodyJson: inbodySchema,
  waistCm: z.number().nonnegative().optional(),
});

export const modulePayloadSchema = z.discriminatedUnion('type', [
  moduleBaseSchema.extend({ type: z.literal('BIO'), payload: bioSchema }),
  moduleBaseSchema.extend({ type: z.literal('GYM'), payload: gymSchema }),
  moduleBaseSchema.extend({ type: z.literal('EXTRA'), payload: extraSchema }),
  moduleBaseSchema.extend({ type: z.literal('FUEL'), payload: fuelSchema }),
  moduleBaseSchema.extend({ type: z.literal('SLEEP'), payload: sleepSchema }),
  moduleBaseSchema.extend({ type: z.literal('RECOVERY'), payload: recoveryModuleSchema }),
  moduleBaseSchema.extend({ type: z.literal('CHECKIN'), payload: checkinModuleSchema }),
  moduleBaseSchema.extend({ type: z.literal('INBODY'), payload: inbodyModuleSchema }),
]);

export const defaultSupps = suppsSchema.parse({ creat: false, sod: false, mag: false, omega: false });
export const defaultMacros = macrosSchema.parse({ p: 0, c: 0, f: 0 });
export const defaultExtraBurn = extraBurnSchema.parse({ events: [], totalCals: 0 });
export const defaultRecovery = recoverySchema.parse({ saunaMin: 0, vaporMin: 0, coldMin: 0 });
export const defaultCheckin = checkinSchema.parse({
  energy: 5,
  hunger: 5,
  stress: 5,
  libido: 'MED',
  mood: 'CALM',
  notes: '',
});
export const defaultInbody = inbodySchema.parse({ weight: 0, smm: 0, bf_percent: 0, bf_mass: 0, water: 0 });

export const defaultGym = {
  gymMinutes: 0,
  gymType: 'WEIGHTS' as const,
  gymCals: 0,
};
