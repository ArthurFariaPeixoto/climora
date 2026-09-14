import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MetricsGrid } from '@/components/weather/MetricsGrid';
import {
  currentWeatherModel,
  currentWeatherWithPrecipModel,
} from '@/mocks/fixtures';
import {
  formatHumidity,
  formatPrecipitation,
  formatPressure,
  formatTemperature,
  formatVisibility,
  formatWindDirection,
  formatWindSpeed,
} from '@/utils/format';

describe('MetricsGrid (fase 06 §2)', () => {
  it('renderiza as métricas com valores formatados', () => {
    const { container } = render(<MetricsGrid current={currentWeatherModel} />);

    const wind = `${formatWindSpeed(currentWeatherModel.wind.speedKmh)} · ${formatWindDirection(currentWeatherModel.wind.degree)}`;

    expect(screen.getByText('Umidade')).toBeInTheDocument();
    expect(
      screen.getByText(formatHumidity(currentWeatherModel.humidityPct)),
    ).toBeInTheDocument();
    expect(screen.getByText('Vento')).toBeInTheDocument();
    expect(screen.getByText(wind)).toBeInTheDocument();
    expect(screen.getByText('Mínima')).toBeInTheDocument();
    expect(
      screen.getByText(formatTemperature(currentWeatherModel.minC)),
    ).toBeInTheDocument();
    expect(screen.getByText('Máxima')).toBeInTheDocument();
    expect(
      screen.getByText(formatTemperature(currentWeatherModel.maxC)),
    ).toBeInTheDocument();
    expect(screen.getByText('Pressão')).toBeInTheDocument();
    expect(
      screen.getByText(formatPressure(currentWeatherModel.pressureHpa)),
    ).toBeInTheDocument();
    expect(screen.getByText('Visibilidade')).toBeInTheDocument();
    expect(
      screen.getByText(formatVisibility(currentWeatherModel.visibilityKm)),
    ).toBeInTheDocument();

    expect(container.querySelector('.lucide-droplets')).toBeInTheDocument();
    expect(container.querySelector('.lucide-wind')).toBeInTheDocument();
    expect(container.querySelector('.lucide-arrow-down')).toBeInTheDocument();
    expect(container.querySelector('.lucide-arrow-up')).toBeInTheDocument();
    expect(container.querySelector('.lucide-gauge')).toBeInTheDocument();
    expect(container.querySelector('.lucide-eye')).toBeInTheDocument();
  });

  it('esconde a métrica de precipitação quando `precipitationPct` está ausente', () => {
    const { container } = render(<MetricsGrid current={currentWeatherModel} />);

    expect(screen.queryByText('Precipitação')).not.toBeInTheDocument();
    expect(container.querySelector('.lucide-umbrella')).not.toBeInTheDocument();
  });

  it('exibe a métrica de precipitação quando `precipitationPct` está presente', () => {
    const { container } = render(
      <MetricsGrid current={currentWeatherWithPrecipModel} />,
    );

    expect(screen.getByText('Precipitação')).toBeInTheDocument();
    expect(
      screen.getByText(
        formatPrecipitation(
          currentWeatherWithPrecipModel.precipitationPct ?? 0,
        ),
      ),
    ).toBeInTheDocument();
    expect(container.querySelector('.lucide-umbrella')).toBeInTheDocument();
  });
});
