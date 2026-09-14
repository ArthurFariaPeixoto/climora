import {
  ArrowDown,
  ArrowUp,
  Droplets,
  Eye,
  Gauge,
  Umbrella,
  Wind,
} from 'lucide-react';

import type { CurrentWeather } from '@/models/CurrentWeather';
import { Card } from '@/components/ui/Card';
import { MetricTile } from '@/components/ui/MetricTile';
import {
  formatHumidity,
  formatPrecipitation,
  formatPressure,
  formatTemperature,
  formatVisibility,
  formatWindDirection,
  formatWindSpeed,
} from '@/utils/format';

interface MetricsGridProps {
  /** Clima atual já normalizado pelo `use-weather`. */
  current: CurrentWeather;
}

/**
 * Grade de métricas (umidade, vento, mínima/máxima, pressão, precipitação e
 * visibilidade).
 *
 * Compõe `MetricTile`s com valores já formatados por `utils/format` (estado
 * derivado, arquitetura §7). Widget fluido (ADR-08): a grade usa
 * `repeat(auto-fit, minmax(...))`, adaptando-se à largura do container sem
 * conhecer breakpoints (divergência registrada no anexo-11 item 15).
 *
 * A precipitação é renderizada **apenas quando presente**: o endpoint do clima
 * atual não expõe `pop`, então `precipitationPct` costuma vir ausente e a
 * métrica é escondida (anexo-11 item 4).
 */
export function MetricsGrid({ current }: MetricsGridProps) {
  const wind = `${formatWindSpeed(current.wind.speedKmh)} · ${formatWindDirection(current.wind.degree)}`;

  return (
    <Card className="h-full">
      <div className="flex h-full flex-col justify-between gap-3">
        <div className="flex items-center justify-between border-b border-line/60 pb-1">
          <h2 className="text-base font-semibold text-ink">
            Condições Atmosféricas
          </h2>
          <span className="text-xs font-medium text-ink-muted">
            Métricas em tempo real
          </span>
        </div>
        <div className="grid h-full grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
          <MetricTile
            label="Umidade"
            value={formatHumidity(current.humidityPct)}
            icon={Droplets}
          />
          <MetricTile label="Vento" value={wind} icon={Wind} />
          <MetricTile
            label="Mínima"
            value={formatTemperature(current.minC)}
            icon={ArrowDown}
          />
          <MetricTile
            label="Máxima"
            value={formatTemperature(current.maxC)}
            icon={ArrowUp}
          />
          <MetricTile
            label="Pressão"
            value={formatPressure(current.pressureHpa)}
            icon={Gauge}
          />
          {current.precipitationPct !== undefined ? (
            <MetricTile
              label="Precipitação"
              value={formatPrecipitation(current.precipitationPct)}
              icon={Umbrella}
            />
          ) : null}
          <MetricTile
            label="Visibilidade"
            value={formatVisibility(current.visibilityKm)}
            icon={Eye}
          />
        </div>
      </div>
    </Card>
  );
}
