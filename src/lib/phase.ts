const SEASON_START = '2026-01-05';
const TARGET_DATE = '2026-03-15';

export type Phase = 'PRE-SEASON' | 'SEASON' | 'POST-SEASON';

export function phaseForDate(date: string): Phase {
  if (date < SEASON_START) return 'PRE-SEASON';
  if (date <= TARGET_DATE) return 'SEASON';
  return 'POST-SEASON';
}

export const SEASON_BOUNDARIES = {
  preSeasonEnd: '2026-01-04',
  seasonStart: SEASON_START,
  seasonEnd: TARGET_DATE,
};
