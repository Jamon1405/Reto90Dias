import type { ReactNode } from 'react';

export type CalendarDay = {
  date: string;
  phase: 'PRE-SEASON' | 'SEASON' | 'POST-SEASON';
  dots: {
    bio: boolean;
    gym: boolean;
    fuel: boolean;
    sleep: boolean;
    ops: boolean;
  };
};

const PHASE_BG: Record<CalendarDay['phase'], string> = {
  'PRE-SEASON': 'bg-slatepanel/60',
  SEASON: 'bg-accent/10',
  'POST-SEASON': 'bg-warning/10',
};

const PHASE_STRIPE: Record<CalendarDay['phase'], string> = {
  'PRE-SEASON': 'border-t-4 border-t-slate-500',
  SEASON: 'border-t-4 border-t-accent',
  'POST-SEASON': 'border-t-4 border-t-warning',
};

export default function CalendarMonth({
  monthLabel,
  days,
  onPrev,
  onNext,
  onSelect,
  footer,
}: {
  monthLabel: string;
  days: CalendarDay[];
  onPrev: () => void;
  onNext: () => void;
  onSelect: (date: string) => void;
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
          <button
            key={day.date}
            onClick={() => onSelect(day.date)}
            className={`h-16 rounded-lg border border-slateborder p-2 text-left ${PHASE_BG[day.phase]} ${
              PHASE_STRIPE[day.phase]
            }`}
          >
            <div className="font-mono">{day.date.split('-')[2]}</div>
            <div className="mt-2 flex gap-1">
              {day.dots.bio && <span className="h-1 w-1 rounded-full bg-accent" />}
              {day.dots.gym && <span className="h-1 w-1 rounded-full bg-warning" />}
              {day.dots.fuel && <span className="h-1 w-1 rounded-full bg-success" />}
              {day.dots.sleep && <span className="h-1 w-1 rounded-full bg-slate-300" />}
              {day.dots.ops && <span className="h-1 w-1 rounded-full bg-danger" />}
            </div>
          </button>
        ))}
      </div>
      {footer && <div className="mt-3 text-xs text-slate-400">{footer}</div>}
    </div>
  );
}
