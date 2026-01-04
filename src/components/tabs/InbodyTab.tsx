import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Inbody } from '@/lib/models';

export type InbodyData = { inbodyJson: Inbody; waistCm: number };

type Props = {
  data: InbodyData;
  onChange: (next: InbodyData) => void;
  onSave: () => void;
  saving: boolean;
};

export function InbodyTab({ data, onChange, onSave, saving }: Props) {
  const update = (key: keyof Inbody, value: number) => {
    onChange({ ...data, inbodyJson: { ...data.inbodyJson, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {(['weight', 'smm', 'bf_percent', 'bf_mass', 'water'] as const).map((field) => (
          <div key={field}>
            <label className="text-xs font-semibold">{field.replace('_', ' ').toUpperCase()}</label>
            <Input type="number" value={data.inbodyJson[field]} onChange={(event) => update(field, Number(event.target.value))} />
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold">Waist (cm)</label>
          <Input type="number" value={data.waistCm} onChange={(event) => onChange({ ...data, waistCm: Number(event.target.value) })} />
        </div>
      </div>
      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar INBODY'}
      </Button>
    </div>
  );
}
