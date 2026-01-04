import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Macros } from '@/lib/models';

export type FuelData = { macrosJson: Macros; notes: string };

type Props = {
  data: FuelData;
  calIn: number;
  onChange: (next: FuelData) => void;
  onSave: () => void;
  saving: boolean;
};

export function FuelTab({ data, calIn, onChange, onSave, saving }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold">Proteína (g)</label>
          <Input
            type="number"
            value={data.macrosJson.p}
            onChange={(event) => onChange({ ...data, macrosJson: { ...data.macrosJson, p: Number(event.target.value) } })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Carbs (g)</label>
          <Input
            type="number"
            value={data.macrosJson.c}
            onChange={(event) => onChange({ ...data, macrosJson: { ...data.macrosJson, c: Number(event.target.value) } })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Grasa (g)</label>
          <Input
            type="number"
            value={data.macrosJson.f}
            onChange={(event) => onChange({ ...data, macrosJson: { ...data.macrosJson, f: Number(event.target.value) } })}
          />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">Cal IN: {calIn} kcal</div>

      <div>
        <label className="text-xs font-semibold">Notas</label>
        <Textarea value={data.notes} onChange={(event) => onChange({ ...data, notes: event.target.value })} />
      </div>

      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar FUEL'}
      </Button>
    </div>
  );
}
