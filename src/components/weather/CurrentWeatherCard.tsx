import { Clock, MapPin } from 'lucide-react';

import type { CurrentWeather } from '@/models/CurrentWeather';
import { Card } from '@/components/ui/Card';
import { formatObservedAt, formatTemperature } from '@/utils/format';
import { ConditionIcon } from '@/components/weather/ConditionIcon';

interface CurrentWeatherCardProps {
  /** Clima atual já normalizado pelo `use-weather`. */
  current: CurrentWeather;
  /** Nome da cidade, vindo da composição (`WeatherDashboard`). */
  cityName?: string;
}

/**
 * Card da condição climática atual.
 *
 * Recebe o modelo `CurrentWeather` do `use-weather` (via composição) e exibe
 * temperatura, sensação térmica, condição com ícone e o horário de observação —
 * tudo já formatado por `utils/format` (estado derivado, arquitetura §7).
 *
 * Widget fluido (ADR-08): ocupa o espaço dado pelo grid, sem conhecimento de
 * breakpoint. `cityName` é opcional (a composição decide quando exibi-lo).
 */
export function CurrentWeatherCard({
  current,
  cityName,
}: CurrentWeatherCardProps) {
  return (
    <Card variant="highlight" className="h-full">
      <div className="flex h-full flex-col justify-between gap-4">
        {cityName ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-bold tracking-tight text-ink">
                {cityName}
              </h2>
            </div>
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent-strong">
              Tempo Atual
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 py-1">
          <div>
            <p className="text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
              {formatTemperature(current.temperatureC)}
            </p>
            <p className="mt-1.5 text-base font-semibold capitalize text-ink">
              {current.condition.description}
            </p>
            <p className="mt-0.5 text-sm text-ink-muted">
              Sensação térmica de {formatTemperature(current.feelsLikeC)}
            </p>
          </div>

          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-accent-line/60 bg-surface/90 shadow-xs">
            <ConditionIcon
              condition={current.condition}
              className="h-11 w-11 text-accent"
            />
          </div>
        </div>

        <div className="mt-auto flex items-center gap-1.5 border-t border-accent-line/50 pt-3 text-xs text-ink-muted">
          <Clock className="h-3.5 w-3.5 text-ink-soft" aria-hidden="true" />
          <span>Observado em {formatObservedAt(current.observedAt)}</span>
        </div>
      </div>
    </Card>
  );
}
