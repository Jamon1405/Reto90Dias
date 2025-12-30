import type { ReactNode } from 'react';

export type CalendarDay = {
  date: string;
  score: number;
  phase: 'PRE-SEASON' | 'SEASON' | 'POST-SEASON';
};

const PHASE_STYLES: Record<CalendarDay['phase'], string> = {
  'PRE-SEASON': 'border-l-4 border-l-slate-500',
  SEASON: 'border-l-4 border-l-accent',
  'POST-SEASON': 'border-l-4 border-l-warning',
};

export default function CalendarMonth({
  monthLabel,
  days,
  onPrev,
  onNext,
  footer,
}: {
  monthLabel: string;
  days: CalendarDay[];
  onPrev: () => void;
  onNext: () => void;
  footer?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xs tracking-[0.3em] text-slate-400">MONTH CALENDAR</h2>
        <div className="flex items-center gap-2 text-xs">
          <button onClick={onPrev} className="px-2 py-1 border border-slateborder rounded-lg hover:border-accent">
            ◀
          </button>
          <span className="text-slate-300">{monthLabel}</span>
          <button onClick={onNext} className="px-2 py-1 border border-slateborder rounded-lg hover:border-accent">
            ▶
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2 text-[10px]">
        {days.map((day) => (
          <div
            key={day.date}
            className={`h-16 rounded-lg border p-2 ${PHASE_STYLES[day.phase]} ${
              day.score >= 80 ? 'bg-success/60 border-success' : day.score >= 60 ? 'bg-warning/60 border-warning' : 'bg-danger/60 border-danger'
            }`}
          >
            <div className="font-mono">{day.date.split('-')[2]}</div>
            <div className="mt-2">{day.score}</div>
          </div>
        ))}
      </div>
      {footer && <div className="mt-3 text-xs text-slate-400">{footer}</div>}
    </div>
  );
}
