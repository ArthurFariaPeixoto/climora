import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import WeatherCharts from '@/components/weather/WeatherCharts';
import { hourlyForecastModel } from '@/mocks/fixtures';
import { formatHour } from '@/utils/format';

vi.mock('recharts', async (importOriginal) => {
  const RealModule = await importOriginal<typeof import('recharts')>();
  return {
    ...RealModule,
    ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
      <RealModule.ResponsiveContainer width={600} height={300}>
        {children}
      </RealModule.ResponsiveContainer>
    ),
  };
});

describe('WeatherCharts (fase 06 §5)', () => {
  it('renderiza heading, gráfico e rótulos de hora pré-formatados', () => {
    const { container } = render(
      <WeatherCharts hourly={hourlyForecastModel} />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Temperatura e precipitação por hora',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Gráfico de temperatura e precipitação por hora',
      }),
    ).toBeInTheDocument();

    for (const block of hourlyForecastModel) {
      expect(
        screen.getAllByText(formatHour(block.time)).length,
      ).toBeGreaterThan(0);
    }

    expect(container.querySelector('.recharts-surface')).toBeInTheDocument();
  });

  it('plota uma barra por bloco com precipitação e a linha de temperatura', () => {
    const { container } = render(
      <WeatherCharts hourly={hourlyForecastModel} />,
    );

    const withPrecipitation = hourlyForecastModel.filter(
      (block) => block.precipitationPct > 0,
    ).length;
    expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(
      withPrecipitation,
    );
    expect(
      container.querySelector('path[stroke="#0284c7"]'),
    ).toBeInTheDocument();
  });

  it('lista vazia renderiza fallback (EmptyState) sem gráfico', () => {
    const { container } = render(<WeatherCharts hourly={[]} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Gráfico indisponível.',
    );
    expect(container.querySelector('.recharts-surface')).not.toBeInTheDocument();
  });
});