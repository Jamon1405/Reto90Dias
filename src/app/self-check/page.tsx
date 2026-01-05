'use client';

import { useMemo } from 'react';
import { buildMonthGrid, diffDays, todayISO_MX } from '@/lib/timezone';
import { computeBmr, computeCalOut, computeGymCals, computeRiskFlags, computeTitanScore, getAssignedRoutine } from '@/lib/calc';
import type { DayLog } from '@/lib/models';

function makeDay(dateISO: string, overrides: Partial<DayLog> = {}): DayLog {
  return {
    dateISO,
    updatedAt: null,
    weightKg: 80,
    waistCm: 0,
    steps: 8000,
    waterCups: 8,
    suppsJson: { creat: false, sod: false, mag: false, omega: false },
    workout: '',
    gymMinutes: 0,
    gymType: 'WEIGHTS',
    gymCals: 0,
    extraBurnJson: { events: [], totalCals: 0 },
    macrosJson: { p: 0, c: 0, f: 0 },
    calIn: 2000,
    calOut: 2200,
    fastingHours: 0,
    sleepHours: 7,
    recoveryJson: { saunaMin: 0, vaporMin: 0, coldMin: 0 },
    checkinJson: { energy: 5, hunger: 5, stress: 5, libido: 'MED', mood: 'CALM', notes: '' },
    inbodyJson: { weight: 0, smm: 0, bf_percent: 0, bf_mass: 0, water: 0 },
    notes: '',
    titanScore: 0,
    flagsJson: { list: [], bmr: 0, net: 0 },
    ...overrides,
  };
}

export default function SelfCheckPage() {
  const checks = useMemo(() => {
    const results: Array<{ label: string; pass: boolean; detail?: string }> = [];

    const today = todayISO_MX();
    results.push({ label: 'todayISO_MX format', pass: /^\d{4}-\d{2}-\d{2}$/.test(today), detail: today });

    results.push({ label: 'diffDays same day', pass: diffDays(today, today) === 0, detail: String(diffDays(today, today)) });

    const routine = getAssignedRoutine('2026-01-05');
    results.push({ label: 'getAssignedRoutine returns value', pass: Boolean(routine), detail: routine });

    const bmr = computeBmr(80, today);
    results.push({ label: 'computeBmr returns number', pass: Number.isFinite(bmr), detail: String(bmr) });

    const gymOut = computeGymCals({ weightKg: 80, minutes: 45, gymType: 'WEIGHTS' });
    results.push({ label: 'computeGymCals returns number', pass: Number.isFinite(gymOut), detail: String(gymOut) });

    const calOut = computeCalOut({ bmr, extraBurn: 200, gymOut });
    results.push({ label: 'computeCalOut returns number', pass: Number.isFinite(calOut), detail: String(calOut) });

    const score = computeTitanScore({ net: -200, waterCups: 8, steps: 8000, calOut });
    results.push({ label: 'computeTitanScore returns number', pass: Number.isFinite(score), detail: String(score) });

    const day = makeDay(today, { calIn: 1800, calOut: 2200, weightKg: 80 });
    const yesterday = makeDay('2026-01-04', { calIn: 2000, calOut: 2100, weightKg: 79.6 });
    const twoDays = makeDay('2026-01-03', { calIn: 2100, calOut: 2000, weightKg: 79.4 });
    const flags = computeRiskFlags({ log: day, previousWeight: yesterday.weightKg, lastThree: [day, yesterday, twoDays], nowIso: today });
    results.push({ label: 'computeRiskFlags returns list', pass: Array.isArray(flags.flags), detail: String(flags.flags.length) });

    const grid = buildMonthGrid(2026, 1);
    results.push({ label: 'month grid length 42', pass: grid.length === 42, detail: String(grid.length) });

    return results;
  }, []);

  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-text">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold">Self Check</h1>
        <ul className="space-y-2 text-sm">
          {checks.map((check) => (
            <li key={check.label} className="rounded-md border border-border bg-panel p-3">
              <div className="flex items-center justify-between">
                <span>{check.label}</span>
                <span className={check.pass ? 'text-success' : 'text-danger'}>{check.pass ? 'PASS' : 'FAIL'}</span>
              </div>
              {check.detail && <div className="text-xs text-muted">{check.detail}</div>}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
