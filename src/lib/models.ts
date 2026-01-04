export type Supps = { creat: boolean; sod: boolean; mag: boolean; omega: boolean };
export type Macros = { p: number; c: number; f: number };
export type ExtraBurnEvent = {
  type: 'PADEL' | 'FUTBOL' | 'WALK_INCLINE' | 'WALK' | 'BOX' | 'MOVE' | 'OTHER';
  min: number;
  factor: number;
  cals: number;
  notes: string;
};
export type ExtraBurn = { events: ExtraBurnEvent[]; totalCals: number };
export type Checkin = {
  energy: number;
  hunger: number;
  stress: number;
  libido: 'LOW' | 'MED' | 'HIGH';
  mood: 'FOCUS' | 'CALM' | 'IRRITABLE' | 'SAD' | 'ANXIOUS';
};
export type Recovery = { saunaMin: number; vaporMin: number; coldMin: number };
export type Inbody = { weight: number; smm: number; bf_percent: number; bf_mass: number; water: number };

export type DayLog = {
  dateISO: string;
  weightKg: number;
  waistCm: number;
  steps: number;
  waterCups: number;
  suppsJson: Supps;
  workout: string;
  extraBurnJson: ExtraBurn;
  macrosJson: Macros;
  calIn: number;
  calOut: number;
  fastingHours: number;
  sleepHours: number;
  recoveryJson: Recovery;
  checkinJson: Checkin;
  inbodyJson: Inbody;
  notes: string;
  titanScore: number;
  flagsJson: { list: Array<{ code: string; msg: string }>; bmr: number; net: number };
  net?: number;
  bmr?: number;
};
