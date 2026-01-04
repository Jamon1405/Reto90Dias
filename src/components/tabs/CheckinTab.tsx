import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Checkin } from '@/lib/models';

export type CheckinData = { checkinJson: Checkin };

type Props = {
  data: CheckinData;
  onChange: (next: CheckinData) => void;
  onSave: () => void;
  saving: boolean;
};

const moodOptions: Checkin['mood'][] = ['FOCUS', 'CALM', 'IRRITABLE', 'SAD', 'ANXIOUS'];
const libidoOptions: Checkin['libido'][] = ['LOW', 'MED', 'HIGH'];

export function CheckinTab({ data, onChange, onSave, saving }: Props) {
  const update = (key: keyof Checkin, value: Checkin[keyof Checkin]) => {
    onChange({ checkinJson: { ...data.checkinJson, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {(['energy', 'hunger', 'stress'] as const).map((field) => (
          <div key={field}>
            <label className="text-xs font-semibold">{field.toUpperCase()}</label>
            <Input
              type="number"
              value={data.checkinJson[field]}
              onChange={(event) => update(field, Number(event.target.value))}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold">Libido</label>
          <select
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
            value={data.checkinJson.libido}
            onChange={(event) => update('libido', event.target.value as Checkin['libido'])}
          >
            {libidoOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold">Mood</label>
          <select
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
            value={data.checkinJson.mood}
            onChange={(event) => update('mood', event.target.value as Checkin['mood'])}
          >
            {moodOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar CHECK-IN'}
      </Button>
    </div>
  );
}
