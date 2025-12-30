'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const TAB_OPTIONS = ['Dash', 'Bio', 'Gym', 'Fuel', 'Data', 'Protocol'] as const;

type TabOption = (typeof TAB_OPTIONS)[number];

type Flags = { list: { code: string; msg: string }[]; bmr: number; net: number };

type DayLog = {
  date: string;
  weight: number;
  steps: number;
  water: number;
  suppsJson: Record<string, boolean>;
  fastHours: number;
  workout: string;
  calOut: number;
  activityJson: { entries?: ActivityEntry[] };
  calIn: number;
  macrosJson: Record<string, number>;
  notes: string;
  titanScore: number;
  bmr?: number;
  net?: number;
  titanScoreComputed?: number;
  flagsComputed?: Flags;
};

type ActivityEntry = { label: string; minutes: number; calories: number };

type DashboardResponse = {
  success: boolean;
  meta: {
    targetDate: string;
    todayStr: string;
    daysLeft: number;
    season: string;
    fastStartMs: number | null;
    nowIso: string;
  };
  user: {
    age: number;
    lastWeight: number;
  };
  dayLog: DayLog;
  calendar: { date: string; score: number }[];
  history: Array<DayLog & { net: number; score: number }>;
};

const SUPPS = ['Creatina', 'Sodio', 'Magnesio', 'Omega'];
const TACTICAL_AGENDA = [
  '05:00 - WAKE / HYDRATE',
  '06:00 - MOVEMENT / REVIEW',
  '12:00 - AUDIT CHECK',
  '18:00 - WATER VERIFY',
  '22:30 - WIND DOWN',
];

const ROUTINE_BY_DAY: Record<number, string> = {
  0: 'DESCANSO',
  1: 'PECHO/BICEPS',
  2: 'ESPALDA/TRICEPS',
  3: 'PIERNA/HOMBRO',
  4: 'PECHO/BICEPS',
  5: 'ESPALDA/TRICEPS',
  6: 'PIERNA/HOMBRO',
};

const ACTIVITY_PRESETS = [
  { label: 'Pádel', factor: 6 },
  { label: 'Fútbol', factor: 8 },
  { label: 'Pesas', factor: 5 },
];

function formatDateDisplay(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function addDays(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utc = Date.UTC(year, month - 1, day + days);
  const date = new Date(utc);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;
}

function getWeekday(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCDay();
}

function scoreColor(score: number) {
  if (score >= 80) return 'bg-success/60 border-success';
  if (score >= 60) return 'bg-warning/60 border-warning';
  return 'bg-danger/60 border-danger';
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabOption>('Dash');
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [activeDate, setActiveDate] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fastElapsed, setFastElapsed] = useState<number>(0);

  const [bioState, setBioState] = useState({
    weight: 0,
    steps: 0,
    water: 0,
    suppsJson: {} as Record<string, boolean>,
  });

  const [gymState, setGymState] = useState<{
    workout: string;
    activityJson: { entries: ActivityEntry[] };
    treadmill: { speed: number; incline: number; minutes: number };
    quickMinutes: number;
  }>({
    workout: '',
    activityJson: { entries: [] },
    treadmill: { speed: 0, incline: 0, minutes: 0 },
    quickMinutes: 0,
  });

  const [fuelState, setFuelState] = useState<{
    macrosJson: { meatGrams: number; eggs: number; butterGrams: number };
    notes: string;
  }>({
    macrosJson: { meatGrams: 0, eggs: 0, butterGrams: 0 },
    notes: '',
  });

  const lastSnapshots = useRef({ bio: '', gym: '', fuel: '' });
  const savingRef = useRef(false);

  const dayLog = data?.dayLog;
  const todayStr = data?.meta.todayStr ?? '';

  const weightForCalc = useMemo(() => {
    if (dayLog?.weight && dayLog.weight > 0) return dayLog.weight;
    return data?.user.lastWeight ?? 0;
  }, [dayLog?.weight, data?.user.lastWeight]);

  const routineLabel = useMemo(() => {
    if (!activeDate) return '';
    return ROUTINE_BY_DAY[getWeekday(activeDate)] ?? '';
  }, [activeDate]);

  const extraBurn = useMemo(() => {
    return gymState.activityJson.entries?.reduce((sum, entry) => sum + entry.calories, 0) ?? 0;
  }, [gymState.activityJson.entries]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!dayLog) return;
    const nextBio = {
      weight: dayLog.weight ?? 0,
      steps: dayLog.steps ?? 0,
      water: dayLog.water ?? 0,
      suppsJson: dayLog.suppsJson ?? {},
    };
    const nextGym = {
      workout: dayLog.workout ?? '',
      activityJson: { entries: dayLog.activityJson?.entries ?? [] },
    };
    const nextFuel = {
      macrosJson: {
        meatGrams: Number(dayLog.macrosJson?.meatGrams ?? 0),
        eggs: Number(dayLog.macrosJson?.eggs ?? 0),
        butterGrams: Number(dayLog.macrosJson?.butterGrams ?? 0),
      },
      notes: dayLog.notes ?? '',
    };
    setBioState(nextBio);
    setGymState((prev) => ({
      ...prev,
      ...nextGym,
    }));
    setFuelState(nextFuel);
    lastSnapshots.current = {
      bio: JSON.stringify(nextBio),
      gym: JSON.stringify({ workout: nextGym.workout, activityJson: nextGym.activityJson }),
      fuel: JSON.stringify(nextFuel),
    };
  }, [dayLog?.date]);

  useEffect(() => {
    if (!data?.meta.fastStartMs) {
      setFastElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setFastElapsed((Date.now() - data.meta.fastStartMs!) / 3600000);
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.meta.fastStartMs]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!data || activeDate !== todayStr || savingRef.current) return;
      const bioSnapshot = JSON.stringify(bioState);
      const gymSnapshot = JSON.stringify({ workout: gymState.workout, activityJson: gymState.activityJson });
      const fuelSnapshot = JSON.stringify(fuelState);

      const saves: Array<Promise<void>> = [];
      if (bioSnapshot !== lastSnapshots.current.bio) {
        saves.push(handleSave('BIO', bioState));
        lastSnapshots.current.bio = bioSnapshot;
      }
      if (gymSnapshot !== lastSnapshots.current.gym) {
        saves.push(handleSave('GYM', { workout: gymState.workout, activityJson: gymState.activityJson }));
        lastSnapshots.current.gym = gymSnapshot;
      }
      if (fuelSnapshot !== lastSnapshots.current.fuel) {
        saves.push(handleSave('FUEL', fuelState));
        lastSnapshots.current.fuel = fuelSnapshot;
      }
      if (saves.length > 0) {
        Promise.all(saves).catch(() => undefined);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [bioState, fuelState, gymState.activityJson, gymState.workout, activeDate, todayStr, data]);

  useEffect(() => {
    if (!data || activeDate !== todayStr) return;
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const endUtc = Date.UTC(
      Number(lookup.year),
      Number(lookup.month) - 1,
      Number(lookup.day),
      23,
      59,
      59,
    );
    const nowUtc = Date.UTC(
      Number(lookup.year),
      Number(lookup.month) - 1,
      Number(lookup.day),
      Number(lookup.hour),
      Number(lookup.minute),
      Number(lookup.second),
    );
    const diff = Math.max(0, endUtc - nowUtc);
    const timeout = setTimeout(() => {
      if (activeDate === todayStr) {
        handleSave('BIO', bioState);
        handleSave('GYM', { workout: gymState.workout, activityJson: gymState.activityJson });
        handleSave('FUEL', fuelState);
      }
    }, diff);
    return () => clearTimeout(timeout);
  }, [data, activeDate, todayStr, bioState, fuelState, gymState.activityJson, gymState.workout]);

  async function parseResponse(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return { success: false, error: 'Respuesta vacía del servidor.' };
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, error: text };
    }
  }

  async function fetchDashboard(date?: string) {
    try {
      setError(null);
      const response = await fetch(`/api/dashboard${date ? `?date=${date}` : ''}`);
      const json = await parseResponse(response);
      if (!response.ok) {
        throw new Error((json as { error?: string }).error ?? 'Error cargando dashboard');
      }
      if (!json.success) throw new Error('Respuesta inválida');
      const dashboard = json as DashboardResponse;
      setData(dashboard);
      setActiveDate(dashboard.meta.targetDate);
      setToast(null);
      lastSnapshots.current = { bio: '', gym: '', fuel: '' };
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar');
    }
  }

  async function handleSave(type: 'BIO' | 'GYM' | 'FUEL', payload: any) {
    try {
      setToast('GUARDANDO...');
      savingRef.current = true;
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetDate: activeDate, payload }),
      });
      const json = await parseResponse(response);
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Error de guardado');
      }
      setData(json);
      setActiveDate(json.meta.targetDate);
      lastSnapshots.current = {
        bio: JSON.stringify(bioState),
        gym: JSON.stringify({ workout: gymState.workout, activityJson: gymState.activityJson }),
        fuel: JSON.stringify(fuelState),
      };
      setToast('LISTO');
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      setError(err.message ?? 'Error guardando');
    } finally {
      savingRef.current = false;
    }
  }

  async function handleFast(action: 'START' | 'STOP' | 'RESET') {
    try {
      setToast('GUARDANDO...');
      const response = await fetch('/api/fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await parseResponse(response);
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Error ayuno');
      }
      if (json.dayLog && json.meta) {
        setData(json);
        setActiveDate(json.meta.targetDate);
      } else {
        setData((prev) =>
          prev
            ? {
                ...prev,
                meta: {
                  ...prev.meta,
                  fastStartMs: json.meta.fastStartMs ?? null,
                },
              }
            : prev,
        );
      }
      setToast('LISTO');
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      setError(err.message ?? 'Error ayuno');
    }
  }

  const handleDateMove = (direction: number) => {
    if (!activeDate || !data) return;
    const next = addDays(activeDate, direction);
    if (direction > 0 && next > todayStr) return;
    fetchDashboard(next);
  };

  const handleSuppToggle = (supp: string) => {
    setBioState((prev) => ({
      ...prev,
      suppsJson: { ...prev.suppsJson, [supp]: !prev.suppsJson[supp] },
    }));
  };

  const handleWaterSet = (count: number) => {
    setBioState((prev) => ({ ...prev, water: count }));
  };

  const treadmillCalories = useMemo(() => {
    const { speed, incline, minutes } = gymState.treadmill;
    if (!speed || !minutes) return 0;
    const met = Math.max(1, speed * 0.9 + incline * 0.3);
    return Math.round(met * (weightForCalc || 0) * (minutes / 60));
  }, [gymState.treadmill, weightForCalc]);

  const handleAddTreadmill = () => {
    if (!treadmillCalories) return;
    const entry: ActivityEntry = {
      label: `TREADMILL ${gymState.treadmill.speed}km/h ${gymState.treadmill.incline}%`,
      minutes: gymState.treadmill.minutes,
      calories: treadmillCalories,
    };
    setGymState((prev) => ({
      ...prev,
      activityJson: { entries: [...(prev.activityJson.entries ?? []), entry] },
    }));
  };

  const handleAddPreset = (label: string, factor: number) => {
    if (!gymState.quickMinutes) return;
    const calories = Math.round(factor * (weightForCalc || 0) * (gymState.quickMinutes / 60));
    const entry: ActivityEntry = { label, minutes: gymState.quickMinutes, calories };
    setGymState((prev) => ({
      ...prev,
      activityJson: { entries: [...(prev.activityJson.entries ?? []), entry] },
    }));
  };

  const handleRemoveEntry = (index: number) => {
    setGymState((prev) => ({
      ...prev,
      activityJson: {
        entries: (prev.activityJson.entries ?? []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleTrash = (module: 'BIO' | 'GYM' | 'FUEL') => {
    if (module === 'BIO') {
      const payload = { weight: 0, steps: 0, water: 0, suppsJson: {} };
      setBioState(payload);
      handleSave('BIO', payload);
    }
    if (module === 'GYM') {
      const payload = { workout: '', activityJson: { entries: [] } };
      setGymState((prev) => ({ ...prev, workout: '', activityJson: { entries: [] } }));
      handleSave('GYM', payload);
    }
    if (module === 'FUEL') {
      const payload = { macrosJson: {}, notes: '' };
      setFuelState({ macrosJson: { meatGrams: 0, eggs: 0, butterGrams: 0 }, notes: '' });
      handleSave('FUEL', payload);
    }
  };

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-slate-300">
        Cargando TITAN OMEGA...
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 lg:px-10 text-sm">
      <header className="flex flex-col gap-4 border border-slateborder bg-slatepanel/80 p-4 rounded-xl shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-[0.3em] text-accent">TITAN OMEGA</h1>
            <p className="text-xs text-slate-400">ERP Biométrico · CDMX LOCK</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full border border-slateborder bg-slatebase">
              {data.meta.season}
            </span>
            <span className="text-slate-300">HYROX - {data.meta.daysLeft} días</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDateMove(-1)}
              className="px-3 py-2 border border-slateborder rounded-lg hover:border-accent"
            >
              ◀
            </button>
            <div className="text-sm font-mono tracking-widest">{formatDateDisplay(activeDate)}</div>
            <button
              onClick={() => handleDateMove(1)}
              className="px-3 py-2 border border-slateborder rounded-lg hover:border-accent disabled:opacity-40"
              disabled={activeDate >= todayStr}
            >
              ▶
            </button>
          </div>
          <div className="flex gap-2">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-lg text-xs uppercase tracking-[0.2em] border ${
                  activeTab === tab
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'border-slateborder text-slate-400 hover:text-accent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {toast && (
        <div className="mt-4 text-xs uppercase tracking-[0.3em] text-accent">{toast}</div>
      )}
      {error && <div className="mt-4 text-xs text-danger">{error}</div>}

      {activeTab === 'Dash' && dayLog && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4">
            <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">P&L</h2>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-slate-400">IN</p>
                  <p className="text-lg font-semibold">{dayLog.calIn}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">OUT</p>
                  <p className="text-lg font-semibold">{dayLog.calOut}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">NET</p>
                  <p
                    className={`text-lg font-semibold ${
                      (dayLog.net ?? 0) <= 0 ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {dayLog.net}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                BMR: {dayLog.bmr} · Titan Score: {dayLog.titanScoreComputed}
              </div>
            </div>

            <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">RISK FLAGS</h2>
              <div className="mt-3 space-y-2">
                {dayLog.flagsComputed?.list?.length ? (
                  dayLog.flagsComputed.list.map((flag) => (
                    <div
                      key={flag.code}
                      className="border border-danger/60 bg-danger/10 px-3 py-2 rounded-lg text-xs"
                    >
                      {flag.code} · {flag.msg}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">SIN ALERTAS</div>
                )}
              </div>
            </div>

            <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">TACTICAL AGENDA</h2>
              <ul className="mt-3 space-y-1 text-xs text-slate-300">
                {TACTICAL_AGENDA.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-accent">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">FASTING</h2>
              <div className="mt-3 text-lg font-semibold">
                {data.meta.fastStartMs ? `${fastElapsed.toFixed(2)} h` : `${dayLog.fastHours} h`}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleFast('START')}
                  className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent"
                >
                  START
                </button>
                <button
                  onClick={() => handleFast('STOP')}
                  className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent"
                >
                  STOP
                </button>
                <button
                  onClick={() => handleFast('RESET')}
                  className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent"
                >
                  RESET
                </button>
              </div>
            </div>

            <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">METRICS</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">Weight</p>
                  <p className="text-base">{dayLog.weight || data.user.lastWeight} kg</p>
                </div>
                <div>
                  <p className="text-slate-400">Steps</p>
                  <p className="text-base">{dayLog.steps}</p>
                </div>
                <div>
                  <p className="text-slate-400">Water</p>
                  <p className="text-base">{dayLog.water}/10</p>
                </div>
                <div>
                  <p className="text-slate-400">Routine</p>
                  <p className="text-base">{routineLabel}</p>
                </div>
              </div>
            </div>

            <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">DB STATUS</h2>
              <p className="mt-2 text-xs text-slate-400">Último guardado: {dayLog.date}</p>
              <p className="text-xs text-slate-500">IN {dayLog.calIn} · OUT {dayLog.calOut}</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'Bio' && dayLog && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">BIO MODULE</h2>
              <button onClick={() => handleTrash('BIO')} className="text-xs text-danger">
                TRASH
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-slate-400">
                Weight (kg)
                <input
                  type="number"
                  value={bioState.weight}
                  onChange={(e) => setBioState((prev) => ({ ...prev, weight: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-400">
                Steps
                <input
                  type="number"
                  value={bioState.steps}
                  onChange={(e) => setBioState((prev) => ({ ...prev, steps: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div>
              <p className="text-xs text-slate-400">Water Blocks</p>
              <div className="mt-2 grid grid-cols-10 gap-2">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleWaterSet(idx + 1)}
                    className={`h-8 rounded-lg border ${
                      bioState.water >= idx + 1
                        ? 'bg-accent/30 border-accent'
                        : 'border-slateborder bg-slatebase'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Supps Stack</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {SUPPS.map((supp) => (
                  <label key={supp} className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(bioState.suppsJson[supp])}
                      onChange={() => handleSuppToggle(supp)}
                    />
                    {supp}
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleSave('BIO', bioState)}
              className="w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
            >
              GUARDAR BIO
            </button>
            <p className="text-xs text-slate-500">DB: weight {dayLog.weight} · steps {dayLog.steps} · water {dayLog.water}</p>
          </div>

          <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
            <h2 className="text-xs tracking-[0.3em] text-slate-400">FASTING TIMER</h2>
            <div className="mt-3 text-lg font-semibold">
              {data.meta.fastStartMs ? `${fastElapsed.toFixed(2)} h` : `${dayLog.fastHours} h`}
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Timer persistente en servidor.
            </div>
          </div>
        </section>
      )}

      {activeTab === 'Gym' && dayLog && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">GYM MODULE</h2>
              <button onClick={() => handleTrash('GYM')} className="text-xs text-danger">
                TRASH
              </button>
            </div>
            <label className="text-xs text-slate-400">
              Workout Label
              <input
                type="text"
                value={gymState.workout}
                onChange={(e) => setGymState((prev) => ({ ...prev, workout: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs text-slate-400">
                Speed km/h
                <input
                  type="number"
                  value={gymState.treadmill.speed}
                  onChange={(e) =>
                    setGymState((prev) => ({
                      ...prev,
                      treadmill: { ...prev.treadmill, speed: Number(e.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-400">
                Incline %
                <input
                  type="number"
                  value={gymState.treadmill.incline}
                  onChange={(e) =>
                    setGymState((prev) => ({
                      ...prev,
                      treadmill: { ...prev.treadmill, incline: Number(e.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-400">
                Minutes
                <input
                  type="number"
                  value={gymState.treadmill.minutes}
                  onChange={(e) =>
                    setGymState((prev) => ({
                      ...prev,
                      treadmill: { ...prev.treadmill, minutes: Number(e.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimado: {treadmillCalories} kcal</span>
              <button
                onClick={handleAddTreadmill}
                className="px-3 py-2 border border-accent rounded-lg text-accent"
              >
                + SUMAR
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-400">Quick Add</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  type="number"
                  value={gymState.quickMinutes}
                  onChange={(e) => setGymState((prev) => ({ ...prev, quickMinutes: Number(e.target.value) }))}
                  placeholder="Min"
                  className="w-24 rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                />
                {ACTIVITY_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleAddPreset(preset.label, preset.factor)}
                    className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Activity Log</p>
              <div className="mt-2 space-y-2">
                {(gymState.activityJson.entries ?? []).map((entry, index) => (
                  <div
                    key={`${entry.label}-${index}`}
                    className="flex items-center justify-between border border-slateborder rounded-lg px-3 py-2 text-xs"
                  >
                    <span>
                      {entry.label} · {entry.minutes}m · {entry.calories} kcal
                    </span>
                    <button onClick={() => handleRemoveEntry(index)} className="text-danger">
                      remove
                    </button>
                  </div>
                ))}
                {gymState.activityJson.entries?.length === 0 && (
                  <div className="text-xs text-slate-500">Sin actividades.</div>
                )}
              </div>
            </div>
            <button
              onClick={() => handleSave('GYM', { workout: gymState.workout, activityJson: gymState.activityJson })}
              className="w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
            >
              GUARDAR GYM
            </button>
            <p className="text-xs text-slate-500">DB: OUT {dayLog.calOut} · extra {extraBurn} kcal</p>
          </div>

          <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4 space-y-3">
            <h2 className="text-xs tracking-[0.3em] text-slate-400">BMR & ROUTINE</h2>
            <div className="text-xs text-slate-400">BMR {dayLog.bmr} kcal</div>
            <div className="text-xs text-slate-400">Routine {routineLabel}</div>
            <div className="text-xs text-slate-400">Cal OUT {dayLog.calOut}</div>
          </div>
        </section>
      )}

      {activeTab === 'Fuel' && dayLog && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">FUEL MODULE</h2>
              <button onClick={() => handleTrash('FUEL')} className="text-xs text-danger">
                TRASH
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs text-slate-400">
                Meat (g)
                <input
                  type="number"
                  value={fuelState.macrosJson.meatGrams}
                  onChange={(e) =>
                    setFuelState((prev) => ({
                      ...prev,
                      macrosJson: { ...prev.macrosJson, meatGrams: Number(e.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-400">
                Eggs
                <input
                  type="number"
                  value={fuelState.macrosJson.eggs}
                  onChange={(e) =>
                    setFuelState((prev) => ({
                      ...prev,
                      macrosJson: { ...prev.macrosJson, eggs: Number(e.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-400">
                Butter (g)
                <input
                  type="number"
                  value={fuelState.macrosJson.butterGrams}
                  onChange={(e) =>
                    setFuelState((prev) => ({
                      ...prev,
                      macrosJson: { ...prev.macrosJson, butterGrams: Number(e.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="text-xs text-slate-400">
              Notes
              <textarea
                value={fuelState.notes}
                onChange={(e) => setFuelState((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-sm"
                rows={4}
              />
            </label>
            <button
              onClick={() => handleSave('FUEL', fuelState)}
              className="w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
            >
              GUARDAR FUEL
            </button>
            <p className="text-xs text-slate-500">DB: IN {dayLog.calIn}</p>
          </div>

          <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
            <h2 className="text-xs tracking-[0.3em] text-slate-400">CONVERSION</h2>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li>Meat g × 2.5</li>
              <li>Eggs × 75</li>
              <li>Butter g × 7.2</li>
            </ul>
            <div className="mt-3 text-xs text-slate-400">Total IN (DB): {dayLog.calIn}</div>
          </div>
        </section>
      )}

      {activeTab === 'Data' && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
            <h2 className="text-xs tracking-[0.3em] text-slate-400">DATA LEDGER (30)</h2>
            <div className="mt-3 overflow-auto">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="text-slate-500">
                    <th className="text-left py-2">DATE</th>
                    <th className="text-left">WT</th>
                    <th className="text-left">IN</th>
                    <th className="text-left">OUT</th>
                    <th className="text-left">WTR</th>
                    <th className="text-left">STP</th>
                    <th className="text-left">SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map((row) => (
                    <tr key={row.date} className="border-t border-slateborder">
                      <td className="py-2 font-mono">{row.date}</td>
                      <td>{row.weight}</td>
                      <td>{row.calIn}</td>
                      <td>{row.calOut}</td>
                      <td>{row.water}</td>
                      <td>{row.steps}</td>
                      <td>{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="border border-slateborder bg-slatepanel/80 rounded-xl p-4">
            <h2 className="text-xs tracking-[0.3em] text-slate-400">MONTH CALENDAR</h2>
            <div className="mt-3 grid grid-cols-7 gap-2 text-[10px]">
              {data.calendar.map((day) => (
                <div
                  key={day.date}
                  className={`h-16 rounded-lg border p-2 ${scoreColor(day.score)}`}
                >
                  <div className="font-mono">{day.date.split('-')[2]}</div>
                  <div className="mt-2">{day.score}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'Protocol' && (
        <section className="mt-6 border border-slateborder bg-slatepanel/80 rounded-xl p-6">
          <h2 className="text-xs tracking-[0.3em] text-slate-400">PROTOCOL</h2>
          <div className="mt-4 text-xs text-slate-300 space-y-2">
            <p>1. Fecha es llave primaria. Nunca editar con DateTime.</p>
            <p>2. Guardado modular. Cada módulo solo guarda sus campos.</p>
            <p>3. Ayuno con timer persistente en servidor.</p>
            <p>4. Score diario basado en déficit, agua, pasos y gasto.</p>
            <p>5. Ledger es auditoría, no reporte.</p>
          </div>
        </section>
      )}
    </main>
  );
}
