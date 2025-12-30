export type TitanDay = {
  date: string;
  tsUpdated: Date | null;
  weight: number;
  waist: number;
  workout: string;
  calIn: number;
  calOut: number;
  water: number;
  suppsJson: Record<string, boolean>;
  macrosJson: Record<string, number>;
  fastHours: number;
  steps: number;
  notes: string;
  activityJson: { entries?: ActivityEntry[] };
  titanScore: number;
  flagsJson: { list: { code: string; msg: string }[]; bmr: number; net: number } | null;
};

export type ActivityEntry = {
  label: string;
  minutes: number;
  calories: number;
};
