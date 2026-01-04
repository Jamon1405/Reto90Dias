import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type GymData = { workout: string };

type Props = {
  data: GymData;
  onChange: (next: GymData) => void;
  onSave: () => void;
  saving: boolean;
};

export function GymTab({ data, onChange, onSave, saving }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold">Workout (GYM)</label>
        <Input value={data.workout} onChange={(event) => onChange({ workout: event.target.value })} />
      </div>
      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar GYM'}
      </Button>
    </div>
  );
}
