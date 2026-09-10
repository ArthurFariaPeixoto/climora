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
const PRECIPITATION_CLASS = 'text-xs font-medium text-sky-700';

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
        <h2 className="text-lg font-semibold">Previsão por hora</h2>
        {hourly.length === 0 ? (
          <EmptyState message="Previsão horária indisponível." />
        ) : (
          <ul
            aria-label="Previsão por hora"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {hourly.map((block) => (
              <li
                key={block.time}
                className="flex min-w-[4.5rem] flex-col items-center gap-1 rounded-lg border border-neutral-200 p-2"
              >
                <span className="text-xs text-neutral-500">
                  {formatHour(block.time)}
                </span>
                <ConditionIcon
                  condition={block.condition}
                  className="h-6 w-6 text-neutral-600"
                />
                <span className="text-sm font-semibold">
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