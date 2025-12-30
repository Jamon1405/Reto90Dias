import { z } from 'zod';

export const saveSchema = z.object({
  type: z.enum(['BIO', 'GYM', 'FUEL']),
  targetDate: z.string().regex(/\d{4}-\d{2}-\d{2}/),
  payload: z.record(z.unknown()),
});

export const fastSchema = z.object({
  action: z.enum(['START', 'STOP', 'RESET']),
});

export const dashboardSchema = z.object({
  date: z.string().regex(/\d{4}-\d{2}-\d{2}/).optional(),
});
