import type { DayLog } from '@/lib/models';
import { computeIntel } from '@/lib/intel';

export type IntelData = ReturnType<typeof computeIntel>;

type Props = {
  day: DayLog;
  intel: IntelData | null;
};

export function IntelTab({ day, intel }: Props) {
  if (!intel) {
    return <p className="text-sm text-muted">Registra datos para ver INTEL.</p>;
  }

  return (
    <div className="space-y-6 text-sm">
      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'BMR', value: day.flagsJson.bmr },
          { label: 'OUT', value: day.calOut },
          { label: 'IN', value: day.calIn },
          { label: 'NET', value: day.flagsJson.net },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-surface p-3">
            <div className="text-xs text-muted">{item.label}</div>
            <div className="text-lg font-semibold text-text">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-xs font-semibold text-text">Cumulative Net</h3>
          <div className="mt-2 space-y-1 text-xs text-muted">
            <div>7 días: {intel.nets.net7} kcal</div>
            <div>14 días: {intel.nets.net14} kcal</div>
            <div>30 días: {intel.nets.net30} kcal</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-xs font-semibold text-text">Weekly Averages (7d)</h3>
          <div className="mt-2 grid gap-1 text-xs text-muted">
            <div>Peso: {intel.averages.avgWeight.toFixed(1)} kg</div>
            <div>Pasos: {Math.round(intel.averages.avgSteps)}</div>
            <div>Agua: {intel.averages.avgWater.toFixed(1)} vasos</div>
            <div>Sueño: {intel.averages.avgSleep.toFixed(1)} h</div>
            <div>Net: {Math.round(intel.averages.avgNet)} kcal</div>
            <div>Score: {Math.round(intel.averages.avgScore)}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-xs font-semibold text-text">Trends</h3>
          <div className="mt-2 grid gap-1 text-xs text-muted">
            <div>Δ Peso 7d: {intel.trends.weightTrend7} kg</div>
            <div>Δ Peso 14d: {intel.trends.weightTrend14} kg</div>
            <div>Δ Peso 30d: {intel.trends.weightTrend30} kg</div>
            <div>Net promedio 7d: {Math.round(intel.trends.rollingNetAvg)} kcal</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-xs font-semibold text-text">Projection</h3>
          <div className="mt-2 grid gap-1 text-xs text-muted">
            <div>Déficit acumulado: {intel.projection.estimatedKgLost.toFixed(2)} kg</div>
            <div>Peso proyectado (Hyrox): {intel.projection.projectedWeight.toFixed(1)} kg</div>
            <div>Promedio neto 14d: {Math.round(intel.projection.dailyNetAvg14)} kcal</div>
            <div className="text-warning">Projection assumes consistent logging.</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-xs font-semibold text-text">Compliance KPIs</h3>
          <div className="mt-2 grid gap-1 text-xs text-muted">
            <div>Agua ≥ 8: {intel.compliance.water}%</div>
            <div>Pasos ≥ 8000: {intel.compliance.steps}%</div>
            <div>Net ≤ 0: {intel.compliance.deficit}%</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-xs font-semibold text-text">Streaks</h3>
          <div className="mt-2 grid gap-1 text-xs text-muted">
            <div>Deficit streak: {intel.streaks.deficitStreak} días</div>
            <div>Hydration streak: {intel.streaks.hydrationStreak} días</div>
          </div>
        </div>
      </section>
    </div>
  );
}
