import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HourlyForecast } from '@/components/weather/HourlyForecast';
import { hourlyForecastModel } from '@/mocks/fixtures';
import {
  formatHour,
  formatPrecipitation,
  formatTemperature,
} from '@/utils/format';

describe('HourlyForecast (fase 06 §3)', () => {
  it('renderiza heading e blocos com hora, temperatura, precipitação e ícone', () => {
    const { container } = render(
      <HourlyForecast hourly={hourlyForecastModel} />,
    );

    expect(
      screen.getByRole('heading', { name: 'Previsão por hora' }),
    ).toBeInTheDocument();

    for (const block of hourlyForecastModel) {
      expect(
        screen.getAllByText(formatHour(block.time)).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText(formatTemperature(block.temperatureC)).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText(formatPrecipitation(block.precipitationPct)).length,
      ).toBeGreaterThan(0);
    }

    expect(container.querySelectorAll('li').length).toBe(
      hourlyForecastModel.length,
    );
  });

  it('ícone reflete a condição de cada bloco (categorias da fixture)', () => {
    const { container } = render(
      <HourlyForecast hourly={hourlyForecastModel} />,
    );

    expect(container.querySelector('.lucide-sun')).toBeInTheDocument();
    expect(container.querySelector('.lucide-cloud-rain')).toBeInTheDocument();
    expect(container.querySelector('.lucide-cloud-fog')).toBeInTheDocument();
  });

  it('ícone reflete descrições reais da API (texto pt-BR)', () => {
    const { container } = render(
      <HourlyForecast
        hourly={[
          { ...hourlyForecastModel[0], condition: 'Céu limpo' },
          {
            ...hourlyForecastModel[0],
            time: hourlyForecastModel[0].time + 3600,
            condition: 'Chuva leve',
          },
          {
            ...hourlyForecastModel[0],
            time: hourlyForecastModel[0].time + 7200,
            condition: 'Nevoeiro',
          },
          {
            ...hourlyForecastModel[0],
            time: hourlyForecastModel[0].time + 10800,
            condition: 'Tempestade',
          },
        ]}
      />,
    );

    expect(container.querySelector('.lucide-sun')).toBeInTheDocument();
    expect(container.querySelector('.lucide-cloud-rain')).toBeInTheDocument();
    expect(container.querySelector('.lucide-cloud-fog')).toBeInTheDocument();
    expect(
      container.querySelector('.lucide-cloud-lightning'),
    ).toBeInTheDocument();
  });

  it('lista vazia renderiza fallback (EmptyState) sem blocos', () => {
    const { container } = render(<HourlyForecast hourly={[]} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Previsão horária indisponível.',
    );
    expect(container.querySelectorAll('li').length).toBe(0);
    expect(
      screen.queryByRole('heading', { name: 'Previsão por hora' }),
    ).toBeInTheDocument();
  });
});
