import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WeatherDashboard } from '@/app/WeatherDashboard';
import {
  useCitySearch,
  type UseCitySearchResult,
} from '@/hooks/use-city-search';
import { useWeather, type UseWeatherResult } from '@/hooks/use-weather';
import {
  SAO_PAULO_WEATHER,
  citySearchResultsModel,
  currentWeatherModel,
  dailyForecastModel,
  hourlyForecastModel,
} from '@/mocks/fixtures';
import type { WeatherRequest } from '@/models/WeatherRequest';

/**
 * Composição raiz do dashboard (fase 07 §1, arquitetura §5.1, anexo-11 item 9).
 *
 * Hooks de feature mockados (fase 09 — recomposição da camada): o vínculo
 * busca → seleção → clima é exercitado de ponta a ponta, verificando que a
 * cidade selecionada no `SearchBar` sobe via `onSelect`, é convertida em
 * `WeatherRequest` (`{ lat, lon, scope: 'current+forecast' }`) e alimenta os
 * widgets por estado.
 */
vi.mock('@/hooks/use-city-search', () => ({
  useCitySearch: vi.fn(),
}));

vi.mock('@/hooks/use-weather', () => ({
  useWeather: vi.fn(),
}));

// O `vi.mock` intercepta também o import dinâmico do `React.lazy`, evitando
// carregar o Recharts neste teste (o chunk é verificado no build da fase).
vi.mock('@/components/weather/WeatherCharts', () => ({
  default: () => <div data-testid="weather-charts" />,
}));

const mockedUseCitySearch = vi.mocked(useCitySearch);
const mockedUseWeather = vi.mocked(useWeather);

function citySearchResult(
  overrides: Partial<UseCitySearchResult> = {},
): UseCitySearchResult {
  return {
    status: 'idle',
    cities: [],
    error: null,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

function weatherResult(
  overrides: Partial<UseWeatherResult> = {},
): UseWeatherResult {
  return {
    status: 'idle',
    current: null,
    hourly: [],
    daily: [],
    error: null,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

let user: UserEvent;

beforeEach(() => {
  user = userEvent.setup();

  mockedUseCitySearch.mockReset();
  mockedUseWeather.mockReset();

  mockedUseCitySearch.mockImplementation((term: string) =>
    term.trim() === ''
      ? citySearchResult({ status: 'idle' })
      : citySearchResult({ status: 'success', cities: citySearchResultsModel }),
  );

  mockedUseWeather.mockImplementation((request: WeatherRequest | null) =>
    request === null
      ? weatherResult({ status: 'idle' })
      : weatherResult({
          status: 'success',
          current: currentWeatherModel,
          hourly: hourlyForecastModel,
          daily: dailyForecastModel,
        }),
  );
});

/** Digita, submete a busca e seleciona a primeira cidade (São Paulo). */
async function searchAndSelect() {
  await user.type(
    screen.getByRole('combobox', { name: 'Buscar cidade' }),
    'são paulo',
  );
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  await user.click(screen.getByRole('option', { name: /são paulo/i }));
}

describe('WeatherDashboard (fase 07 §1)', () => {
  it('sem cidade selecionada: busca visível e prompt inicial, sem widgets', () => {
    render(<WeatherDashboard />);

    expect(
      screen.getByRole('combobox', { name: 'Buscar cidade' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Busque uma cidade para ver o clima.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'São Paulo' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Previsão por hora' }),
    ).not.toBeInTheDocument();
  });

  it('busca → seleção → clima: eleva a cidade e compõe os widgets', async () => {
    render(<WeatherDashboard />);

    await searchAndSelect();

    expect(mockedUseWeather).toHaveBeenCalledWith(SAO_PAULO_WEATHER);
    expect(
      screen.getByRole('heading', { name: 'São Paulo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica de 22°C')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('1013 hPa')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Previsão por hora' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Previsão diária' }),
    ).toBeInTheDocument();
    // O `React.lazy` resolve o import dinamicamente (microtask) — `findByTestId`
    // aguarda o chunk mockado entrar no DOM após o fallback do `Suspense`.
    expect(await screen.findByTestId('weather-charts')).toBeInTheDocument();
  });

  it('loading após selecionar: mostra o LoadingState', async () => {
    mockedUseWeather.mockImplementation((request: WeatherRequest | null) =>
      request === null
        ? weatherResult({ status: 'idle' })
        : weatherResult({ status: 'loading', isFetching: true }),
    );

    render(<WeatherDashboard />);
    await searchAndSelect();

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('erro transitório: mensagem em alert e retry aciona o refetch', async () => {
    const refetch = vi.fn();
    mockedUseWeather.mockImplementation((request: WeatherRequest | null) =>
      request === null
        ? weatherResult({ status: 'idle' })
        : weatherResult({
            status: 'error',
            error: {
              kind: 'network',
              message: 'Sem conexão com a internet.',
            },
            refetch,
          }),
    );

    render(<WeatherDashboard />);
    await searchAndSelect();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Sem conexão com a internet.',
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('erro não transitório: sem botão de retry', async () => {
    mockedUseWeather.mockImplementation((request: WeatherRequest | null) =>
      request === null
        ? weatherResult({ status: 'idle' })
        : weatherResult({
            status: 'error',
            error: {
              kind: 'not-found',
              message: 'Cidade não encontrada.',
            },
          }),
    );

    render(<WeatherDashboard />);
    await searchAndSelect();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Cidade não encontrada.',
    );
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
  });

  it('empty: mostra o EmptyState defensivo', async () => {
    mockedUseWeather.mockImplementation((request: WeatherRequest | null) =>
      request === null
        ? weatherResult({ status: 'idle' })
        : weatherResult({ status: 'empty' }),
    );

    render(<WeatherDashboard />);
    await searchAndSelect();

    expect(
      screen.getByText('Clima indisponível para esta cidade.'),
    ).toBeInTheDocument();
  });
});
