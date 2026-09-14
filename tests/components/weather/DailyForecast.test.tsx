import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DailyForecast } from '@/components/weather/DailyForecast';
import { dailyForecastModel } from '@/mocks/fixtures';
import {
  formatPrecipitation,
  formatTemperature,
  formatWeekday,
} from '@/utils/format';

describe('DailyForecast (fase 06 §4)', () => {
  it('renderiza heading e dias com rótulo, mín/máx e precipitação', () => {
    const { container } = render(<DailyForecast daily={dailyForecastModel} />);

    expect(
      screen.getByRole('heading', { name: 'Previsão diária' }),
    ).toBeInTheDocument();

    for (const day of dailyForecastModel) {
      expect(screen.getByText(formatWeekday(day.date))).toBeInTheDocument();
      expect(
        screen.getByText(
          `${formatTemperature(day.minC)} / ${formatTemperature(day.maxC)}`,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatPrecipitation(day.precipitationPct)),
      ).toBeInTheDocument();
    }

    expect(container.querySelectorAll('li').length).toBe(
      dailyForecastModel.length,
    );
  });

  it('ícone reflete a condição de cada dia (categorias e descrições)', () => {
    const { container } = render(<DailyForecast daily={dailyForecastModel} />);

    expect(container.querySelector('.lucide-cloud-rain')).toBeInTheDocument();
    expect(container.querySelector('.lucide-sun')).toBeInTheDocument();
  });

  it('ícone reflete descrições reais da API (texto pt-BR)', () => {
    const { container } = render(
      <DailyForecast
        daily={[
          { ...dailyForecastModel[0], condition: 'Chuva leve' },
          {
            ...dailyForecastModel[0],
            date: dailyForecastModel[0].date + 86400,
            condition: 'Tempestade',
          },
        ]}
      />,
    );

    expect(container.querySelector('.lucide-cloud-rain')).toBeInTheDocument();
    expect(
      container.querySelector('.lucide-cloud-lightning'),
    ).toBeInTheDocument();
  });

  it('lista vazia renderiza fallback (EmptyState) sem dias', () => {
    const { container } = render(<DailyForecast daily={[]} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Previsão diária indisponível.',
    );
    expect(container.querySelectorAll('li').length).toBe(0);
    expect(
      screen.getByRole('heading', { name: 'Previsão diária' }),
    ).toBeInTheDocument();
  });
});
