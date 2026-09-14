import { Clock } from 'lucide-react';

import type { HourlyForecast } from '@/models/HourlyForecast';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/state/EmptyState';
import { ConditionIcon } from '@/components/weather/ConditionIcon';
import {
  formatHour,
  formatPrecipitation,
  formatTemperature,
} from '@/utils/format';

interface HourlyForecastProps {
  /** Blocos de previsão por hora derivados do `use-weather`. */
  hourly: HourlyForecast[];
}

/** Precipitação do bloco com cor de destaque para leitura do percentual. */
const PRECIPITATION_CLASS = 'text-xs font-medium text-accent-strong';

/**
 * Previsão por horário (blocos de 3h).
 *
 * Lista **horizontal com scroll** dentro de um `Card` — widget fluido (ADR-08):
 * o scroll acomoda qualquer quantidade de blocos sem conhecer a largura da tela.
 * Cada bloco mostra hora (`formatHour`), ícone da condição, temperatura e
 * probabilidade de precipitação.
 *
 * Ausência de previsão não derruba o dashboard (arquitetura §9.2): lista vazia
 * renderiza `EmptyState` com fallback.
 */
export function HourlyForecast({ hourly }: HourlyForecastProps) {
  return (
    <Card>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between border-b border-line/60 pb-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink sm:text-lg">
              Previsão por hora
            </h2>
          </div>
          <span className="text-xs font-medium text-ink-muted">
            Próximas horas (blocos de 3h)
          </span>
        </div>

        {hourly.length === 0 ? (
          <EmptyState message="Previsão horária indisponível." />
        ) : (
          <ul
            aria-label="Previsão por hora"
            className="custom-scrollbar flex gap-2.5 overflow-x-auto pb-2 pt-1"
          >
            {hourly.map((block) => (
              <li
                key={block.time}
                className="flex min-w-[5rem] flex-col items-center gap-1.5 rounded-xl border border-line/70 bg-canvas/60 p-2.5 transition-all hover:border-accent-line hover:bg-surface hover:shadow-2xs"
              >
                <span className="text-xs font-semibold text-ink-muted">
                  {formatHour(block.time)}
                </span>
                <ConditionIcon
                  condition={block.condition}
                  className="my-0.5 h-6 w-6 text-accent"
                />
                <span className="text-sm font-bold text-ink">
                  {formatTemperature(block.temperatureC)}
                </span>
                <span className={PRECIPITATION_CLASS}>
                  {formatPrecipitation(block.precipitationPct)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
