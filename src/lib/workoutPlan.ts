const chestBiceps = [
  'Incline DB Press: 4x6–10 RIR 0–1 tempo 3-0-1 rest 150s',
  'Flat Machine/Smith Press: 3x8–12 RIR 0–1 rest 120s',
  'Dips or Decline Press: 3x6–10 RIR 0–1 rest 120s',
  'Cable Fly: 3x12–15 RIR 0–1 tempo 2-1-2 rest 90s',
  'Incline DB Curl: 3x8–12 RIR 0–1 rest 120s',
  'Preacher Curl: 3x10–15 RIR 0–1 rest 90s',
  'Hammer Curl: 2x12–15 RIR 0 rest 75s',
];

const backTriceps = [
  'Lat Pulldown Neutral: 4x6–10 RIR 0–1 rest 150s',
  'Chest-Supported Row: 4x8–12 RIR 0–1 rest 120s',
  'Unilateral Row: 3x10–12 RIR 0–1 rest 120s',
  'Cable Pullover: 3x12–15 RIR 0–1 rest 90s',
  'Assisted Dips or Close-Grip Press: 3x6–10 RIR 0–1 rest 150s',
  'Overhead Rope Extension: 3x10–15 RIR 0–1 rest 90s',
  'Pushdown: 2x12–15 RIR 0 rest 75s',
];

const legsShoulders = [
  'Hack Squat or Back Squat: 4x6–10 RIR 0–1 rest 180s',
  'Leg Press: 4x10–15 RIR 0–1 rest 150s',
  'RDL or Seated Curl: 4x8–12 RIR 0–1 rest 120s',
  'Leg Extension: 3x12–15 RIR 0–1 rest 90s',
  'Lying Leg Curl: 3x10–15 RIR 0–1 rest 90s',
  'Lateral Raise: 4x12–20 RIR 0–1 rest 75s',
  'Shoulder Press: 3x6–10 RIR 0–1 rest 120s',
  'Rear Delt Fly: 3x12–20 RIR 0–1 rest 75s',
];

const rest = ['Optional walk 20–40 min', 'Mobility + recovery'];

export function getWorkoutPlan(routine: string) {
  if (routine === 'CHEST / BICEPS') return { name: routine, items: chestBiceps };
  if (routine === 'BACK / TRICEPS') return { name: routine, items: backTriceps };
  if (routine === 'LEGS / SHOULDERS') return { name: routine, items: legsShoulders };
  return { name: 'REST', items: rest };
}
