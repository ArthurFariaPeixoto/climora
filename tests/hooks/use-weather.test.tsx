import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWeather } from '@/hooks/use-weather';
import type { CurrentWeather } from '@/models/CurrentWeather';
import type { HourlyForecast } from '@/models/HourlyForecast';
import type { WeatherRequest } from '@/models/WeatherRequest';
import type { WeatherResult } from '@/services/repositories/weather-repository';
import { getWeather } from '@/services/repositories/weather-repository';

/**
 * Fachada `use-weather` (fase 03 §4, ADR-05/06/09/11, anexo-11 itens 1 e 14).
 *
 * Tradução dos estados com a camada de data-fetching real e o repositório
 * mockado (stack §16). `null` nunca dispara requisição; `daily` é derivado
 * aqui via `groupHourlyByDay` (único ponto de derivação); a troca de cidade
 * gera chave nova e descarta/cancela a consulta antiga (ADR-06).
 */
vi.mock('@/services/repositories/weather-repository', () => ({
  getWeather: vi.fn(),
}));

const mockedGetWeather = vi.mocked(getWeather);

const SP: WeatherRequest = {
  lat: -23.55,
  lon: -46.63,
  scope: 'current+forecast',
};
const RJ: WeatherRequest = {
  lat: -22.9,
  lon: -43.17,
  scope: 'current+forecast',
};

const DAY1_1000 = Math.floor(Date.UTC(2026, 0, 5, 10, 0, 0) / 1000);
const DAY1_1300 = Math.floor(Date.UTC(2026, 0, 5, 13, 0, 0) / 1000);
const DAY2_1000 = Math.floor(Date.UTC(2026, 0, 6, 10, 0, 0) / 1000);
const DAY2_1300 = Math.floor(Date.UTC(2026, 0, 6, 13, 0, 0) / 1000);
const DAY1_START = Math.floor(Date.UTC(2026, 0, 5) / 1000);
const DAY2_START = Math.floor(Date.UTC(2026, 0, 6) / 1000);

const currentWeather: CurrentWeather = {
  temperatureC: 24,
  feelsLikeC: 25,
  minC: 18,
  maxC: 28,
  humidityPct: 60,
  pressureHpa: 1013,
  visibilityKm: 10,
  wind: { speedKmh: 12, degree: 160 },
  condition: { id: 801, description: 'Poucas nuvens', main: 'Clouds' },
  observedAt: DAY1_1000,
};

const hourly: HourlyForecast[] = [
  {
    time: DAY1_1000,
    temperatureC: 22,
    feelsLikeC: 22,
    humidityPct: 60,
    precipitationPct: 10,
    windSpeedKmh: 14,
    condition: 'Sun',
  },
  {
    time: DAY1_1300,
    temperatureC: 30,
    feelsLikeC: 31,
    humidityPct: 40,
    precipitationPct: 30,
    windSpeedKmh: 8,
    condition: 'Rain',
  },
  {
    time: DAY2_1000,
    temperatureC: 15,
    feelsLikeC: 14,
    humidityPct: 80,
    precipitationPct: 0,
    windSpeedKmh: 5,
    condition: 'Fog',
  },
  {
    time: DAY2_1300,
    temperatureC: 21,
    feelsLikeC: 22,
    humidityPct: 70,
    precipitationPct: 0,
    windSpeedKmh: 15,
    condition: 'Clear',
  },
];

const baseResult: WeatherResult = { current: currentWeather, hourly };

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  mockedGetWeather.mockReset();
});

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useWeather', () => {
  it('request null: idle, sem requisição', () => {
    const { result } = renderHook(() => useWeather(null), { wrapper });

    expect(result.current.status).toBe('idle');
    expect(result.current.current).toBeNull();
    expect(result.current.hourly).toEqual([]);
    expect(result.current.daily).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it('loading enquanto pendente e success com current/hourly/daily derivado', async () => {
    let resolve!: (value: WeatherResult) => void;
    mockedGetWeather.mockImplementationOnce(
      () =>
        new Promise<WeatherResult>((res) => {
          resolve = res;
        }),
    );

    const { result } = renderHook(() => useWeather(SP), { wrapper });

    expect(result.current.status).toBe('loading');
    expect(result.current.current).toBeNull();
    expect(result.current.hourly).toEqual([]);
    expect(result.current.daily).toEqual([]);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolve(baseResult);
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.current).toEqual(currentWeather);
    expect(result.current.hourly).toEqual(hourly);
    expect(result.current.daily).toEqual([
      {
        date: DAY1_START,
        minC: 22,
        maxC: 30,
        humidityPct: 50,
        precipitationPct: 20,
        windSpeedKmh: 11,
        condition: 'Rain',
      },
      {
        date: DAY2_START,
        minC: 15,
        maxC: 21,
        humidityPct: 75,
        precipitationPct: 0,
        windSpeedKmh: 10,
        condition: 'Clear',
      },
    ]);
    expect(mockedGetWeather).toHaveBeenCalledWith(SP, expect.anything());
  });

  it('success: expõe os modelos do repositório', async () => {
    mockedGetWeather.mockResolvedValueOnce(baseResult);

    const { result } = renderHook(() => useWeather(SP), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.current).toEqual(currentWeather);
    expect(result.current.hourly).toEqual(hourly);
    expect(result.current.daily.length).toBe(2);
    expect(result.current.error).toBeNull();
    expect(result.current.isFetching).toBe(false);
    expect(typeof result.current.refetch).toBe('function');
  });

  it('error: propaga AppError da consulta', async () => {
    mockedGetWeather.mockRejectedValueOnce({
      kind: 'unauthorized',
      message: 'Configuração inválida: verifique a chave de API.',
    });

    const { result } = renderHook(() => useWeather(SP), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.kind).toBe('unauthorized');
    expect(result.current.current).toBeNull();
    expect(result.current.hourly).toEqual([]);
    expect(result.current.daily).toEqual([]);
  });

  it('troca de cidade: chave nova (lat/lon) dispara nova consulta e troca os dados', async () => {
    mockedGetWeather.mockImplementation((request: WeatherRequest) =>
      Promise.resolve({
        current: { ...currentWeather, observedAt: Math.abs(request.lat) },
        hourly,
      }),
    );

    const { result, rerender } = renderHook(
      (request: WeatherRequest | null) => useWeather(request),
      { wrapper, initialProps: SP },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.current?.observedAt).toBe(Math.abs(SP.lat));

    rerender(RJ);

    await waitFor(() =>
      expect(result.current.current?.observedAt).toBe(Math.abs(RJ.lat)),
    );
    expect(mockedGetWeather).toHaveBeenLastCalledWith(RJ, expect.anything());
    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
  });

  it('refetch: dispara nova consulta e atualiza os dados', async () => {
    mockedGetWeather.mockResolvedValueOnce(baseResult).mockResolvedValueOnce({
      current: { ...currentWeather, temperatureC: 31 },
      hourly,
    });

    const { result } = renderHook(() => useWeather(SP), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.current?.temperatureC).toBe(24);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.current?.temperatureC).toBe(31));
    expect(result.current.status).toBe('success');
  });
});
