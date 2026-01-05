'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ExtraBurn, ExtraBurnEvent } from '@/lib/models';

const EVENT_TYPES: ExtraBurnEvent['type'][] = ['PADEL', 'FUTBOL', 'WALK_INCLINE', 'WALK', 'BOX', 'MOVE', 'OTHER'];

export type ExtraData = { extraBurnJson: ExtraBurn };

type Props = {
  data: ExtraData;
  weightKg: number;
  onChange: (next: ExtraData) => void;
  onSave: () => void;
  saving: boolean;
};

function calcCals(weightKg: number, factor: number, minutes: number) {
  const weight = weightKg > 0 ? weightKg : 97;
  return Math.round((factor * 3.5 * weight * minutes) / 200);
}

export function ExtraTab({ data, weightKg, onChange, onSave, saving }: Props) {
  const [form, setForm] = useState({ type: 'PADEL', min: 30, factor: 8, notes: '' });

  const nextCals = useMemo(() => calcCals(weightKg, form.factor, form.min), [form.factor, form.min, weightKg]);

  const addEvent = () => {
    const event: ExtraBurnEvent = {
      type: form.type as ExtraBurnEvent['type'],
      min: form.min,
      factor: form.factor,
      cals: nextCals,
      notes: form.notes,
    };
    const events = [...data.extraBurnJson.events, event];
    const totalCals = events.reduce((sum, item) => sum + item.cals, 0);
    onChange({ extraBurnJson: { events, totalCals } });
    setForm({ ...form, notes: '' });
  };

  const removeEvent = (index: number) => {
    const events = data.extraBurnJson.events.filter((_, idx) => idx !== index);
    const totalCals = events.reduce((sum, item) => sum + item.cals, 0);
    onChange({ extraBurnJson: { events, totalCals } });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="text-xs font-semibold text-text">Tipo</label>
          <select
            className="h-9 w-full rounded-md border border-border bg-panel px-2 text-sm text-text"
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-text">Minutos</label>
          <Input
            type="number"
            value={form.min}
            onChange={(event) => setForm({ ...form, min: Number(event.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text">Factor MET</label>
          <Input
            type="number"
            value={form.factor}
            onChange={(event) => setForm({ ...form, factor: Number(event.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text">Notas</label>
          <Input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-xs">
        <span>Calorías estimadas: {nextCals}</span>
        <Button size="sm" onClick={addEvent}>
          Agregar
        </Button>
      </div>

      <div className="space-y-2">
        {data.extraBurnJson.events.length === 0 ? (
          <p className="text-xs text-muted">Sin eventos extra.</p>
        ) : (
          data.extraBurnJson.events.map((event, index) => (
            <div key={`${event.type}-${index}`} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-xs">
              <div>
                <div className="font-semibold">{event.type}</div>
                <div>{event.min} min · MET {event.factor} · {event.cals} kcal</div>
                {event.notes && <div className="text-muted">{event.notes}</div>}
              </div>
              <Button variant="outline" size="sm" onClick={() => removeEvent(index)}>
                Quitar
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
        <span>Total extra burn: {data.extraBurnJson.totalCals} kcal</span>
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar EXTRA'}
        </Button>
      </div>
    </div>
  );
}
