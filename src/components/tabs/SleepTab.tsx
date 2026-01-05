import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type SleepData = { sleepHours: number };

type Props = {
  data: SleepData;
  onChange: (next: SleepData) => void;
  onSave: () => void;
  saving: boolean;
};

export function SleepTab({ data, onChange, onSave, saving }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-text">Horas de sueño</label>
        <Input type="number" value={data.sleepHours} onChange={(event) => onChange({ sleepHours: Number(event.target.value) })} />
      </div>
      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar SLEEP'}
      </Button>
    </div>
  );
}
