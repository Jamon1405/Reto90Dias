'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type GymData = { workout: string };

export type OutBreakdown = {
  age: number;
  bmr: number;
  baseOut: number;
  extraOut: number;
  totalOut: number;
  eventsCount: number;
  extraTotal: number;
  weightKg: number;
};

type Props = {
  data: GymData;
  breakdown: OutBreakdown;
  onChange: (next: GymData) => void;
  onSave: () => void;
  saving: boolean;
};

export function GymTab({ data, breakdown, onChange, onSave, saving }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-text">Workout (GYM)</label>
        <Input value={data.workout} onChange={(event) => onChange({ workout: event.target.value })} />
      </div>

      <div className="rounded-md border border-border bg-surface p-3 text-xs text-muted">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>BMR: <span className="text-text font-semibold">{breakdown.bmr}</span></div>
          <div>Base OUT (BMR*1.2): <span className="text-text font-semibold">{breakdown.baseOut}</span></div>
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
