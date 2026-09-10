import type { DailyForecast } from '@/models/DailyForecast';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/state/EmptyState';
import { ConditionIcon } from '@/components/weather/ConditionIcon';
import {
  formatPrecipitation,
  formatTemperature,
  formatWeekday,
} from '@/utils/format';

interface DailyForecastProps {
  /** Previsão por dia derivada via `groupHourlyByDay` (`use-weather`). */
  daily: DailyForecast[];
}

/** Temperatura mín/máx do dia no bloco (ex.: "22°C / 30°C"). */
function formatTemperatureRange(day: DailyForecast): string {
  return `${formatTemperature(day.minC)} / ${formatTemperature(day.maxC)}`;
}

/**
 * Previsão por dia (agregada dos blocos de 3h via `groupHourlyByDay`).
 *
 * Lista **horizontal com scroll** dentro de um `Card` — widget fluido (ADR-08).
 * Cada dia mostra o rótulo da semana (`formatWeekday`), ícone da condição,
 * temperatura mín/máx e probabilidade de precipitação.
 *
 * Ausência de previsão não derruba o dashboard (arquitetura §9.2): lista vazia
 * renderiza `EmptyState` com fallback.
 */
export function DailyForecast({ daily }: DailyForecastProps) {
  return (
    <Card>
      <div className="flex h-full flex-col gap-3">
        <h2 className="text-lg font-semibold">Previsão diária</h2>
        {daily.length === 0 ? (
          <EmptyState message="Previsão diária indisponível." />
        ) : (
          <ul
            aria-label="Previsão diária"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {daily.map((day) => (
              <li
                key={day.date}
                className="flex min-w-[5.5rem] flex-col items-center gap-1 rounded-lg border border-line p-2"
              >
                <span className="text-xs text-ink-muted">
                  {formatWeekday(day.date)}
                </span>
                <ConditionIcon
                  condition={day.condition}
                  className="h-6 w-6 text-ink-muted"
                />
                <span className="text-sm font-semibold">
                  {formatTemperatureRange(day)}
                </span>
                <span className="text-xs font-medium text-accent-strong">
                  {formatPrecipitation(day.precipitationPct)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}