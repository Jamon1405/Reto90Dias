'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ChangeEvent } from 'react';
import {
  deleteDay,
  exportAllData,
  fastingOp,
  getDashboardData,
  getDaysForMonth,
  getSelectedMonth,
  hardReset,
  importAllData,
  ping,
  saveModule,
  setSelectedMonth,
} from '@/lib/storage';
import { addDays, getMsUntilEndOfDay, getZonedParts, nowIsoInTZ, todayISOInTZ } from '@/lib/date';
import {
  computeBmi,
  computeBmr,
  computeCaloriesIn,
  computeCaloriesOut,
  computeExtraBurn,
  computeNet,
  movingAverage,
} from '@/lib/analytics';
import { computeDeficitBank, computeMonthlyPnL, computeProjection, computeRiskSummary, computeWaterCompliance, computeWeightTrend, runwayData } from '@/lib/intel';
import type { ActivityLog, ActivityManualEntry, ActivityTreadmillEntry, Macros, OpsChecklist, SupplementStack } from '@/lib/types';
import Badge from '@/app/components/Badge';
import SectionCard from '@/app/components/SectionCard';
import TabButton from '@/app/components/TabButton';
import CalendarMonth from '@/app/components/CalendarMonth';
import IntelSlides from '@/app/components/IntelSlides';

const TAB_OPTIONS = ['Dash', 'Bio', 'Gym', 'Fuel', 'Sleep', 'Data', 'Intel', 'Protocol'] as const;

type TabOption = (typeof TAB_OPTIONS)[number];

type DayLog = {
  date: string;
  tsUpdated?: string | null;
  weight: number;
  water: number;
  supps: SupplementStack;
  fastHours: number;
  workout: string;
  calOut: number;
  activity: ActivityLog;
  calIn: number;
  macros: Macros;
  notes: string;
  sleepHours: number;
  sleepQuality: number;
  ops: OpsChecklist;
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
    routineLabel: string;
    lastModuleToday: string | null;
    missingDays: number;
  };
  user: {
    age: number;
    lastWeight: number;
    heightCm: number;
  };
  dayLog: DayLog | null;
  calendar: {
    date: string;
    phase: 'PRE-SEASON' | 'SEASON' | 'POST-SEASON';
    score: number;
    dots: { bio: boolean; gym: boolean; fuel: boolean; sleep: boolean; ops: boolean };
  }[];
  history: Array<DayLog & { net: number; score: number }>;
};

const SUPPS: Array<{ label: string; key: keyof SupplementStack }> = [
  { label: 'Creatina', key: 'creat' },
  { label: 'Sodio', key: 'sod' },
  { label: 'Magnesio', key: 'mag' },
  { label: 'Omega', key: 'omega' },
];

const MANUAL_PRESETS = [
  { label: 'PÁDEL', key: 'padel', met: 8, kind: 'PADEL' },
  { label: 'FÚTBOL', key: 'futbol', met: 10, kind: 'FUTBOL' },
  { label: 'PESAS', key: 'pesas', met: 6, kind: 'PESAS' },
] as const;

type ManualKey = (typeof MANUAL_PRESETS)[number]['key'];

const OPS_KEYS: Array<{ key: keyof OpsChecklist; label: string }> = [
  { key: 'walk10', label: 'Walk 10' },
  { key: 'sunlight10', label: 'Sunlight 10' },
  { key: 'stretch10', label: 'Stretch 10' },
];

function formatDateDisplay(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
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

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthKeyFromDate(dateStr: string) {
  const [year, month] = dateStr.split('-');
  return `${year}-${month}`;
}

type AppState = {
  loading: boolean;
  error: string | null;
  toast: string | null;
  activeTab: TabOption;
  activeDate: string;
  dashboard: DashboardResponse | null;
  bio: { weight: number; water: number; supps: SupplementStack };
  gym: {
    workout: string;
    activity: ActivityLog;
    treadmill: { speed: number; incline: number; minutes: number };
    manualMinutes: Record<ManualKey, number>;
  };
  fuel: { macros: Macros; notes: string };
  sleep: { sleepHours: number; sleepQuality: number };
  ops: OpsChecklist;
  fastElapsed: number;
  clock: string;
  calendarMonth: string;
  calendarDays: DashboardResponse['calendar'];
  monthDays: DayLog[];
  jumpDate: string;
  intelSlide: number;
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
  | { type: 'SET_SLEEP'; payload: Partial<AppState['sleep']> }
  | { type: 'SET_OPS'; payload: OpsChecklist }
  | { type: 'SET_FAST_ELAPSED'; payload: number }
  | { type: 'SET_CLOCK'; payload: string }
  | { type: 'SET_CALENDAR_MONTH'; payload: string }
  | { type: 'SET_CALENDAR_DAYS'; payload: DashboardResponse['calendar'] }
  | { type: 'SET_MONTH_DAYS'; payload: DayLog[] }
  | { type: 'SET_JUMP_DATE'; payload: string }
  | { type: 'SET_INTEL_SLIDE'; payload: number };

const initialState: AppState = {
  loading: true,
  error: null,
  toast: null,
  activeTab: 'Dash',
  activeDate: '2025-12-30',
  dashboard: null,
  bio: {
    weight: 0,
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
  sleep: {
    sleepHours: 0,
    sleepQuality: 0,
  },
  ops: { walk10: false, sunlight10: false, stretch10: false },
  fastElapsed: 0,
  clock: nowIsoInTZ(),
  calendarMonth: '2025-12',
  calendarDays: [],
  monthDays: [],
  jumpDate: '',
  intelSlide: 0,
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
    case 'SET_SLEEP':
      return { ...state, sleep: { ...state.sleep, ...action.payload } };
    case 'SET_OPS':
      return { ...state, ops: action.payload };
    case 'SET_FAST_ELAPSED':
      return { ...state, fastElapsed: action.payload };
    case 'SET_CLOCK':
      return { ...state, clock: action.payload };
    case 'SET_CALENDAR_MONTH':
      return { ...state, calendarMonth: action.payload };
    case 'SET_CALENDAR_DAYS':
      return { ...state, calendarDays: action.payload };
    case 'SET_MONTH_DAYS':
      return { ...state, monthDays: action.payload };
    case 'SET_JUMP_DATE':
      return { ...state, jumpDate: action.payload };
    case 'SET_INTEL_SLIDE':
      return { ...state, intelSlide: action.payload };
    default:
      return state;
  }
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const lastSnapshots = useRef({ bio: '', gym: '', fuel: '', sleep: '', ops: '' });
  const savingRef = useRef(false);

  const dayLog = useMemo<DayLog | null>(() => {
    if (!state.dashboard) return null;
    if (state.dashboard.dayLog) return state.dashboard.dayLog;
    return {
      date: state.dashboard.meta.targetDate,
      weight: 0,
      water: 0,
      supps: { creat: false, sod: false, mag: false, omega: false },
      fastHours: 0,
      workout: '',
      activity: { treadmill: [], manual: [] },
      calOut: 0,
      calIn: 0,
      macros: { m: 0, e: 0, b: 0 },
      notes: '',
      sleepHours: 0,
      sleepQuality: 0,
      ops: { walk10: false, sunlight10: false, stretch10: false },
      titanScore: 0,
      bmr: 0,
      bmi: 0,
      net: 0,
      titanScoreComputed: 0,
      flagsComputed: { list: [], bmr: 0, net: 0 },
    };
  }, [state.dashboard]);

  const todayStr = state.dashboard?.meta.todayStr ?? todayISOInTZ();
  const meta = state.dashboard?.meta;
  const seasonLabel = meta?.season ?? '--';
  const daysLeftLabel = meta ? String(meta.daysLeft) : '--';
  const fastStartMs = meta?.fastStartMs ?? null;
  const historyRows = state.dashboard?.history ?? [];
  const calendarDays = state.calendarDays;

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

  const sleepAvg7 = useMemo(() => {
    const values = historyRows.map((row) => row.sleepHours).filter((value) => value > 0).slice(0, 7);
    return values.length ? Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)) : 0;
  }, [historyRows]);

  const sleepAvg30 = useMemo(() => {
    const values = historyRows.map((row) => row.sleepHours).filter((value) => value > 0);
    return values.length ? Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)) : 0;
  }, [historyRows]);

  const sleepDebt = useMemo(() => Math.max(0, (7.5 - sleepAvg7) * 7), [sleepAvg7]);

  const weighInStreak = useMemo(() => {
    const sorted = [...historyRows].sort((a, b) => (a.date < b.date ? 1 : -1));
    let streak = 0;
    for (const day of sorted) {
      if (day.weight > 0) streak += 1;
      else break;
    }
    return streak;
  }, [historyRows]);

  const fastingAvg7 = useMemo(() => {
    const values = historyRows.map((row) => row.fastHours).filter((value) => value > 0).slice(0, 7);
    return values.length ? Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)) : 0;
  }, [historyRows]);

  const fastingStreak = useMemo(() => {
    const sorted = [...historyRows].sort((a, b) => (a.date < b.date ? 1 : -1));
    let streak = 0;
    for (const day of sorted) {
      if (day.fastHours >= 12) streak += 1;
      else break;
    }
    return streak;
  }, [historyRows]);

  const routineLabel = meta?.routineLabel ?? '';

  const hydrationReminder = useMemo(() => {
    if (state.activeDate !== todayStr) return false;
    const { hour } = getZonedParts();
    return hour >= 18 && state.bio.water < 6;
  }, [state.activeDate, state.bio.water, todayStr]);

  const hydrateDay = useCallback(
    (log: DayLog | undefined) => {
      if (!log) return;
      dispatch({
        type: 'SET_BIO',
        payload: {
          weight: log.weight ?? 0,
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
      dispatch({ type: 'SET_SLEEP', payload: { sleepHours: log.sleepHours ?? 0, sleepQuality: log.sleepQuality ?? 0 } });
      dispatch({ type: 'SET_OPS', payload: log.ops ?? { walk10: false, sunlight10: false, stretch10: false } });
      lastSnapshots.current = {
        bio: JSON.stringify({ weight: log.weight ?? 0, water: log.water ?? 0, supps: log.supps ?? {} }),
        gym: JSON.stringify({ workout: log.workout ?? '', activity: log.activity ?? { treadmill: [], manual: [] } }),
        fuel: JSON.stringify({ macros: log.macros ?? { m: 0, e: 0, b: 0 }, notes: log.notes ?? '' }),
        sleep: JSON.stringify({ sleepHours: log.sleepHours ?? 0, sleepQuality: log.sleepQuality ?? 0 }),
        ops: JSON.stringify(log.ops ?? { walk10: false, sunlight10: false, stretch10: false }),
      };
    },
    [dispatch],
  );

  const loadDashboard = useCallback(async (date?: string) => {
    const dashboard = await getDashboardData(date);
    dispatch({ type: 'SET_DASHBOARD', payload: dashboard });
    dispatch({ type: 'SET_ACTIVE_DATE', payload: dashboard.meta.targetDate });
    dispatch({ type: 'SET_TOAST', payload: null });
    lastSnapshots.current = { bio: '', gym: '', fuel: '', sleep: '', ops: '' };
  }, []);

  const loadCalendarMonth = useCallback(async (monthKey: string) => {
    const dashboard = await getDashboardData(`${monthKey}-01`);
    const monthDays = await getDaysForMonth(monthKey);
    dispatch({ type: 'SET_CALENDAR_DAYS', payload: dashboard.calendar });
    dispatch({ type: 'SET_MONTH_DAYS', payload: monthDays });
  }, []);

  const handleSave = useCallback(
    async (type: 'BIO' | 'GYM' | 'FUEL' | 'SLEEP' | 'OPS', payload: any, options?: { silent?: boolean }) => {
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
          sleep: JSON.stringify(state.sleep),
          ops: JSON.stringify(state.ops),
        };
        if (monthKeyFromDate(state.activeDate) === state.calendarMonth) {
          await loadCalendarMonth(state.calendarMonth);
        }
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
    [loadCalendarMonth, state.activeDate, state.bio, state.calendarMonth, state.fuel, state.gym.activity, state.gym.workout, state.ops, state.sleep],
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
      const selectedMonth = await getSelectedMonth();
      dispatch({ type: 'SET_CALENDAR_MONTH', payload: selectedMonth });
      await loadDashboard(state.activeDate);
      await loadCalendarMonth(selectedMonth);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message ?? 'Error al cargar' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadCalendarMonth, loadDashboard, state.activeDate]);

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
      const sleepSnapshot = JSON.stringify(state.sleep);
      const opsSnapshot = JSON.stringify(state.ops);

      const saves: Array<Promise<void>> = [];
      if (bioSnapshot !== lastSnapshots.current.bio) {
        saves.push(handleSave('BIO', state.bio, { silent: true }));
        lastSnapshots.current.bio = bioSnapshot;
      }
      if (gymSnapshot !== lastSnapshots.current.gym) {
        saves.push(handleSave('GYM', { workout: state.gym.workout, activity: state.gym.activity }, { silent: true }));
        lastSnapshots.current.gym = gymSnapshot;
      }
      if (fuelSnapshot !== lastSnapshots.current.fuel) {
        saves.push(handleSave('FUEL', state.fuel, { silent: true }));
        lastSnapshots.current.fuel = fuelSnapshot;
      }
      if (sleepSnapshot !== lastSnapshots.current.sleep) {
        saves.push(handleSave('SLEEP', state.sleep, { silent: true }));
        lastSnapshots.current.sleep = sleepSnapshot;
      }
      if (opsSnapshot !== lastSnapshots.current.ops) {
        saves.push(handleSave('OPS', { ops: state.ops }, { silent: true }));
        lastSnapshots.current.ops = opsSnapshot;
      }
      if (saves.length > 0) {
        Promise.all(saves).catch(() => undefined);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [handleSave, state.activeDate, state.bio, state.dashboard, state.fuel, state.gym.activity, state.gym.workout, state.ops, state.sleep, todayStr]);

  useEffect(() => {
    const diff = getMsUntilEndOfDay();
    const timeout = setTimeout(() => {
      if (state.activeDate === todayStr) {
        handleSave('BIO', state.bio, { silent: true });
        handleSave('GYM', { workout: state.gym.workout, activity: state.gym.activity }, { silent: true });
        handleSave('FUEL', state.fuel, { silent: true });
        handleSave('SLEEP', state.sleep, { silent: true });
        handleSave('OPS', { ops: state.ops }, { silent: true });
      }
    }, diff);
    return () => clearTimeout(timeout);
  }, [state.activeDate, state.bio, state.fuel, state.gym.activity, state.gym.workout, state.ops, state.sleep, handleSave, todayStr]);

  const handleDateMove = (direction: number) => {
    if (!state.activeDate || !state.dashboard) return;
    const next = addDays(state.activeDate, direction);
    if (direction > 0 && next > todayStr) return;
    loadDashboard(next).catch((err) => dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Error al cargar' }));
  };

  const handleJumpToDate = () => {
    if (!state.jumpDate) return;
    loadDashboard(state.jumpDate)
      .then(() => dispatch({ type: 'SET_JUMP_DATE', payload: '' }))
      .catch((err) => dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Error al cargar' }));
  };

  const handleDeleteDay = (date: string) => {
    const confirmed = window.confirm(`Eliminar día ${date}?`);
    if (!confirmed) return;
    deleteDay(date)
      .then(async () => {
        await loadDashboard(state.activeDate || todayISOInTZ());
        await loadCalendarMonth(state.calendarMonth);
      })
      .catch((err) => dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Error al borrar' }));
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
      id: `tm-${Date.now()}-${Math.random().toString(16).slice(2)}`,
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
      id: `mn-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      kind: preset.kind,
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

  const handleDeleteActivity = (type: 'treadmill' | 'manual', id: string) => {
    if (type === 'treadmill') {
      dispatch({
        type: 'SET_GYM',
        payload: {
          activity: {
            ...state.gym.activity,
            treadmill: state.gym.activity.treadmill.filter((entry) => entry.id !== id),
          },
        },
      });
      return;
    }
    dispatch({
      type: 'SET_GYM',
      payload: {
        activity: {
          ...state.gym.activity,
          manual: state.gym.activity.manual.filter((entry) => entry.id !== id),
        },
      },
    });
  };

  const handleTrash = (module: 'BIO' | 'GYM' | 'FUEL' | 'SLEEP' | 'OPS') => {
    if (module === 'BIO') {
      const payload = { weight: 0, water: 0, supps: { creat: false, sod: false, mag: false, omega: false } };
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
    if (module === 'SLEEP') {
      const payload = { sleepHours: 0, sleepQuality: 0 };
      dispatch({ type: 'SET_SLEEP', payload });
      handleSave('SLEEP', payload);
    }
    if (module === 'OPS') {
      const payload = { walk10: false, sunlight10: false, stretch10: false };
      dispatch({ type: 'SET_OPS', payload });
      handleSave('OPS', { ops: payload });
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
      await loadCalendarMonth(state.calendarMonth);
      dispatch({ type: 'SET_TOAST', payload: 'IMPORTADO' });
      setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 2000);
    },
    [loadCalendarMonth, loadDashboard, state.activeDate, state.calendarMonth],
  );

  const handleHardReset = async () => {
    const token = window.prompt('Escribe RESET para borrar la base local');
    if (token !== 'RESET') return;
    await hardReset();
    dispatch({ type: 'SET_TOAST', payload: 'RESET OK' });
    setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 2000);
    window.location.reload();
  };

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

  const runway = runwayData(todayStr);
  const monthStats = computeMonthlyPnL(state.monthDays, state.calendarMonth);
  const deficitBank = computeDeficitBank(historyRows);
  const projection = computeProjection(historyRows, state.dashboard?.user.lastWeight ?? 97);
  const riskSummary = computeRiskSummary(historyRows);
  const waterCompliance = computeWaterCompliance(historyRows);
  const weightTrend = computeWeightTrend(historyRows);
  const weightMA = movingAverage(weightTrend, 7);

  const intelSlides = [
    {
      id: 'monthly-pnl',
      title: 'MONTHLY P&L',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <div>Total IN: {monthStats.totalIn}</div>
          <div>Total OUT: {monthStats.totalOut}</div>
          <div>Total NET: {monthStats.totalNet}</div>
          <div>Days logged: {monthStats.daysLogged}</div>
          <div>Deficit days: {monthStats.deficitDays}</div>
          <div>Avg daily NET: {monthStats.avgNet}</div>
        </div>
      ),
    },
    {
      id: 'deficit-bank',
      title: 'DEFICIT BANK',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <div>Deficit accumulated: {Math.round(deficitBank.deficitAccumulated)} kcal</div>
          <div>Estimated kg lost: {deficitBank.estimatedKgLostIfMaintained.toFixed(2)}</div>
          {projection.projections ? (
            <div className="mt-3 space-y-1">
              <div>Avg deficit 7d: {projection.dailyDeficitAvg7.toFixed(1)} kcal</div>
              <div>Days to -5kg: {projection.projections['5kg']}</div>
              <div>Days to -10kg: {projection.projections['10kg']}</div>
              <div>Days to 77kg: {projection.projections.toTarget}</div>
            </div>
          ) : (
            <div>No projection available</div>
          )}
        </div>
      ),
    },
    {
      id: 'runway',
      title: 'RUNWAY',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex justify-between">
            <span>PRE</span>
            <span>{runway.preSeasonEnd}</span>
          </div>
          <div className="flex justify-between">
            <span>SEASON</span>
            <span>{runway.seasonStart} → {runway.seasonEnd}</span>
          </div>
          <div>Today: {runway.todayStr}</div>
          <div>HYROX days left: {daysLeftLabel}</div>
        </div>
      ),
    },
    {
      id: 'risk-governance',
      title: 'RISK & GOVERNANCE',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <div>WEIGHT_UP_ON_DEFICIT: {riskSummary.WEIGHT_UP_ON_DEFICIT}</div>
          <div>NO_DEFICIT_3D: {riskSummary.NO_DEFICIT_3D}</div>
          <div>LOW_WATER_18H: {riskSummary.LOW_WATER_18H}</div>
          <div>Last updated: {dayLog?.tsUpdated ?? '--'}</div>
          <div>Last module today: {meta?.lastModuleToday ?? '--'}</div>
          <div>Data gaps: {meta?.missingDays ?? 0}</div>
        </div>
      ),
    },
    {
      id: 'body-metrics',
      title: 'BODY METRICS',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <div>Weight: {weightForCalc} kg</div>
          <div>BMI: {bmiLive}</div>
          <div>Water compliance 7d: {waterCompliance}%</div>
          <div className="flex items-end gap-1 h-16">
            {weightTrend.map((value, idx) => (
              <div
                key={`${value}-${idx}`}
                style={{ height: `${Math.max(4, value)}px` }}
                className={`w-2 ${idx === weightTrend.length - 1 ? 'bg-accent' : 'bg-slate-500'}`}
              />
            ))}
            {weightMA.map((value, idx) => (
              <div key={`ma-${idx}`} style={{ height: `${Math.max(4, value)}px` }} className="w-1 bg-warning" />
            ))}
          </div>
        </div>
      ),
    },
  ];

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
          <div className="flex flex-wrap gap-2">
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
            {hydrationReminder && (
              <SectionCard>
                <div className="text-xs text-warning">WATER ALERT 18:00+ · WATER &lt; 6</div>
              </SectionCard>
            )}
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
                  <p className={`text-lg font-semibold ${netLive <= 0 ? 'text-success' : 'text-danger'}`}>{netLive}</p>
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
                <h2 className="text-xs tracking-[0.3em] text-slate-400">SLEEP</h2>
                <div className="mt-3 text-lg font-semibold">{state.sleep.sleepHours} h</div>
                <div className="mt-2 text-xs text-slate-400">Avg 7d {sleepAvg7} · Avg 30d {sleepAvg30}</div>
                <div className="mt-1 text-xs text-slate-400">Debt {sleepDebt.toFixed(1)}h</div>
              </SectionCard>
            </div>

            <SectionCard>
              <h2 className="text-xs tracking-[0.3em] text-slate-400">OPS CHECKLIST</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {OPS_KEYS.map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(state.ops[item.key])}
                      onChange={() =>
                        dispatch({ type: 'SET_OPS', payload: { ...state.ops, [item.key]: !state.ops[item.key] } })
                      }
                    />
                    {item.label}
                  </label>
                ))}
                <button
                  onClick={() => handleSave('OPS', { ops: state.ops })}
                  className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent"
                >
                  SAVE OPS
                </button>
              </div>
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
              <h2 className="text-xs tracking-[0.3em] text-slate-400">CONTROL</h2>
              <div className="mt-3 text-xs text-slate-300">Weigh-in streak: {weighInStreak} días</div>
              <div className="mt-2 text-xs text-slate-300">Fasting avg 7d: {fastingAvg7}h</div>
              <div className="mt-1 text-xs text-slate-300">Fasting streak 12h+: {fastingStreak} días</div>
              <div className="mt-1 text-xs text-slate-300">Routine next: {routineLabel}</div>
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
            {hydrationReminder && (
              <div className="text-xs text-warning border border-warning/60 rounded-lg p-2">WATER ALERT 18:00+</div>
            )}
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
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleWaterSet(Math.min(10, state.bio.water + 2))}
                    className="px-2 py-1 border border-slateborder rounded-lg text-xs"
                  >
                    +2 blocks
                  </button>
                  <button
                    onClick={() => handleWaterSet(0)}
                    className="px-2 py-1 border border-slateborder rounded-lg text-xs"
                  >
                    Reset water
                  </button>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Supps Stack</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {SUPPS.map((supp) => (
                  <label key={supp.key} className="flex items-center gap-2 text-xs text-slate-300">
                    <input type="checkbox" checked={Boolean(state.bio.supps[supp.key])} onChange={() => handleSuppToggle(supp.key)} />
                    {supp.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">OPS CHECKLIST</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {OPS_KEYS.map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(state.ops[item.key])}
                      onChange={() =>
                        dispatch({ type: 'SET_OPS', payload: { ...state.ops, [item.key]: !state.ops[item.key] } })
                      }
                    />
                    {item.label}
                  </label>
                ))}
                <button
                  onClick={() => handleSave('OPS', { ops: state.ops })}
                  className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent"
                >
                  SAVE OPS
                </button>
              </div>
            </div>
            <button
              onClick={() => handleSave('BIO', state.bio)}
              className="w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
            >
              GUARDAR BIO
            </button>
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
                    dispatch({ type: 'SET_GYM', payload: { treadmill: { ...state.gym.treadmill, speed: Number(event.target.value) } } })
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
                    dispatch({ type: 'SET_GYM', payload: { treadmill: { ...state.gym.treadmill, incline: Number(event.target.value) } } })
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
                    dispatch({ type: 'SET_GYM', payload: { treadmill: { ...state.gym.treadmill, minutes: Number(event.target.value) } } })
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
                <div key={entry.id} className="flex items-center justify-between text-slate-400">
                  <span>
                    {entry.speed}km/h · {entry.incline}% · {entry.minutes}m
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{entry.kcal} kcal</span>
                    <button onClick={() => handleDeleteActivity('treadmill', entry.id)} className="text-xs text-danger">
                      DEL
                    </button>
                  </div>
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
                            manualMinutes: { ...state.gym.manualMinutes, [preset.key]: Number(event.target.value) },
                          },
                        })
                      }
                      className="flex-1 rounded-lg border border-slateborder bg-slatebase px-2 py-1 text-xs text-slate-200"
                    />
                    <button onClick={() => handleAddManual(preset)} className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent">
                      ADD
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 text-xs">
                {state.gym.activity.manual.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-slate-400">
                    <span>
                      {entry.label} · {entry.minutes}m
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{entry.kcal} kcal</span>
                      <button onClick={() => handleDeleteActivity('manual', entry.id)} className="text-xs text-danger">
                        DEL
                      </button>
                    </div>
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
          </SectionCard>

          <SectionCard className="space-y-3">
            <h2 className="text-xs tracking-[0.3em] text-slate-400">OUT TOTAL</h2>
            <div className="text-lg font-semibold">{calOutLive}</div>
            <div className="text-xs text-slate-400">BMR {bmrLive} · Exercise {extraBurn}</div>
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
          </SectionCard>

          <SectionCard>
            <h2 className="text-xs tracking-[0.3em] text-slate-400">CONVERSION</h2>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li>Meat g × 2.5</li>
              <li>Eggs × 75</li>
              <li>Butter g × 7.2</li>
            </ul>
            <div className="mt-3 text-xs text-slate-400">Total IN: {calInLive}</div>
          </SectionCard>
        </section>
      )}

      {state.activeTab === 'Sleep' && dayLog && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <SectionCard className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs tracking-[0.3em] text-slate-400">SLEEP MODULE</h2>
              <button onClick={() => handleTrash('SLEEP')} className="text-xs text-danger">
                TRASH
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-slate-400">
                Sleep Hours
                <input
                  type="number"
                  value={state.sleep.sleepHours}
                  onChange={(event) => dispatch({ type: 'SET_SLEEP', payload: { sleepHours: Number(event.target.value) } })}
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
              <label className="text-xs text-slate-400">
                Quality (1-5)
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={state.sleep.sleepQuality}
                  onChange={(event) => dispatch({ type: 'SET_SLEEP', payload: { sleepQuality: Number(event.target.value) } })}
                  className="mt-1 w-full rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
                />
              </label>
            </div>
            <button
              onClick={() => handleSave('SLEEP', state.sleep)}
              className="w-full rounded-lg border border-accent bg-accent/20 py-2 text-xs tracking-[0.3em] text-accent"
            >
              GUARDAR SLEEP
            </button>
          </SectionCard>

          <SectionCard>
            <h2 className="text-xs tracking-[0.3em] text-slate-400">SLEEP STATS</h2>
            <div className="mt-3 text-xs text-slate-300">Avg 7d: {sleepAvg7}h</div>
            <div className="mt-1 text-xs text-slate-300">Avg 30d: {sleepAvg30}h</div>
            <div className="mt-1 text-xs text-slate-300">Debt: {sleepDebt.toFixed(1)}h</div>
          </SectionCard>
        </section>
      )}

      {state.activeTab === 'Data' && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <SectionCard>
            <h2 className="text-xs tracking-[0.3em] text-slate-400">DATA LEDGER (30)</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <input
                type="date"
                value={state.jumpDate}
                onChange={(event) => dispatch({ type: 'SET_JUMP_DATE', payload: event.target.value })}
                className="rounded-lg border border-slateborder bg-slatebase px-3 py-2 text-slate-200"
              />
              <button onClick={handleJumpToDate} className="px-3 py-2 border border-slateborder rounded-lg hover:border-accent">
                IR A FECHA
              </button>
            </div>
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
                    <th className="text-left">FAST</th>
                    <th className="text-left">SLEEP</th>
                    <th className="text-left">SCORE</th>
                    <th className="text-left">ACTIONS</th>
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
                      <td>{row.fastHours}</td>
                      <td>{row.sleepHours}</td>
                      <td>{row.score}</td>
                      <td>
                        <button onClick={() => handleDeleteDay(row.date)} className="text-xs text-danger">
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
          <div className="grid gap-4">
            <SectionCard>
              <CalendarMonth
                monthLabel={state.calendarMonth}
                days={calendarDays}
                onPrev={async () => {
                  const nextMonth = shiftMonth(state.calendarMonth, -1);
                  dispatch({ type: 'SET_CALENDAR_MONTH', payload: nextMonth });
                  await setSelectedMonth(nextMonth);
                  await loadCalendarMonth(nextMonth);
                }}
                onNext={async () => {
                  const nextMonth = shiftMonth(state.calendarMonth, 1);
                  dispatch({ type: 'SET_CALENDAR_MONTH', payload: nextMonth });
                  await setSelectedMonth(nextMonth);
                  await loadCalendarMonth(nextMonth);
                }}
                onSelect={(date) => loadDashboard(date).catch(() => undefined)}
                footer="Phase-first view with module dots."
              />
            </SectionCard>
            <SectionCard>
              <h2 className="text-xs tracking-[0.3em] text-slate-400">BACKUP</h2>
              <p className="mt-3 text-xs text-slate-400">Exporta o importa la base local completa.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={handleExport} className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent">
                  EXPORT JSON
                </button>
                <label className="px-3 py-2 border border-slateborder rounded-lg text-xs hover:border-accent cursor-pointer">
                  IMPORT JSON
                  <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
                </label>
                <button onClick={handleHardReset} className="px-3 py-2 border border-danger/60 text-danger rounded-lg text-xs">
                  HARD RESET
                </button>
              </div>
            </SectionCard>
          </div>
        </section>
      )}

      {state.activeTab === 'Intel' && (
        <section className="mt-6">
          <IntelSlides slides={intelSlides} activeIndex={state.intelSlide} onSelect={(idx) => dispatch({ type: 'SET_INTEL_SLIDE', payload: idx })} />
        </section>
      )}

      {state.activeTab === 'Protocol' && (
        <section className="mt-6 border border-slateborder bg-slatepanel/80 rounded-xl p-6">
          <h2 className="text-xs tracking-[0.3em] text-slate-400">PROTOCOL</h2>
          <div className="mt-4 text-xs text-slate-300 space-y-2">
            <p>1. Carnívoro estricto, sin procesados.</p>
            <p>2. 2MAD: dos comidas al día, sin snacks.</p>
            <p>3. Ayuno con timer persistente en local.</p>
            <p>4. Score diario basado en déficit, agua y gasto.</p>
            <p>5. Ledger es auditoría, no reporte.</p>
          </div>
        </section>
      )}
    </main>
  );
}
