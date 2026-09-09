import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWeather } from '@/hooks/use-weather';
import {
  RIO_WEATHER,
  SAO_PAULO_WEATHER,
  currentWeatherModel,
  dailyForecastModel,
  hourlyForecastModel,
} from '@/mocks/fixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
  deferred,
} from '@/mocks/testing';
import type { WeatherRequest } from '@/models/WeatherRequest';
import type { WeatherResult } from '@/services/repositories/weather-repository';
import { getWeather } from '@/services/repositories/weather-repository';

/**
 * Fachada `use-weather` (fase 03 §4, ADR-05/06/09/11, anexo-11 itens 1 e 14).
 *
 * Tradução dos estados com a camada de data-fetching real e o repositório
 * mockado (stack §16, fase 04 §3). `null` nunca dispara requisição; `daily` é
 * derivado aqui via `groupHourlyByDay` (único ponto de derivação); a troca de
 * cidade gera chave nova e descarta/cancela a consulta antiga (ADR-06). Dados
 * de `src/mocks/fixtures` (fase 04 §1) e `QueryClient` isolado de
 * `src/mocks/testing`.
 */
vi.mock('@/services/repositories/weather-repository', () => ({
  getWeather: vi.fn(),
}));

const mockedGetWeather = vi.mocked(getWeather);

const baseResult: WeatherResult = {
  current: currentWeatherModel,
  hourly: hourlyForecastModel,
};

let wrapper: ReturnType<typeof createQueryClientWrapper>;

beforeEach(() => {
  wrapper = createQueryClientWrapper(createTestQueryClient());
  mockedGetWeather.mockReset();
});

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
    const { promise, resolve } = deferred<WeatherResult>();
    mockedGetWeather.mockImplementationOnce(() => promise);

    const { result } = renderHook(() => useWeather(SAO_PAULO_WEATHER), {
      wrapper,
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.current).toBeNull();
    expect(result.current.hourly).toEqual([]);
    expect(result.current.daily).toEqual([]);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolve(baseResult);
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.current).toEqual(currentWeatherModel);
    expect(result.current.hourly).toEqual(hourlyForecastModel);
    expect(result.current.daily).toEqual(dailyForecastModel);
    expect(mockedGetWeather).toHaveBeenCalledWith(
      SAO_PAULO_WEATHER,
      expect.anything(),
    );
  });

  it('success: expõe os modelos do repositório', async () => {
    mockedGetWeather.mockResolvedValueOnce(baseResult);

    const { result } = renderHook(() => useWeather(SAO_PAULO_WEATHER), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.current).toEqual(currentWeatherModel);
    expect(result.current.hourly).toEqual(hourlyForecastModel);
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

    const { result } = renderHook(() => useWeather(SAO_PAULO_WEATHER), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.kind).toBe('unauthorized');
    expect(result.current.current).toBeNull();
    expect(result.current.hourly).toEqual([]);
    expect(result.current.daily).toEqual([]);
  });

  it('troca de cidade: chave nova (lat/lon) dispara nova consulta e troca os dados', async () => {
    mockedGetWeather.mockImplementation((request: WeatherRequest) =>
      Promise.resolve({
        current: { ...currentWeatherModel, observedAt: Math.abs(request.lat) },
        hourly: hourlyForecastModel,
      }),
    );

    const { result, rerender } = renderHook(
      (request: WeatherRequest | null) => useWeather(request),
      { wrapper, initialProps: SAO_PAULO_WEATHER },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.current?.observedAt).toBe(
      Math.abs(SAO_PAULO_WEATHER.lat),
    );

    rerender(RIO_WEATHER);

    await waitFor(() =>
      expect(result.current.current?.observedAt).toBe(
        Math.abs(RIO_WEATHER.lat),
      ),
    );
    expect(mockedGetWeather).toHaveBeenLastCalledWith(
      RIO_WEATHER,
      expect.anything(),
    );
    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
  });

  it('refetch: dispara nova consulta e atualiza os dados', async () => {
    mockedGetWeather.mockResolvedValueOnce(baseResult).mockResolvedValueOnce({
      current: { ...currentWeatherModel, temperatureC: 31 },
      hourly: hourlyForecastModel,
    });

    const { result } = renderHook(() => useWeather(SAO_PAULO_WEATHER), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.current?.temperatureC).toBe(22.3);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.current?.temperatureC).toBe(31));
    expect(result.current.status).toBe('success');
  });
});
