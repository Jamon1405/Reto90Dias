export type SupplementStack = {
  creat: boolean;
  sod: boolean;
  mag: boolean;
  omega: boolean;
};

export type Macros = {
  m: number;
  e: number;
  b: number;
};

export type ActivityTreadmillEntry = {
  id: string;
  speed: number;
  incline: number;
  minutes: number;
  kcal: number;
  ts: string;
};

export type ActivityManualEntry = {
  id: string;
  kind: 'PADEL' | 'FUTBOL' | 'PESAS';
  label: string;
  minutes: number;
  kcal: number;
  met: number;
  ts: string;
};

export type ActivityLog = {
  treadmill: ActivityTreadmillEntry[];
  manual: ActivityManualEntry[];
};

export type TitanFlags = {
  list: { code: string; msg: string }[];
  bmr: number;
  net: number;
};

export type TitanDay = {
  date: string;
  tsUpdated: string | null;
  weight: number;
  waist: number;
  workout: string;
  calIn: number;
  calOut: number;
  water: number;
  supps: SupplementStack;
  macros: Macros;
  fastHours: number;
  steps: number;
  notes: string;
  activity: ActivityLog;
  titanScore: number;
  flags: TitanFlags;
};

export type TitanState = {
  key: string;
  value: string | null;
};
