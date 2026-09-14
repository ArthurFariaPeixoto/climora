import { Calendar } from 'lucide-react';

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
        <div className="flex items-center justify-between border-b border-line/60 pb-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink sm:text-lg">
              Previsão diária
            </h2>
          </div>
          <span className="text-xs font-medium text-ink-muted">
            Próximos dias
          </span>
        </div>

        {daily.length === 0 ? (
          <EmptyState message="Previsão diária indisponível." />
        ) : (
          <ul
            aria-label="Previsão diária"
            className="custom-scrollbar flex gap-2.5 overflow-x-auto pb-2 pt-1"
          >
            {daily.map((day) => (
              <li
                key={day.date}
                className="flex min-w-[6.5rem] flex-1 flex-col items-center gap-1.5 rounded-xl border border-line/70 bg-canvas/60 p-3 transition-all hover:border-accent-line hover:bg-surface hover:shadow-2xs"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {formatWeekday(day.date)}
                </span>
                <ConditionIcon
                  condition={day.condition}
                  className="my-0.5 h-7 w-7 text-accent"
                />
                <span className="text-sm font-bold text-ink">
                  {formatTemperatureRange(day)}
                </span>
                <span className="text-xs font-semibold text-accent-strong">
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
