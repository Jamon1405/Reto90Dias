'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { BioTab, type BioData } from '@/components/tabs/BioTab';
import { GymTab, type GymData } from '@/components/tabs/GymTab';
import { ExtraTab, type ExtraData } from '@/components/tabs/ExtraTab';
import { FuelTab, type FuelData } from '@/components/tabs/FuelTab';
import { SleepTab, type SleepData } from '@/components/tabs/SleepTab';
import { RecoveryTab, type RecoveryData } from '@/components/tabs/RecoveryTab';
import { CheckinTab, type CheckinData } from '@/components/tabs/CheckinTab';
import { InbodyTab, type InbodyData } from '@/components/tabs/InbodyTab';
import { IntelTab } from '@/components/tabs/IntelTab';
import { Button } from '@/components/ui/button';
import { computeCalIn, computeNet, computeOutBreakdown, computeTitanScore, daysLeftToTarget, getAssignedRoutine, seasonForDate } from '@/lib/calc';
import { computeIntel } from '@/lib/intel';
import type { DayLog } from '@/lib/models';
import {
  exportJSON,
  getDay,
  getFastingStart,
  getHistoryLastN,
  getLastSaved,
  getMonthCalendar,
  importJSON,
  setFastingStart,
  upsertDay,
} from '@/lib/localStore';
import { addDays, buildMonthGrid, formatDateTime_MX, formatTimeMX, todayISO_MX } from '@/lib/timezone';
import {
  defaultCheckin,
  defaultExtraBurn,
  defaultGym,
  defaultInbody,
  defaultMacros,
  defaultRecovery,
  defaultSupps,
} from '@/lib/zodSchemas';

const TAB_LABELS = ['BIO', 'GYM', 'EXTRA', 'FUEL', 'SLEEP', 'RECOVERY', 'CHECKIN', 'INBODY', 'INTEL'] as const;

type TabKey = (typeof TAB_LABELS)[number];

const defaultDayLog: DayLog = {
  dateISO: todayISO_MX(),
  updatedAt: null,
  weightKg: 0,
  waistCm: 0,
  steps: 0,
  waterCups: 0,
  suppsJson: defaultSupps,
  workout: '',
  gymMinutes: defaultGym.gymMinutes,
  gymType: defaultGym.gymType,
  gymCals: defaultGym.gymCals,
  extraBurnJson: defaultExtraBurn,
  macrosJson: defaultMacros,
  calIn: 0,
  calOut: 0,
  fastingHours: 0,
  sleepHours: 0,
  recoveryJson: defaultRecovery,
  checkinJson: defaultCheckin,
  inbodyJson: defaultInbody,
  notes: '',
  titanScore: 0,
  flagsJson: { list: [], bmr: 0, net: 0 },
};

const emptySavingState: Record<TabKey, boolean> = {
  BIO: false,
  GYM: false,
  EXTRA: false,
  FUEL: false,
  SLEEP: false,
  RECOVERY: false,
  CHECKIN: false,
  INBODY: false,
  INTEL: false,
};

function monthKeyFromDate(dateISO: string) {
  return dateISO.slice(0, 7);
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabKey>('BIO');
  const [activeDate, setActiveDate] = useState(todayISO_MX());
  const [calendarMonth, setCalendarMonth] = useState(monthKeyFromDate(todayISO_MX()));
  const [dayLog, setDayLog] = useState<DayLog>(defaultDayLog);
  const [history, setHistory] = useState<DayLog[]>([]);
  const [calendarScores, setCalendarScores] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [fastingStartMs, setFastingStartMs] = useState<number | null>(null);
  const [fastingElapsed, setFastingElapsed] = useState<number>(0);
  const [clock, setClock] = useState(formatTimeMX());
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [saving, setSaving] = useState(emptySavingState);

  const [bio, setBio] = useState<BioData>({
    weightKg: 0,
    waistCm: 0,
    steps: 0,
    waterCups: 0,
    suppsJson: defaultSupps,
  });
  const [gym, setGym] = useState<GymData>({ workout: '' });
  const [extra, setExtra] = useState<ExtraData>({ extraBurnJson: defaultExtraBurn });
  const [fuel, setFuel] = useState<FuelData>({ macrosJson: defaultMacros, notes: '' });
  const [sleep, setSleep] = useState<SleepData>({ sleepHours: 0 });
  const [recovery, setRecovery] = useState<RecoveryData>({ recoveryJson: defaultRecovery });
  const [checkin, setCheckin] = useState<CheckinData>({ checkinJson: defaultCheckin });
  const [inbody, setInbody] = useState<InbodyData>({ inbodyJson: defaultInbody, waistCm: 0 });

  const dirtyRef = useRef<Record<TabKey, boolean>>({
    BIO: false,
    GYM: false,
    EXTRA: false,
    FUEL: false,
    SLEEP: false,
    RECOVERY: false,
    CHECKIN: false,
    INBODY: false,
    INTEL: false,
  });

  const todayStr = todayISO_MX();

  const loadDay = useCallback(async (dateISO: string) => {
    const day = await getDay(dateISO);
    setDayLog(day);
    setBio({
      weightKg: day.weightKg,
      waistCm: day.waistCm,
      steps: day.steps,
      waterCups: day.waterCups,
      suppsJson: day.suppsJson,
    });
    setGym({ workout: day.workout });
    setExtra({ extraBurnJson: day.extraBurnJson });
    setFuel({ macrosJson: day.macrosJson, notes: day.notes ?? '' });
    setSleep({ sleepHours: day.sleepHours });
    setRecovery({ recoveryJson: day.recoveryJson });
    setCheckin({ checkinJson: day.checkinJson });
    setInbody({ inbodyJson: day.inbodyJson, waistCm: day.waistCm });
    setLastSaved(await getLastSaved(dateISO));
    dirtyRef.current = { ...dirtyRef.current, BIO: false, GYM: false, EXTRA: false, FUEL: false, SLEEP: false, RECOVERY: false, CHECKIN: false, INBODY: false };
  }, []);

  const loadHistory = useCallback(async () => {
    const rows = await getHistoryLastN(30);
    setHistory(rows);
  }, []);

  const loadCalendar = useCallback(async () => {
    const [year, month] = calendarMonth.split('-').map(Number);
    const scores = await getMonthCalendar(year, month);
    const map: Record<string, number> = {};
    scores.forEach((item) => {
      map[item.dateISO] = item.score;
    });
    setCalendarScores(map);
  }, [calendarMonth]);

  const loadFasting = useCallback(async () => {
    const start = await getFastingStart();
    setFastingStartMs(start);
  }, []);

  useEffect(() => {
    loadDay(activeDate);
    loadHistory();
    loadCalendar();
    loadFasting();
  }, [activeDate, loadCalendar, loadDay, loadFasting, loadHistory]);

  useEffect(() => {
    const key = monthKeyFromDate(activeDate);
    if (key !== calendarMonth) {
      setCalendarMonth(key);
    }
  }, [activeDate, calendarMonth]);

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(formatTimeMX());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!fastingStartMs) {
      setFastingElapsed(0);
      return;
    }
    const updateElapsed = () => {
      const hours = (Date.now() - fastingStartMs) / 3600000;
      setFastingElapsed(Math.round(hours * 100) / 100);
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);
    return () => clearInterval(interval);
  }, [fastingStartMs]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeDate !== todayStr) return;
      (Object.keys(dirtyRef.current) as TabKey[]).forEach((key) => {
        if (dirtyRef.current[key]) {
          handleSave(key, true);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [activeDate, todayStr]);

  const handleSave = useCallback(
    async (tab: TabKey, silent = false) => {
      if (tab === 'INTEL') return;
      setSaving((prev) => ({ ...prev, [tab]: true }));
      let update: Partial<DayLog> = {};
      if (tab === 'BIO') update = { ...bio };
      if (tab === 'GYM') update = { ...gym, gymMinutes: dayLog.gymMinutes, gymType: dayLog.gymType };
      if (tab === 'EXTRA') update = { ...extra };
      if (tab === 'FUEL') update = { ...fuel };
      if (tab === 'SLEEP') update = { ...sleep };
      if (tab === 'RECOVERY') update = { ...recovery };
      if (tab === 'CHECKIN') update = { ...checkin };
      if (tab === 'INBODY') update = { ...inbody };

      const saved = await upsertDay(activeDate, update);
      setDayLog(saved);
      setLastSaved(saved.updatedAt);
      await loadHistory();
      await loadCalendar();

      setSaving((prev) => ({ ...prev, [tab]: false }));
      dirtyRef.current[tab] = false;
      if (!silent) {
        setToast('Guardado');
        setTimeout(() => setToast(null), 2000);
      } else {
        setToast('AUTO');
        setTimeout(() => setToast(null), 1500);
      }
    },
    [activeDate, bio, gym, extra, fuel, sleep, recovery, checkin, inbody, loadCalendar, loadHistory],
  );

  const handleFasting = async (action: 'start' | 'stop' | 'reset') => {
    if (action === 'start') {
      const start = Date.now();
      await setFastingStart(start);
      setFastingStartMs(start);
      return;
    }
    if (action === 'reset') {
      await setFastingStart(null);
      setFastingStartMs(null);
      return;
    }
    if (!fastingStartMs) return;
    const hours = Math.round(((Date.now() - fastingStartMs) / 3600000) * 100) / 100;
    await setFastingStart(null);
    setFastingStartMs(null);
    await upsertDay(todayStr, { fastingHours: hours });
    await loadDay(activeDate);
    await loadHistory();
  };

  const handleExport = async () => {
    const payload = await exportJSON();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `titan-omega-${payload.exportedAt}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const content = await file.text();
      const payload = JSON.parse(content);
      await importJSON(payload);
      await loadDay(activeDate);
      await loadHistory();
      await loadCalendar();
      setToast('IMPORTADO');
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast('Archivo inválido');
      setTimeout(() => setToast(null), 2000);
    }
  };

  const calIn = useMemo(() => computeCalIn(fuel.macrosJson), [fuel.macrosJson]);
  const extraOut = Number(extra.extraBurnJson.totalCals ?? 0);
  const lastKnownWeight = useMemo(() => {
    const sorted = [...history].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
    return sorted.find((entry) => entry.weightKg > 0)?.weightKg ?? 97;
  }, [history]);
  const weightForOut = Number(bio.weightKg || dayLog.weightKg || lastKnownWeight || 97);
  const outBreakdown = useMemo(
    () =>
      computeOutBreakdown({
        weightKg: weightForOut,
        gymMinutes: dayLog.gymMinutes,
        gymType: dayLog.gymType,
        extraOut,
      }),
    [dayLog.gymMinutes, dayLog.gymType, extraOut, weightForOut],
  );
  const totalOut = outBreakdown.totalOut;
  const net = useMemo(() => computeNet(calIn, totalOut), [calIn, totalOut]);
  const liveScore = useMemo(
    () =>
      computeTitanScore({
        net,
        waterCups: Number(bio.waterCups ?? 0),
        steps: Number(bio.steps ?? 0),
        calOut: totalOut,
      }),
    [bio.steps, bio.waterCups, net, totalOut],
  );
  const season = seasonForDate(todayStr);
  const daysLeft = daysLeftToTarget(todayStr);

  const [calendarYear, calendarMonthNumber] = calendarMonth.split('-').map(Number);
  const calendarCells = buildMonthGrid(calendarYear, calendarMonthNumber);
  const intel = useMemo(() => (history.length ? computeIntel(history) : null), [history]);
  const routineLabel = getAssignedRoutine(activeDate);

  return (
    <main className="min-h-screen bg-bg px-4 py-6 text-text md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-border bg-panel p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">TITAN OMEGA v2.0</h1>
            <p className="text-xs text-muted">Zona horaria fija: America/Mexico_City</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => setActiveDate(addDays(activeDate, -1))}>
              ◀ Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveDate(todayStr)}>
              Hoy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => activeDate < todayStr && setActiveDate(addDays(activeDate, 1))}
              disabled={activeDate >= todayStr}
            >
              Next ▶
            </Button>
            <span className="text-sm font-medium">{activeDate}</span>
            <span className="rounded-full bg-accent px-3 py-1 text-xs text-white">{season}</span>
            <span className="text-xs text-muted">{daysLeft} días a HYROX</span>
            <div className="flex flex-col text-xs text-muted">
              <span>Hora MX: {clock}</span>
              <span>Last saved: {lastSaved ? formatDateTime_MX(new Date(lastSaved)) : '—'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs">
              <span>Ayuno:</span>
              <span className="font-semibold text-text">{fastingStartMs ? `${fastingElapsed}h` : 'OFF'}</span>
              <Button size="sm" variant="outline" onClick={() => handleFasting('start')}>
                Start
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleFasting('stop')}>
                Stop
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleFasting('reset')}>
                Reset
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-xl border border-border bg-panel p-4 shadow-sm md:grid-cols-6">
          {[
            { label: 'Weight', value: weightForOut.toFixed(1) },
            { label: 'BMR', value: outBreakdown.bmr },
            { label: 'IN', value: calIn },
            { label: 'OUT', value: totalOut },
            { label: 'NET', value: net },
            { label: 'TitanScore', value: liveScore },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-surface px-3 py-3 text-center">
              <div className="text-xs text-muted">{item.label}</div>
              <div className={`text-lg font-semibold ${item.label === 'NET' && net <= 0 ? 'text-success' : 'text-text'}`}>
                {item.value}
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-border bg-panel p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {TAB_LABELS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  activeTab === tab ? 'bg-accent text-white' : 'border border-border text-muted'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === 'BIO' && (
              <BioTab
                data={bio}
                onChange={(next) => {
                  setBio(next);
                  dirtyRef.current.BIO = true;
                }}
                onSave={() => handleSave('BIO')}
                saving={saving.BIO}
              />
            )}
            {activeTab === 'GYM' && (
              <GymTab
                data={gym}
                breakdown={{
                  ...outBreakdown,
                  eventsCount: extra.extraBurnJson.events.length,
                  extraTotal: extraOut,
                  weightKg: weightForOut,
                }}
                routineLabel={routineLabel}
                gymMinutes={dayLog.gymMinutes}
                gymType={dayLog.gymType}
                onCopyPlan={(text) => {
                  setGym({ workout: `${gym.workout}${gym.workout ? '\n' : ''}${text}` });
                  dirtyRef.current.GYM = true;
                }}
                onGymUpdate={(update) => {
                  setDayLog((prev) => ({ ...prev, ...update }));
                  dirtyRef.current.GYM = true;
                }}
                onChange={(next) => {
                  setGym(next);
                  dirtyRef.current.GYM = true;
                }}
                onSave={() => handleSave('GYM')}
                saving={saving.GYM}
              />
            )}
            {activeTab === 'EXTRA' && (
              <ExtraTab
                data={extra}
                weightKg={bio.weightKg}
                onChange={(next) => {
                  setExtra(next);
                  dirtyRef.current.EXTRA = true;
                }}
                onSave={() => handleSave('EXTRA')}
                saving={saving.EXTRA}
              />
            )}
            {activeTab === 'FUEL' && (
              <FuelTab
                data={fuel}
                calIn={calIn}
                onChange={(next) => {
                  setFuel(next);
                  dirtyRef.current.FUEL = true;
                }}
                onSave={() => handleSave('FUEL')}
                saving={saving.FUEL}
              />
            )}
            {activeTab === 'SLEEP' && (
              <SleepTab
                data={sleep}
                onChange={(next) => {
                  setSleep(next);
                  dirtyRef.current.SLEEP = true;
                }}
                onSave={() => handleSave('SLEEP')}
                saving={saving.SLEEP}
              />
            )}
            {activeTab === 'RECOVERY' && (
              <RecoveryTab
                data={recovery}
                onChange={(next) => {
                  setRecovery(next);
                  dirtyRef.current.RECOVERY = true;
                }}
                onSave={() => handleSave('RECOVERY')}
                saving={saving.RECOVERY}
              />
            )}
            {activeTab === 'CHECKIN' && (
              <CheckinTab
                data={checkin}
                onChange={(next) => {
                  setCheckin(next);
                  dirtyRef.current.CHECKIN = true;
                }}
                onSave={() => handleSave('CHECKIN')}
                saving={saving.CHECKIN}
              />
            )}
            {activeTab === 'INBODY' && (
              <InbodyTab
                data={inbody}
                onChange={(next) => {
                  setInbody(next);
                  dirtyRef.current.INBODY = true;
                }}
                onSave={() => handleSave('INBODY')}
                saving={saving.INBODY}
              />
            )}
            {activeTab === 'INTEL' && <IntelTab day={dayLog} intel={intel} />}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-panel p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Calendario</h2>
              <div className="flex items-center gap-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const [year, month] = calendarMonth.split('-').map(Number);
                    const date = new Date(Date.UTC(year, month - 2, 1));
                    setCalendarMonth(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`);
                  }}
                >
                  ◀ Prev Month
                </Button>
                <span className="text-muted">{calendarMonth}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const [year, month] = calendarMonth.split('-').map(Number);
                    const date = new Date(Date.UTC(year, month, 1));
                    setCalendarMonth(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`);
                  }}
                >
                  Next Month ▶
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="text-muted">{day}</div>
              ))}
              {calendarCells.map((cell) => {
                const score = calendarScores[cell.dateISO] ?? 0;
                const isToday = cell.dateISO === todayStr;
                const color = score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-danger';
                return (
                  <button
                    key={cell.dateISO}
                    className={`rounded-lg border border-border px-2 py-2 ${cell.inMonth ? 'bg-surface' : 'bg-bg/40'} ${
                      isToday ? 'ring-2 ring-accent' : ''
                    }`}
                    onClick={() => setActiveDate(cell.dateISO > todayStr ? todayStr : cell.dateISO)}
                  >
                    <div className={`text-[10px] ${cell.inMonth ? 'text-text' : 'text-muted'}`}>{cell.dateISO.split('-')[2]}</div>
                    <div className={`mx-auto mt-1 h-2 w-2 rounded-full ${score > 0 ? color : 'bg-border'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-panel p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-text">Risk Flags</h2>
            <div className="mt-3 space-y-2 text-xs">
              {dayLog.flagsJson.list.length === 0 ? (
                <p className="text-muted">Sin flags activos.</p>
              ) : (
                dayLog.flagsJson.list.map((flag) => (
                  <div key={flag} className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-danger">
                    {flag}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-panel p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-text">Ledger (últimos 30 días)</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="text-muted">
                <tr>
                  <th className="py-2">Fecha</th>
                  <th className="py-2">Peso</th>
                  <th className="py-2">IN</th>
                  <th className="py-2">OUT</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.dateISO} className="border-t border-border">
                    <td className="py-2">{row.dateISO}</td>
                    <td className="py-2">{row.weightKg.toFixed(1)}</td>
                    <td className="py-2">{row.calIn}</td>
                    <td className="py-2">{row.calOut}</td>
                    <td className="py-2">{row.titanScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-panel p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-text">Backup local</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Exportar JSON
            </Button>
            <label className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-text">
              Importar JSON
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleImport(file);
                  }
                }}
              />
            </label>
            <span>Guardado local en IndexedDB.</span>
          </div>
        </section>

        {toast && (
          <div className="fixed bottom-6 right-6 rounded-lg bg-accent px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
        )}
      </div>
    </main>
  );
}
