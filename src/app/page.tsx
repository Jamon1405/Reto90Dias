'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BioTab, type BioData } from '@/components/tabs/BioTab';
import { GymTab, type GymData } from '@/components/tabs/GymTab';
import { ExtraTab, type ExtraData } from '@/components/tabs/ExtraTab';
import { FuelTab, type FuelData } from '@/components/tabs/FuelTab';
import { SleepTab, type SleepData } from '@/components/tabs/SleepTab';
import { RecoveryTab, type RecoveryData } from '@/components/tabs/RecoveryTab';
import { CheckinTab, type CheckinData } from '@/components/tabs/CheckinTab';
import { InbodyTab, type InbodyData } from '@/components/tabs/InbodyTab';
import { Button } from '@/components/ui/button';
import { addDays, monthDays, todayISO } from '@/lib/timezone';
import { computeCalIn, computeNet } from '@/lib/calc';
import type { DayLog } from '@/lib/models';
import {
  defaultCheckin,
  defaultExtraBurn,
  defaultInbody,
  defaultMacros,
  defaultRecovery,
  defaultSupps,
} from '@/lib/zodSchemas';

const TAB_LABELS = ['BIO', 'GYM', 'EXTRA', 'FUEL', 'SLEEP', 'RECOVERY', 'CHECKIN', 'INBODY'] as const;

type TabKey = (typeof TAB_LABELS)[number];

type DashboardResponse = {
  meta: {
    targetDate: string;
    todayStr: string;
    daysLeft: number;
    season: string;
    fastingStartMs: number | null;
  };
  user: {
    age: number;
    lastWeight: number;
  };
  dayLog: DayLog;
  calendar: Array<{ dateISO: string; score: number }>;
  historyLast30: DayLog[];
};

const defaultDayLog: DayLog = {
  dateISO: todayISO(),
  weightKg: 0,
  waistCm: 0,
  steps: 0,
  waterCups: 0,
  suppsJson: defaultSupps,
  workout: '',
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
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabKey>('BIO');
  const [activeDate, setActiveDate] = useState(todayISO());
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fastingElapsed, setFastingElapsed] = useState<number>(0);
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
  });

  const loadDashboard = useCallback(async (dateISO: string) => {
    const response = await fetch(`/api/dashboard?date=${dateISO}`);
    const payload = await response.json();
    if (!payload.success) {
      setToast(payload.error ?? 'Error al cargar dashboard');
      return;
    }
    setDashboard(payload.data);
    const dayLog = payload.data.dayLog ?? defaultDayLog;
    setBio({
      weightKg: dayLog.weightKg,
      waistCm: dayLog.waistCm,
      steps: dayLog.steps,
      waterCups: dayLog.waterCups,
      suppsJson: dayLog.suppsJson,
    });
    setGym({ workout: dayLog.workout });
    setExtra({ extraBurnJson: dayLog.extraBurnJson });
    setFuel({ macrosJson: dayLog.macrosJson, notes: dayLog.notes ?? '' });
    setSleep({ sleepHours: dayLog.sleepHours });
    setRecovery({ recoveryJson: dayLog.recoveryJson });
    setCheckin({ checkinJson: dayLog.checkinJson });
    setInbody({ inbodyJson: dayLog.inbodyJson, waistCm: dayLog.waistCm });
    dirtyRef.current = { ...dirtyRef.current, BIO: false, GYM: false, EXTRA: false, FUEL: false, SLEEP: false, RECOVERY: false, CHECKIN: false, INBODY: false };
  }, []);

  useEffect(() => {
    loadDashboard(activeDate);
  }, [activeDate, loadDashboard]);

  useEffect(() => {
    if (!dashboard?.meta.fastingStartMs) {
      setFastingElapsed(0);
      return;
    }
    const updateElapsed = () => {
      const hours = (Date.now() - dashboard.meta.fastingStartMs) / 3600000;
      setFastingElapsed(Math.round(hours * 100) / 100);
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);
    return () => clearInterval(interval);
  }, [dashboard?.meta.fastingStartMs]);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = todayISO();
      if (activeDate !== today) return;
      (Object.keys(dirtyRef.current) as TabKey[]).forEach((key) => {
        if (dirtyRef.current[key]) {
          handleSave(key, true);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [activeDate]);

  const handleSave = useCallback(
    async (tab: TabKey, silent = false) => {
      setSaving((prev) => ({ ...prev, [tab]: true }));
      const targetDate = activeDate;
      let payload: Record<string, unknown> = {};
      if (tab === 'BIO') payload = { ...bio };
      if (tab === 'GYM') payload = { ...gym };
      if (tab === 'EXTRA') payload = { ...extra };
      if (tab === 'FUEL') payload = { ...fuel };
      if (tab === 'SLEEP') payload = { ...sleep };
      if (tab === 'RECOVERY') payload = { ...recovery };
      if (tab === 'CHECKIN') payload = { ...checkin };
      if (tab === 'INBODY') payload = { ...inbody };

      const response = await fetch('/api/module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tab, targetDate, payload }),
      });
      const result = await response.json();
      setSaving((prev) => ({ ...prev, [tab]: false }));
      if (!result.success) {
        setToast(result.error ?? 'Error al guardar');
        return;
      }
      dirtyRef.current[tab] = false;
      if (!silent) {
        setToast('Guardado');
        setTimeout(() => setToast(null), 2000);
      }
      await loadDashboard(activeDate);
    },
    [activeDate, bio, gym, extra, fuel, sleep, recovery, checkin, inbody, loadDashboard],
  );

  const dayLog = dashboard?.dayLog ?? defaultDayLog;
  const calIn = useMemo(() => computeCalIn(fuel.macrosJson), [fuel.macrosJson]);
  const net = useMemo(() => computeNet(dayLog.calIn, dayLog.calOut), [dayLog.calIn, dayLog.calOut]);
  const todayStr = dashboard?.meta.todayStr ?? todayISO();
  const canGoNext = activeDate < todayStr;

  const calendarDays = monthDays(activeDate);

  const handleFasting = async (action: 'start' | 'stop' | 'reset') => {
    const response = await fetch(`/api/fasting/${action}`, { method: 'POST' });
    const result = await response.json();
    if (!result.success) {
      setToast(result.error ?? 'Error en ayuno');
      return;
    }
    await loadDashboard(activeDate);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">TITAN OMEGA v2.0</h1>
            <p className="text-xs text-slate-500">Zona horaria fija: America/Mexico_City</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveDate(addDays(activeDate, -1))}>
              ◀ Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveDate(todayStr)}>
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={() => canGoNext && setActiveDate(addDays(activeDate, 1))} disabled={!canGoNext}>
              Next ▶
            </Button>
            <span className="text-sm font-medium">{activeDate}</span>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">{dashboard?.meta.season ?? 'PRE-SEASON'}</span>
            <span className="text-xs text-slate-600">{dashboard?.meta.daysLeft ?? 0} días a HYROX</span>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
              <span>Ayuno:</span>
              <span className="font-semibold">
                {dashboard?.meta.fastingStartMs ? `${fastingElapsed}h` : 'OFF'}
              </span>
              <Button size="sm" variant="outline" onClick={() => handleFasting('start')}>Start</Button>
              <Button size="sm" variant="outline" onClick={() => handleFasting('stop')}>Stop</Button>
              <Button size="sm" variant="ghost" onClick={() => handleFasting('reset')}>Reset</Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6">
          {[
            { label: 'Weight', value: dayLog.weightKg.toFixed(1) },
            { label: 'BMR', value: dayLog.flagsJson.bmr },
            { label: 'IN', value: dayLog.calIn },
            { label: 'OUT', value: dayLog.calOut },
            { label: 'NET', value: net },
            { label: 'TitanScore', value: dayLog.titanScore },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-center">
              <div className="text-xs text-slate-500">{item.label}</div>
              <div className={`text-lg font-semibold ${item.label === 'NET' && net <= 0 ? 'text-emerald-600' : ''}`}>
                {item.value}
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {TAB_LABELS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  activeTab === tab ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'
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
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Calendario</h2>
            <div className="mt-3 grid grid-cols-7 gap-2 text-center text-xs">
              {calendarDays.map((dateISO) => {
                const score = dashboard?.calendar.find((day) => day.dateISO === dateISO)?.score ?? 0;
                const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-rose-500';
                return (
                  <button
                    key={dateISO}
                    className="rounded-lg border border-slate-200 px-2 py-2"
                    onClick={() => setActiveDate(dateISO > todayStr ? todayStr : dateISO)}
                  >
                    <div className="text-[10px] text-slate-500">{dateISO.split('-')[2]}</div>
                    <div className={`mx-auto mt-1 h-2 w-2 rounded-full ${score > 0 ? color : 'bg-slate-200'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Risk Flags</h2>
            <div className="mt-3 space-y-2 text-xs">
              {dayLog.flagsJson.list.length === 0 ? (
                <p className="text-slate-500">Sin flags activos.</p>
              ) : (
                dayLog.flagsJson.list.map((flag) => (
                  <div key={flag.code} className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-600">
                    {flag.msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Ledger (últimos 30 días)</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2">Fecha</th>
                  <th className="py-2">Peso</th>
                  <th className="py-2">IN</th>
                  <th className="py-2">OUT</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
            {(dashboard?.historyLast30 ?? []).map((row) => (
                  <tr key={row.dateISO} className="border-t border-slate-100">
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

        {toast && (
          <div className="fixed bottom-6 right-6 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
        )}
      </div>
    </main>
  );
}
