import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Recovery } from '@/lib/models';

export type RecoveryData = { recoveryJson: Recovery };

type Props = {
  data: RecoveryData;
  onChange: (next: RecoveryData) => void;
  onSave: () => void;
  saving: boolean;
};

export function RecoveryTab({ data, onChange, onSave, saving }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold">Sauna (min)</label>
          <Input
            type="number"
            value={data.recoveryJson.saunaMin}
            onChange={(event) =>
              onChange({ ...data, recoveryJson: { ...data.recoveryJson, saunaMin: Number(event.target.value) } })
            }
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Vapor (min)</label>
          <Input
            type="number"
            value={data.recoveryJson.vaporMin}
            onChange={(event) =>
              onChange({ ...data, recoveryJson: { ...data.recoveryJson, vaporMin: Number(event.target.value) } })
            }
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Cold (min)</label>
          <Input
            type="number"
            value={data.recoveryJson.coldMin}
            onChange={(event) =>
              onChange({ ...data, recoveryJson: { ...data.recoveryJson, coldMin: Number(event.target.value) } })
            }
          />
        </div>
      </div>
      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar RECOVERY'}
      </Button>
    </div>
  );
}
