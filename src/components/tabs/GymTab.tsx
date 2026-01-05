'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getWorkoutPlan } from '@/lib/workoutPlan';

export type GymData = { workout: string };

export type OutBreakdown = {
  age: number;
  bmr: number;
  baseOut: number;
  gymOut: number;
  extraOut: number;
  totalOut: number;
  eventsCount: number;
  extraTotal: number;
  weightKg: number;
};

type Props = {
  data: GymData;
  breakdown: OutBreakdown;
  routineLabel: string;
  onCopyPlan: (text: string) => void;
  gymMinutes: number;
  gymType: 'WEIGHTS' | 'INCLINE_TREADMILL' | 'MIXED';
  onGymUpdate: (update: { gymMinutes: number; gymType: 'WEIGHTS' | 'INCLINE_TREADMILL' | 'MIXED' }) => void;
  onChange: (next: GymData) => void;
  onSave: () => void;
  saving: boolean;
};

export function GymTab({
  data,
  breakdown,
  routineLabel,
  onCopyPlan,
  gymMinutes,
  gymType,
  onGymUpdate,
  onChange,
  onSave,
  saving,
}: Props) {
  const [open, setOpen] = useState(false);
  const plan = useMemo(() => getWorkoutPlan(routineLabel), [routineLabel]);
  const planText = plan.items.join('\n');

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-surface p-3 text-xs">
        <div className="flex items-center justify-between text-text">
          <span className="font-semibold">ROUTINE FOR THIS DAY: {routineLabel}</span>
          <Button variant="outline" size="sm" onClick={() => onCopyPlan(planText)}>
            Copy plan to notes
          </Button>
        </div>
        <ul className="mt-2 space-y-1 text-muted">
          {plan.items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>

      <div>
        <label className="text-xs font-semibold text-text">Workout (GYM)</label>
        <Input value={data.workout} onChange={(event) => onChange({ workout: event.target.value })} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-text">Gym Minutes</label>
          <Input
            type="number"
            value={gymMinutes}
            onChange={(event) => onGymUpdate({ gymMinutes: Number(event.target.value) || 0, gymType })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text">Gym Type</label>
          <select
            className="h-9 w-full rounded-md border border-border bg-panel px-2 text-sm text-text"
            value={gymType}
            onChange={(event) =>
              onGymUpdate({
                gymMinutes,
                gymType: event.target.value as 'WEIGHTS' | 'INCLINE_TREADMILL' | 'MIXED',
              })
            }
          >
            <option value="WEIGHTS">WEIGHTS</option>
            <option value="INCLINE_TREADMILL">INCLINE_TREADMILL</option>
            <option value="MIXED">MIXED</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-3 text-xs text-muted">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>BMR: <span className="text-text font-semibold">{breakdown.bmr}</span></div>
          <div>Base OUT (BMR*1.2): <span className="text-text font-semibold">{breakdown.baseOut}</span></div>
          <div>Gym OUT: <span className="text-text font-semibold">{breakdown.gymOut}</span></div>
          <div>Extra OUT: <span className="text-text font-semibold">{breakdown.extraOut}</span></div>
          <div>Total OUT: <span className="text-text font-semibold">{breakdown.totalOut}</span></div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-3 text-xs">
        <button
          type="button"
          className="flex w-full items-center justify-between text-text"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="font-semibold">CAL_OUT Audit</span>
          <span className="text-muted">{open ? 'Ocultar' : 'Ver'}</span>
        </button>
        {open && (
          <div className="mt-2 space-y-1 text-muted">
            <div>weightKg: {breakdown.weightKg}</div>
            <div>age: {breakdown.age}</div>
            <div>BMR: {breakdown.bmr}</div>
            <div>baseOut: {breakdown.baseOut}</div>
            <div>gymOut: {breakdown.gymOut}</div>
            <div>extraOut: {breakdown.extraOut}</div>
            <div>totalOut: {breakdown.totalOut}</div>
            <div>extraBurn events: {breakdown.eventsCount}</div>
            <div>extraBurn totalCals: {breakdown.extraTotal}</div>
          </div>
        )}
      </div>

      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar GYM'}
      </Button>
    </div>
  );
}
