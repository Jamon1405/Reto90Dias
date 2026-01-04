import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Scale10, type ScaleAnchors } from '@/components/Scale10';
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

const energyAnchors: ScaleAnchors = {
  1: 'Zombie: can barely function, need to lie down',
  3: 'Low: sluggish, heavy, doing minimum',
  5: 'Normal: functional baseline',
  7: 'High: strong drive, productive',
  10: 'Peak: explosive, unstoppable (rare)',
};

const hungerAnchors: ScaleAnchors = {
  1: 'No hunger at all',
  3: 'Mild: can ignore easily',
  5: 'Moderate: noticeable but manageable',
  7: 'Strong: distracting, cravings emerging',
  10: 'Ravenous: hard to control, urgent',
};

const stressAnchors: ScaleAnchors = {
  1: 'Calm: relaxed, clear mind',
  3: 'Light: small tension, manageable',
  5: 'Moderate: persistent pressure',
  7: 'High: anxious/irritable, focus impaired',
  10: 'Overload: panic/overwhelmed, cannot function',
};

export function CheckinTab({ data, onChange, onSave, saving }: Props) {
  const update = (key: keyof Checkin, value: Checkin[keyof Checkin]) => {
    onChange({ checkinJson: { ...data.checkinJson, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <Scale10
        label="Energía"
        value={data.checkinJson.energy}
        anchors={energyAnchors}
        helperTitle="ENERGY 1–10"
        onChange={(value) => update('energy', value)}
      />
      <Scale10
        label="Hambre (menor es mejor)"
        value={data.checkinJson.hunger}
        anchors={hungerAnchors}
        helperTitle="HUNGER 1–10"
        onChange={(value) => update('hunger', value)}
      />
      <Scale10
        label="Estrés"
        value={data.checkinJson.stress}
        anchors={stressAnchors}
        helperTitle="STRESS 1–10"
        onChange={(value) => update('stress', value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-text">Libido</label>
          <select
            className="h-9 w-full rounded-md border border-border bg-panel px-2 text-sm text-text"
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
          <label className="text-xs font-semibold text-text">Mood</label>
          <select
            className="h-9 w-full rounded-md border border-border bg-panel px-2 text-sm text-text"
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

      <div>
        <label className="text-xs font-semibold text-text">Notas</label>
        <Textarea value={data.checkinJson.notes ?? ''} onChange={(event) => update('notes', event.target.value)} />
      </div>

      <Button onClick={onSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar CHECK-IN'}
      </Button>
    </div>
  );
}
