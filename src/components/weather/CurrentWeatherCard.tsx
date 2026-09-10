import type { CurrentWeather } from '@/models/CurrentWeather';
import { Card } from '@/components/ui/Card';
import {
  formatObservedAt,
  formatTemperature,
} from '@/utils/format';
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
export function CurrentWeatherCard({ current, cityName }: CurrentWeatherCardProps) {
  return (
    <Card variant="highlight">
      <div className="flex h-full flex-col gap-3">
        {cityName ? <h2 className="text-lg font-semibold">{cityName}</h2> : null}
        <div className="flex items-center gap-4">
          <ConditionIcon
            condition={current.condition}
            className="h-10 w-10 text-ink-muted"
          />
          <div>
            <p className="text-4xl font-bold leading-none">
              {formatTemperature(current.temperatureC)}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Sensação térmica de {formatTemperature(current.feelsLikeC)}
            </p>
          </div>
        </div>
        <p className="text-ink">{current.condition.description}</p>
        <p className="mt-auto text-xs text-ink-muted">
          Observado em {formatObservedAt(current.observedAt)}
        </p>
      </div>
    </Card>
  );
}