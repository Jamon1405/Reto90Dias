'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ChangeEvent } from 'react';
import {
  exportAllData,
  fastingOp,
  getDashboardData,
  importAllData,
  ping,
  saveModule,
} from '@/lib/storage';
import { addDays, getMsUntilEndOfDay, nowIsoInTZ, todayISOInTZ } from '@/lib/date';
import {
  computeBmi,
  computeBmr,
  computeCaloriesIn,
  computeCaloriesOut,
  computeExtraBurn,
  computeNet,
} from '@/lib/analytics';
import Badge from '@/app/components/Badge';
import SectionCard from '@/app/components/SectionCard';
import TabButton from '@/app/components/TabButton';
import type {
  ActivityLog,
  ActivityManualEntry,
  ActivityTreadmillEntry,
  Macros,
  SupplementStack,
} from '@/lib/types';

const TAB_OPTIONS = ['Dash', 'Bio', 'Gym', 'Fuel', 'Data', 'Protocol'] as const;

type TabOption = (typeof TAB_OPTIONS)[number];

type DayLog = {
  date: string;
  weight: number;
  waist: number;
  steps: number;
  water: number;
  supps: SupplementStack;
  fastHours: number;
  workout: string;
  calOut: number;
  activity: ActivityLog;
  calIn: number;
  macros: Macros;
  notes: string;
  titanScore: number;
  bmr?: number;
  bmi?: number;
  net?: number;
  titanScoreComputed?: number;
  flagsComputed?: { list: { code: string; msg: string }[]; bmr: number; net: number };
};

type DashboardResponse = {
  success: boolean;
  ver: string;
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
    heightCm: number;
  };
  dayLog: DayLog | null;
  calendar: { date: string; score: number }[];
  history: Array<DayLog & { net: number; score: number } & { fastHours: number }>;
};

const SUPPS: Array<{ label: string; key: keyof SupplementStack }> = [
  { label: 'Creatina', key: 'creat' },
  { label: 'Sodio', key: 'sod' },
  { label: 'Magnesio', key: 'mag' },
  { label: 'Omega', key: 'omega' },
];

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

const MANUAL_PRESETS = [
  { label: 'PÁDEL', key: 'padel', met: 8 },
  { label: 'FÚTBOL', key: 'futbol', met: 10 },
  { label: 'PESAS', key: 'pesas', met: 6 },
] as const;

type ManualKey = (typeof MANUAL_PRESETS)[number]['key'];

function formatDateDisplay(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function calcTreadmillKcal(weightKg: number, speed: number, incline: number, minutes: number) {
  const baseMet = 3.0 + Math.max(0, speed - 4) * 0.8;
  const inclineBonus = incline * 0.15;
  const met = clamp(baseMet + inclineBonus, 2.0, 18.0);
  return Math.round((met * 3.5 * weightKg * minutes) / 200);
}

function calcManualKcal(weightKg: number, met: number, minutes: number) {
  return Math.round((met * 3.5 * weightKg * minutes) / 200);
}

type AppState = {
  loading: boolean;
  error: string | null;
  toast: string | null;
  activeTab: TabOption;
  activeDate: string;
  dashboard: DashboardResponse | null;
  bio: { weight: number; waist: number; steps: number; water: number; supps: SupplementStack };
  gym: {
    workout: string;
    activity: ActivityLog;
    treadmill: { speed: number; incline: number; minutes: number };
    manualMinutes: Record<ManualKey, number>;
  };
  fuel: { macros: Macros; notes: string };
  fastElapsed: number;
  clock: string;
};

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TOAST'; payload: string | null }
  | { type: 'SET_ACTIVE_TAB'; payload: TabOption }
  | { type: 'SET_ACTIVE_DATE'; payload: string }
  | { type: 'SET_DASHBOARD'; payload: DashboardResponse | null }
  | { type: 'SET_BIO'; payload: Partial<AppState['bio']> }
  | { type: 'SET_GYM'; payload: Partial<AppState['gym']> }
  | { type: 'SET_FUEL'; payload: Partial<AppState['fuel']> }
  | { type: 'SET_FAST_ELAPSED'; payload: number }
  | { type: 'SET_CLOCK'; payload: string };

const initialState: AppState = {
  loading: true,
  error: null,
  toast: null,
  activeTab: 'Dash',
  activeDate: '',
  dashboard: null,
  bio: {
    weight: 0,
    waist: 0,
    steps: 0,
    water: 0,
    supps: { creat: false, sod: false, mag: false, omega: false },
  },
  gym: {
    workout: '',
    activity: { treadmill: [], manual: [] },
    treadmill: { speed: 0, incline: 0, minutes: 0 },
    manualMinutes: { padel: 0, futbol: 0, pesas: 0 },
  },
  fuel: {
    macros: { m: 0, e: 0, b: 0 },
    notes: '',
  },
  fastElapsed: 0,
  clock: nowIsoInTZ(),
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_ACTIVE_DATE':
      return { ...state, activeDate: action.payload };
    case 'SET_DASHBOARD':
      return { ...state, dashboard: action.payload };
    case 'SET_BIO':
      return { ...state, bio: { ...state.bio, ...action.payload } };
    case 'SET_GYM':
      return { ...state, gym: { ...state.gym, ...action.payload } };
    case 'SET_FUEL':
      return { ...state, fuel: { ...state.fuel, ...action.payload } };
    case 'SET_FAST_ELAPSED':
      return { ...state, fastElapsed: action.payload };
    case 'SET_CLOCK':
      return { ...state, clock: action.payload };
    default:
      return state;
  }
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const lastSnapshots = useRef({ bio: '', gym: '', fuel: '' });
  const savingRef = useRef(false);

  const dayLog = useMemo<DayLog | null>(() => {
    if (!state.dashboard) return null;
    if (state.dashboard.dayLog) return state.dashboard.dayLog;
    return {
      date: state.dashboard.meta.targetDate,
      weight: 0,
      waist: 0,
      steps: 0,
      water: 0,
      supps: { creat: false, sod: false, mag: false, omega: false },
      fastHours: 0,
      workout: '',
      calOut: 0,
      activity: { treadmill: [], manual: [] },
      calIn: 0,
      macros: { m: 0, e: 0, b: 0 },
      notes: '',
      titanScore: 0,
      bmr: 0,
      bmi: 0,
      net: 0,
      titanScoreComputed: 0,
      flagsComputed: { list: [], bmr: 0, net: 0 },
    };
  }, [state.dashboard]);

  const todayStr = state.dashboard?.meta.todayStr ?? '';
  const meta = state.dashboard?.meta;
  const seasonLabel = meta?.season ?? '--';
  const daysLeftLabel = meta ? String(meta.daysLeft) : '--';
  const fastStartMs = meta?.fastStartMs ?? null;
  const historyRows = state.dashboard?.history ?? [];
  const calendarDays = state.dashboard?.calendar ?? [];

  const weightForCalc = useMemo(() => {
    if (state.bio.weight > 0) return state.bio.weight;
    return state.dashboard?.user.lastWeight ?? 97;
  }, [state.bio.weight, state.dashboard?.user.lastWeight]);

  const bmrLive = useMemo(() => computeBmr(weightForCalc), [weightForCalc]);
  const bmiLive = useMemo(() => computeBmi(weightForCalc), [weightForCalc]);
  const calInLive = useMemo(() => computeCaloriesIn(state.fuel.macros), [state.fuel.macros]);
  const extraBurn = useMemo(() => computeExtraBurn(state.gym.activity), [state.gym.activity]);
  const calOutLive = useMemo(
    () => computeCaloriesOut({ weight: weightForCalc, activity: state.gym.activity }),
    [state.gym.activity, weightForCalc],
  );
  const netLive = useMemo(() => computeNet(calInLive, calOutLive), [calInLive, calOutLive]);

  const routineLabel = useMemo(() => {
    if (!state.activeDate) return '';
    return ROUTINE_BY_DAY[getWeekday(state.activeDate)] ?? '';
  }, [state.activeDate]);

  const hydrateDay = useCallback(
    (log: DayLog | undefined) => {
      if (!log) return;
      dispatch({
        type: 'SET_BIO',
        payload: {
          weight: log.weight ?? 0,
          waist: log.waist ?? 0,
          steps: log.steps ?? 0,
          water: log.water ?? 0,
          supps: log.supps ?? { creat: false, sod: false, mag: false, omega: false },
        },
      });
      dispatch({
        type: 'SET_GYM',
        payload: {
          workout: log.workout ?? '',
          activity: log.activity ?? { treadmill: [], manual: [] },
        },
      });
      dispatch({
        type: 'SET_FUEL',
        payload: {
          macros: log.macros ?? { m: 0, e: 0, b: 0 },
          notes: log.notes ?? '',
        },
      });
      lastSnapshots.current = {
        bio: JSON.stringify({
          weight: log.weight ?? 0,
          waist: log.waist ?? 0,
          steps: log.steps ?? 0,
          water: log.water ?? 0,
          supps: log.supps ?? { creat: false, sod: false, mag: false, omega: false },
        }),
        gym: JSON.stringify({
          workout: log.workout ?? '',
          activity: log.activity ?? { treadmill: [], manual: [] },
        }),
        fuel: JSON.stringify({
          macros: log.macros ?? { m: 0, e: 0, b: 0 },
          notes: log.notes ?? '',
        }),
      };
    },
    [dispatch],
  );

  const loadDashboard = useCallback(async (date?: string) => {
    const dashboard = await getDashboardData(date);
    dispatch({ type: 'SET_DASHBOARD', payload: dashboard });
    dispatch({ type: 'SET_ACTIVE_DATE', payload: dashboard.meta.targetDate });
    dispatch({ type: 'SET_TOAST', payload: null });
    lastSnapshots.current = { bio: '', gym: '', fuel: '' };
  }, []);

  const handleSave = useCallback(
    async (type: 'BIO' | 'GYM' | 'FUEL', payload: any, options?: { silent?: boolean }) => {
      try {
        if (!options?.silent) {
          dispatch({ type: 'SET_TOAST', payload: 'GUARDANDO...' });
        }
        savingRef.current = true;
        const response = await saveModule(type, { ...payload, targetDate: state.activeDate });
        dispatch({ type: 'SET_DASHBOARD', payload: response });
        dispatch({ type: 'SET_ACTIVE_DATE', payload: response.meta.targetDate });
        lastSnapshots.current = {
          bio: JSON.stringify(state.bio),
          gym: JSON.stringify({ workout: state.gym.workout, activity: state.gym.activity }),
          fuel: JSON.stringify(state.fuel),
        };
        if (!options?.silent) {
          dispatch({ type: 'SET_TOAST', payload: 'LISTO' });
          setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 2000);
        }
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Error guardando' });
      } finally {
        savingRef.current = false;
      }
    },
    [state.activeDate, state.bio, state.fuel, state.gym.activity, state.gym.workout],
  );

  const handleFast = useCallback(async (action: 'START' | 'STOP' | 'RESET') => {
    try {
      dispatch({ type: 'SET_TOAST', payload: 'GUARDANDO...' });
      const response = await fastingOp(action);
      dispatch({ type: 'SET_DASHBOARD', payload: response });
      dispatch({ type: 'SET_ACTIVE_DATE', payload: response.meta.targetDate });
      dispatch({ type: 'SET_TOAST', payload: 'LISTO' });
      setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 2000);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Error ayuno' });
    }
  }, []);

  const bootstrap = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await ping();
      await loadDashboard();
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message ?? 'Error al cargar' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadDashboard]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    hydrateDay(dayLog ?? undefined);
  }, [dayLog, hydrateDay]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'SET_CLOCK', payload: nowIsoInTZ() });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!fastStartMs) {
      dispatch({ type: 'SET_FAST_ELAPSED', payload: 0 });
      return;
    }
    const interval = setInterval(() => {
      dispatch({ type: 'SET_FAST_ELAPSED', payload: (Date.now() - fastStartMs) / 3600000 });
    }, 1000);
    return () => clearInterval(interval);
  }, [fastStartMs]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.dashboard || state.activeDate !== todayStr || savingRef.current) return;
      const bioSnapshot = JSON.stringify(state.bio);
      const gymSnapshot = JSON.stringify({ workout: state.gym.workout, activity: state.gym.activity });
      const fuelSnapshot = JSON.stringify(state.fuel);

      const saves: Array<Promise<void>> = [];
      if (bioSnapshot !== lastSnapshots.current.bio) {
        saves.push(handleSave('BIO', state.bio, { silent: true }));
        lastSnapshots.current.bio = bioSnapshot;
      }
      if (gymSnapshot !== lastSnapshots.current.gym) {
        saves.push(
          handleSave(
            'GYM',
            { workout: state.gym.workout, activity: state.gym.activity },
            { silent: true },
          ),
        );
        lastSnapshots.current.gym = gymSnapshot;
      }
      if (fuelSnapshot !== lastSnapshots.current.fuel) {
        saves.push(handleSave('FUEL', state.fuel, { silent: true }));
        lastSnapshots.current.fuel = fuelSnapshot;
      }
      if (saves.length > 0) {
        Promise.all(saves).catch(() => undefined);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [handleSave, state.activeDate, state.bio, state.dashboard, state.fuel, state.gym.activity, state.gym.workout, todayStr]);

  useEffect(() => {
    const diff = getMsUntilEndOfDay();
    const timeout = setTimeout(() => {
      if (state.activeDate === todayStr) {
        handleSave('BIO', state.bio, { silent: true });
        handleSave('GYM', { workout: state.gym.workout, activity: state.gym.activity }, { silent: true });
        handleSave('FUEL', state.fuel, { silent: true });
      }
    }, diff);
    return () => clearTimeout(timeout);
  }, [state.activeDate, state.bio, state.fuel, state.gym.activity, state.gym.workout, handleSave, todayStr]);

  const handleDateMove = (direction: number) => {
    if (!state.activeDate || !state.dashboard) return;
    const next = addDays(state.activeDate, direction);
    if (direction > 0 && next > todayStr) return;
    loadDashboard(next).catch((err) => dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Error al cargar' }));
  };

  const handleSuppToggle = (key: keyof SupplementStack) => {
    dispatch({
      type: 'SET_BIO',
      payload: { supps: { ...state.bio.supps, [key]: !state.bio.supps[key] } },
    });
  };

  const handleWaterSet = (count: number) => {
    dispatch({ type: 'SET_BIO', payload: { water: count } });
  };

  const handleAddTreadmill = () => {
    const { speed, incline, minutes } = state.gym.treadmill;
    if (!speed || !minutes) return;
    const kcal = calcTreadmillKcal(weightForCalc, speed, incline, minutes);
    const entry: ActivityTreadmillEntry = {
      speed,
      incline,
      minutes,
      kcal,
      ts: nowIsoInTZ(),
    };
    dispatch({
      type: 'SET_GYM',
      payload: {
        activity: {
          ...state.gym.activity,
          treadmill: [...state.gym.activity.treadmill, entry],
        },
        treadmill: { speed: 0, incline: 0, minutes: 0 },
      },
    });
  };

  const handleAddManual = (preset: (typeof MANUAL_PRESETS)[number]) => {
    const minutes = state.gym.manualMinutes[preset.key] ?? 0;
    if (!minutes) return;
    const kcal = calcManualKcal(weightForCalc, preset.met, minutes);
    const entry: ActivityManualEntry = {
      label: preset.label,
      minutes,
      kcal,
      met: preset.met,
      ts: nowIsoInTZ(),
    };
    dispatch({
      type: 'SET_GYM',
      payload: {
        activity: {
          ...state.gym.activity,
          manual: [...state.gym.activity.manual, entry],
        },
        manualMinutes: { ...state.gym.manualMinutes, [preset.key]: 0 },
      },
    });
  };

  const handleTrash = (module: 'BIO' | 'GYM' | 'FUEL') => {
    if (module === 'BIO') {
      const payload = {
        weight: 0,
        waist: 0,
        steps: 0,
        water: 0,
        supps: { creat: false, sod: false, mag: false, omega: false },
      };
      dispatch({ type: 'SET_BIO', payload });
      handleSave('BIO', payload);
    }
    if (module === 'GYM') {
      const payload = { workout: '', activity: { treadmill: [], manual: [] } };
      dispatch({ type: 'SET_GYM', payload });
      handleSave('GYM', payload);
    }
    if (module === 'FUEL') {
      const payload = { macros: { m: 0, e: 0, b: 0 }, notes: '' };
      dispatch({ type: 'SET_FUEL', payload });
      handleSave('FUEL', payload);
    }
  };

  const handleExport = useCallback(async () => {
    const payload = await exportAllData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `titan-omega-backup-${todayISOInTZ()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      event.target.value = '';
      let payload: { days?: unknown; state?: unknown };
      try {
        const text = await file.text();
        payload = JSON.parse(text) as { days?: unknown; state?: unknown };
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Archivo JSON inválido' });
        return;
      }
      const confirmed = window.confirm('Esto reemplazará/merge datos locales. ¿Continuar?');
      if (!confirmed) return;
      await importAllData(payload as any);
      await loadDashboard(state.activeDate || undefined);
      dispatch({ type: 'SET_TOAST', payload: 'IMPORTADO' });
      setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 2000);
    },
    [loadDashboard, state.activeDate],
  );

  if (!state.dashboard && state.loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-slate-300">
        CARGANDO TITAN OMEGA...
      </main>
    );
  }

  if (!state.dashboard && !state.loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-slate-300 px-6">
        <div className="max-w-xl w-full border border-slateborder bg-slatepanel/80 rounded-xl p-6">
          <h2 className="text-xs tracking-[0.3em] text-danger">SIN DATOS</h2>
          <p className="mt-3 text-sm">{state.error ?? 'No se pudo inicializar el tablero.'}</p>
          <button
            onClick={bootstrap}
            className="mt-5 w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
          >
            REINTENTAR
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 lg:px-10 text-sm relative">
      {state.loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slatebase/90 text-xs uppercase tracking-[0.3em] text-accent">
          CARGANDO TITAN OMEGA...
        </div>
      )}
      <header className="flex flex-col gap-4 border border-slateborder bg-slatepanel/80 p-4 rounded-xl shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-[0.3em] text-accent">TITAN OMEGA</h1>
            <p className="text-xs text-slate-400">ERP Biométrico · CDMX LOCK</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Badge>{seasonLabel}</Badge>
            <span className="text-slate-300">HYROX - {daysLeftLabel} días</span>
            <span className="text-xs text-slate-400">{state.clock.split('T')[1]}</span>
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
            <div className="text-sm font-mono tracking-widest">{formatDateDisplay(state.activeDate)}</div>
            <button
              onClick={() => handleDateMove(1)}
              className="px-3 py-2 border border-slateborder rounded-lg hover:border-accent disabled:opacity-40"
              disabled={state.activeDate >= todayStr}
            >
              ▶
            </button>
          </div>
          <div className="flex gap-2">
            {TAB_OPTIONS.map((tab) => (
              <TabButton
                key={tab}
                active={state.activeTab === tab}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })}
              >
                {tab}
              </TabButton>
            ))}
          </div>
        </div>
      </header>

      {state.toast && <div className="mt-4 text-xs uppercase tracking-[0.3em] text-accent">{state.toast}</div>}
      {state.error && <div className="mt-4 text-xs text-danger">{state.error}</div>}

      {state.activeTab === 'Dash' && dayLog && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4">
            <SectionCard>
              <h2 className="text-xs tracking-[0.3em] text-slate-400">P&L</h2>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-slate-400">IN</p>
                  <p className="text-lg font-semibold">{calInLive}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">OUT</p>
                  <p className="text-lg font-semibold">{calOutLive}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">NET</p>
                  <p className={`text-lg font-semibold ${netLive <= 0 ? 'text-success' : 'text-danger'}`}>
                    {netLive}
                  </p>
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard>
                <h2 className="text-xs tracking-[0.3em] text-slate-400">BMI</h2>
                <div className="mt-3 text-lg font-semibold">{bmiLive}</div>
                <div className="mt-2 text-xs text-slate-400">BMR {bmrLive} kcal</div>
              </SectionCard>
              <SectionCard>
                <h2 className="text-xs tracking-[0.3em] text-slate-400">FLAGS</h2>
                <div className="mt-3 flex flex-col gap-2">
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
              </SectionCard>
            </div>

            <SectionCard>
              <h2 className="text-xs tracking-[0.3em] text-slate-400">TACTICAL AGENDA</h2>
              <ul className="mt-3 space-y-1 text-xs text-slate-300">
                {TACTICAL_AGENDA.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-accent">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <div className="grid gap-4">
            <SectionCard>
              <h2 className="text-xs tracking-[0.3em] text-slate-400">FASTING</h2>
              <div className="mt-3 text-lg font-semibold">
                {fastStartMs ? `${state.fastElapsed.toFixed(2)} h` : `${dayLog.fastHours} h`}
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
            </SectionCard>

            <SectionCard>
              <h2 className="text-xs tracking-[0.3em] text-slate-400">METRICS</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">Weight</p>
                  <p className="text-base">{weightForCalc} kg</p>
                </div>
                <div>
                  <p className="text-slate-400">Steps</p>
                  <p className="text-base">{state.bio.steps}</p>
                </div>
                <div>
                  <p className="text-slate-400">Water</p>
                  <p className="text-base">{state.bio.water}/10</p>
                </div>
                <div>
                  <p className="text-slate-400">Routine</p>
                  <p className="text-base">{routineLabel}</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-xs tracking-[0.3em] text-slate-400">DB STATUS</h2>
              <p className="mt-2 text-xs text-slate-400">Último guardado: {dayLog.date}</p>
              <p className="text-xs text-slate-500">
                IN {calInLive} · OUT {calOutLive}
              </p>
            </SectionCard>
          </div>
        </section>
      )}

      {state.activeTab === 'Bio' && dayLog && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <SectionCard className="space-y-4">
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
                  value={state.bio.weight}
                  onChange={(event) => dispatch({ type: 'SET_BIO', payload: { weight: Number(event.target.value) } })}
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
              <label className="text-xs text-slate-400">
                Waist
                <input
                  type="number"
                  value={state.bio.waist}
                  onChange={(event) => dispatch({ type: 'SET_BIO', payload: { waist: Number(event.target.value) } })}
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-slate-400">
                Steps
                <input
                  type="number"
                  value={state.bio.steps}
                  onChange={(event) => dispatch({ type: 'SET_BIO', payload: { steps: Number(event.target.value) } })}
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
              <div>
                <p className="text-xs text-slate-400">Water</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleWaterSet(idx + 1)}
                      className={`h-6 w-6 rounded border text-[10px] ${
                        state.bio.water >= idx + 1
                          ? 'border-accent bg-accent/30 text-accent'
                          : 'border-slateborder text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Supps Stack</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {SUPPS.map((supp) => (
                  <label key={supp.key} className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(state.bio.supps[supp.key])}
                      onChange={() => handleSuppToggle(supp.key)}
                    />
                    {supp.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">BMI</p>
                <p className="text-base">{bmiLive}</p>
              </div>
              <div>
                <p className="text-slate-400">BMR</p>
                <p className="text-base">{bmrLive}</p>
              </div>
            </div>
            <button
              onClick={() => handleSave('BIO', state.bio)}
              className="w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
            >
              GUARDAR BIO
            </button>
            <p className="text-xs text-slate-500">
              STORAGE: weight {state.bio.weight} · steps {state.bio.steps} · water {state.bio.water}
            </p>
          </SectionCard>

          <SectionCard>
            <h2 className="text-xs tracking-[0.3em] text-slate-400">FASTING TIMER</h2>
            <div className="mt-3 text-lg font-semibold">
              {fastStartMs ? `${state.fastElapsed.toFixed(2)} h` : `${dayLog.fastHours} h`}
            </div>
            <div className="mt-3 text-xs text-slate-400">Timer persistente en local.</div>
          </SectionCard>
        </section>
      )}

      {state.activeTab === 'Gym' && dayLog && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <SectionCard className="space-y-4">
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
                value={state.gym.workout}
                onChange={(event) => dispatch({ type: 'SET_GYM', payload: { workout: event.target.value } })}
                className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs text-slate-400">
                Speed (km/h)
                <input
                  type="number"
                  value={state.gym.treadmill.speed}
                  onChange={(event) =>
                    dispatch({
                      type: 'SET_GYM',
                      payload: { treadmill: { ...state.gym.treadmill, speed: Number(event.target.value) } },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
              <label className="text-xs text-slate-400">
                Incline (%)
                <input
                  type="number"
                  value={state.gym.treadmill.incline}
                  onChange={(event) =>
                    dispatch({
                      type: 'SET_GYM',
                      payload: { treadmill: { ...state.gym.treadmill, incline: Number(event.target.value) } },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
              <label className="text-xs text-slate-400">
                Minutes
                <input
                  type="number"
                  value={state.gym.treadmill.minutes}
                  onChange={(event) =>
                    dispatch({
                      type: 'SET_GYM',
                      payload: { treadmill: { ...state.gym.treadmill, minutes: Number(event.target.value) } },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
            </div>
            <button
              onClick={handleAddTreadmill}
              className="w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
            >
              + SUMAR TREADMILL
            </button>
            <div className="grid gap-2 text-xs">
              {state.gym.activity.treadmill.map((entry) => (
                <div key={entry.ts} className="flex justify-between text-slate-400">
                  <span>
                    {entry.speed}km/h · {entry.incline}% · {entry.minutes}m
                  </span>
                  <span>{entry.kcal} kcal</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-slate-400">Manual Activity</p>
              <div className="mt-2 grid gap-2">
                {MANUAL_PRESETS.map((preset) => (
                  <div key={preset.key} className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 w-16">{preset.label}</span>
                    <input
                      type="number"
                      placeholder="min"
                      value={state.gym.manualMinutes[preset.key]}
                      onChange={(event) =>
                        dispatch({
                          type: 'SET_GYM',
                          payload: {
                            manualMinutes: {
                              ...state.gym.manualMinutes,
                              [preset.key]: Number(event.target.value),
                            },
                          },
                        })
                      }
                      className="flex-1 rounded-lg border border-slateborder bg-slatebase px-2 py-1 text-xs text-slate-200"
                    />
                    <button
                      onClick={() => handleAddManual(preset)}
                      className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent"
                    >
                      ADD
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 text-xs">
                {state.gym.activity.manual.map((entry) => (
                  <div key={entry.ts} className="flex justify-between text-slate-400">
                    <span>
                      {entry.label} · {entry.minutes}m
                    </span>
                    <span>{entry.kcal} kcal</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSave('GYM', { workout: state.gym.workout, activity: state.gym.activity })}
              className="w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
            >
              GUARDAR GYM
            </button>
            <p className="text-xs text-slate-500">STORAGE: OUT {calOutLive} · extra {extraBurn} kcal</p>
          </SectionCard>

          <SectionCard className="space-y-3">
            <h2 className="text-xs tracking-[0.3em] text-slate-400">OUT TOTAL</h2>
            <div className="text-lg font-semibold">{calOutLive}</div>
            <div className="text-xs text-slate-400">BMR {bmrLive} · Extra {extraBurn}</div>
            <div className="text-xs text-slate-400">Routine: {routineLabel}</div>
          </SectionCard>
        </section>
      )}

      {state.activeTab === 'Fuel' && dayLog && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <SectionCard className="space-y-4">
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
                  value={state.fuel.macros.m}
                  onChange={(event) =>
                    dispatch({ type: 'SET_FUEL', payload: { macros: { ...state.fuel.macros, m: Number(event.target.value) } } })
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
              <label className="text-xs text-slate-400">
                Eggs (pcs)
                <input
                  type="number"
                  value={state.fuel.macros.e}
                  onChange={(event) =>
                    dispatch({ type: 'SET_FUEL', payload: { macros: { ...state.fuel.macros, e: Number(event.target.value) } } })
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
              <label className="text-xs text-slate-400">
                Butter (g)
                <input
                  type="number"
                  value={state.fuel.macros.b}
                  onChange={(event) =>
                    dispatch({ type: 'SET_FUEL', payload: { macros: { ...state.fuel.macros, b: Number(event.target.value) } } })
                  }
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
            </div>
            <label className="text-xs text-slate-400">
              Notes
              <textarea
                value={state.fuel.notes}
                onChange={(event) => dispatch({ type: 'SET_FUEL', payload: { notes: event.target.value } })}
                className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
              />
            </label>
            <button
              onClick={() => handleSave('FUEL', state.fuel)}
              className="w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
            >
              GUARDAR FUEL
            </button>
            <p className="text-xs text-slate-500">STORAGE: IN {calInLive}</p>
          </SectionCard>

          <SectionCard>
            <h2 className="text-xs tracking-[0.3em] text-slate-400">CONVERSION</h2>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li>Meat g × 2.5</li>
              <li>Eggs × 75</li>
              <li>Butter g × 7.2</li>
            </ul>
            <div className="mt-3 text-xs text-slate-400">Total IN (STORAGE): {calInLive}</div>
          </SectionCard>
        </section>
      )}

      {state.activeTab === 'Data' && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <SectionCard>
            <h2 className="text-xs tracking-[0.3em] text-slate-400">DATA LEDGER (30)</h2>
            <div className="mt-3 overflow-auto">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="text-slate-500">
                    <th className="text-left py-2">DATE</th>
                    <th className="text-left">WT</th>
                    <th className="text-left">IN</th>
                    <th className="text-left">OUT</th>
                    <th className="text-left">NET</th>
                    <th className="text-left">WTR</th>
                    <th className="text-left">STP</th>
                    <th className="text-left">FAST</th>
                    <th className="text-left">SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((row) => (
                    <tr key={row.date} className="border-t border-slateborder">
                      <td className="py-2 font-mono">{row.date}</td>
                      <td>{row.weight}</td>
                      <td>{row.calIn}</td>
                      <td>{row.calOut}</td>
                      <td>{row.net}</td>
                      <td>{row.water}</td>
                      <td>{row.steps}</td>
                      <td>{row.fastHours}</td>
                      <td>{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
          <div className="grid gap-4">
            <SectionCard>
              <h2 className="text-xs tracking-[0.3em] text-slate-400">MONTH CALENDAR</h2>
              <div className="mt-3 grid grid-cols-7 gap-2 text-[10px]">
                {calendarDays.map((day) => (
                  <div key={day.date} className={`h-16 rounded-lg border p-2 ${scoreColor(day.score)}`}>
                    <div className="font-mono">{day.date.split('-')[2]}</div>
                    <div className="mt-2">{day.score}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard>
              <h2 className="text-xs tracking-[0.3em] text-slate-400">BACKUP</h2>
              <p className="mt-3 text-xs text-slate-400">Exporta o importa la base local completa.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleExport()}
                  className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent"
                >
                  EXPORT JSON
                </button>
                <label className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent cursor-pointer">
                  IMPORT JSON
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(event) => handleImport(event)}
                  />
                </label>
              </div>
            </SectionCard>
          </div>
        </section>
      )}

      {state.activeTab === 'Protocol' && (
        <section className="mt-6 border border-slateborder bg-slatepanel/80 rounded-xl p-6">
          <h2 className="text-xs tracking-[0.3em] text-slate-400">PROTOCOL</h2>
          <div className="mt-4 text-xs text-slate-300 space-y-2">
            <p>1. Carnívoro estricto, sin procesados.</p>
            <p>2. 2MAD: dos comidas al día, sin snacks.</p>
            <p>3. Ayuno con timer persistente en local.</p>
            <p>4. Score diario basado en déficit, agua, pasos y gasto.</p>
            <p>5. Ledger es auditoría, no reporte.</p>
          </div>
        </section>
      )}
    </main>
  );
}
