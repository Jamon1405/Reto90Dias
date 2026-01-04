import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Supps } from '@/lib/models';

const WATER_RANGE = Array.from({ length: 11 }, (_, i) => i);

export type BioData = {
  weightKg: number;
  waistCm: number;
  steps: number;
  waterCups: number;
  suppsJson: Supps;
};

type Props = {
  data: BioData;
  onChange: (next: BioData) => void;
  onSave: () => void;
  saving: boolean;
};

export function BioTab({ data, onChange, onSave, saving }: Props) {
  const updateSupp = (key: keyof Supps) => {
    onChange({ ...data, suppsJson: { ...data.suppsJson, [key]: !data.suppsJson[key] } });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold text-text">Peso (kg)</label>
          <Input
            type="number"
            value={data.weightKg}
            onChange={(event) => onChange({ ...data, weightKg: Number(event.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text">Cintura (cm)</label>
          <Input
            type="number"
            value={data.waistCm}
            onChange={(event) => onChange({ ...data, waistCm: Number(event.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text">Pasos</label>
          <Input
            type="number"
            value={data.steps}
            onChange={(event) => onChange({ ...data, steps: Number(event.target.value) })}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-text">Agua (vasos)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {WATER_RANGE.map((value) => (
            <button
              key={value}
              type="button"
              className={`h-8 w-8 rounded-full border text-xs ${
                data.waterCups === value ? 'bg-accent text-white' : 'border-border text-text'
              }`}
              onClick={() => onChange({ ...data, waterCups: value })}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-text">Suplementos</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {([
            ['creat', 'Creatina'],
            ['sod', 'Sodio'],
            ['mag', 'Magnesio'],
            ['omega', 'Omega'],
          ] as Array<[keyof Supps, string]>).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs ${
                data.suppsJson[key] ? 'bg-success text-white' : 'border-border text-text'
              }`}
              onClick={() => updateSupp(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar BIO'}
      </Button>
    </div>
  );
}
