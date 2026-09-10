import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import {
  currentWeatherModel,
  currentWeatherRainModel,
} from '@/mocks/fixtures';
import {
  formatObservedAt,
  formatTemperature,
} from '@/utils/format';

describe('CurrentWeatherCard (fase 06 §1)', () => {
  it('renderiza cidade, temperatura, sensação térmica, condição e observação', () => {
    const { container } = render(
      <CurrentWeatherCard current={currentWeatherModel} cityName="São Paulo" />,
    );

    expect(
      screen.getByRole('heading', { name: 'São Paulo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(formatTemperature(currentWeatherModel.temperatureC)),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Sensação térmica de ${formatTemperature(currentWeatherModel.feelsLikeC)}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(currentWeatherModel.condition.description),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Observado em ${formatObservedAt(currentWeatherModel.observedAt)}`,
      ),
    ).toBeInTheDocument();

    expect(container.querySelector('.lucide-sun')).toBeInTheDocument();
  });

  it('ícone acompanha a condição (chuva → lucide-cloud-rain)', () => {
    const { container } = render(
      <CurrentWeatherCard current={currentWeatherRainModel} />,
    );

    expect(container.querySelector('.lucide-sun')).not.toBeInTheDocument();
    expect(
      container.querySelector('.lucide-cloud-rain'),
    ).toBeInTheDocument();
  });

  it('não renderiza heading de cidade quando cityName é omitido', () => {
    render(<CurrentWeatherCard current={currentWeatherModel} />);

    expect(
      screen.queryByRole('heading', { name: 'São Paulo' }),
    ).not.toBeInTheDocument();
  });
});