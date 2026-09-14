import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWeatherQuery, weatherQueryKey } from '@/hooks/data/weather-query';
import {
  RIO_WEATHER,
  SAO_PAULO_WEATHER,
  SAO_PAULO_CURRENT_ONLY,
  currentWeatherModel,
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

describe('weatherQueryKey', () => {
  it('gera chave ["weather", city] com o request informado', () => {
    expect(weatherQueryKey(SAO_PAULO_WEATHER)).toEqual([
      'weather',
      SAO_PAULO_WEATHER,
    ]);
  });

  it('gera chave distinta para cidades diferentes', () => {
    expect(weatherQueryKey(SAO_PAULO_WEATHER)).not.toEqual(
      weatherQueryKey(RIO_WEATHER),
    );
  });

  it('gera chave distinta para escopos diferentes na mesma cidade', () => {
    expect(weatherQueryKey(SAO_PAULO_WEATHER)).not.toEqual(
      weatherQueryKey(SAO_PAULO_CURRENT_ONLY),
    );
  });
});

describe('useWeatherQuery', () => {
  it('enabled: false não dispara query', () => {
    renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: false,
        }),
      { wrapper },
    );

    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it('enabled: true dispara query com request e signal', async () => {
    mockedGetWeather.mockResolvedValueOnce(baseResult);

    renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(mockedGetWeather).toHaveBeenCalled());
    expect(mockedGetWeather).toHaveBeenCalledWith(
      SAO_PAULO_WEATHER,
      expect.any(AbortSignal),
    );
  });

  it('sucesso: retorna WeatherBundle com current e hourly', async () => {
    mockedGetWeather.mockResolvedValueOnce(baseResult);

    const { result } = renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.current).toEqual(currentWeatherModel);
    expect(result.current.data?.hourly).toEqual(hourlyForecastModel);
    expect(result.current.isFetching).toBe(false);
  });

  it('erro: isError true e error é AppError', async () => {
    mockedGetWeather.mockRejectedValueOnce({
      kind: 'unauthorized',
      message: 'Configuração inválida: verifique a chave de API.',
    });

    const { result } = renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('unauthorized');
  });

  it('cache/hit-miss: mesma chave reutiliza dados entre renderizações', async () => {
    mockedGetWeather.mockResolvedValueOnce(baseResult);

    const client = createTestQueryClient();
    const cacheWrapper = createQueryClientWrapper(client);

    const { result, unmount } = renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    unmount();
    mockedGetWeather.mockClear();

    const { result: result2 } = renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    await waitFor(() => expect(result2.current.isSuccess).toBe(true));
    expect(result2.current.data).toEqual(baseResult);
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it('cache/miss: chave diferente (outra cidade) dispara nova query', async () => {
    const { promise: p1, resolve: r1 } = deferred<WeatherResult>();
    mockedGetWeather.mockImplementationOnce(() => p1);

    const client = createTestQueryClient();
    const cacheWrapper = createQueryClientWrapper(client);

    const { result, rerender } = renderHook(
      ({ city }) =>
        useWeatherQuery({
          city,
          enabled: true,
        }),
      { wrapper: cacheWrapper, initialProps: { city: SAO_PAULO_WEATHER } },
    );

    await act(async () => {
      r1(baseResult);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.current).toEqual(currentWeatherModel);

    const rioResult: WeatherResult = {
      current: { ...currentWeatherModel, observedAt: 999 },
      hourly: hourlyForecastModel,
    };
    mockedGetWeather.mockImplementationOnce(() => Promise.resolve(rioResult));

    rerender({ city: RIO_WEATHER });

    await waitFor(() =>
      expect(mockedGetWeather).toHaveBeenCalledWith(
        RIO_WEATHER,
        expect.any(AbortSignal),
      ),
    );
    expect(mockedGetWeather).toHaveBeenCalledTimes(2);

    await waitFor(() =>
      expect(result.current.data?.current.observedAt).toBe(999),
    );
  });

  it('keepPreviousData: ao trocar cidade, dados antigos permanecem enquanto novo carrega', async () => {
    const { promise: p1, resolve: r1 } = deferred<WeatherResult>();
    mockedGetWeather.mockImplementationOnce(() => p1);

    const client = createTestQueryClient();
    const cacheWrapper = createQueryClientWrapper(client);

    const { result, rerender } = renderHook(
      ({ city }) =>
        useWeatherQuery({
          city,
          enabled: true,
        }),
      { wrapper: cacheWrapper, initialProps: { city: SAO_PAULO_WEATHER } },
    );

    await act(async () => {
      r1(baseResult);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.current).toEqual(currentWeatherModel);

    const { promise: p2 } = deferred<WeatherResult>();
    mockedGetWeather.mockImplementationOnce(() => p2);

    rerender({ city: RIO_WEATHER });

    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.data?.current).toEqual(currentWeatherModel);
  });

  it('refetch: dispara nova requisição e atualiza dados', async () => {
    mockedGetWeather.mockResolvedValueOnce(baseResult).mockResolvedValueOnce({
      current: { ...currentWeatherModel, temperatureC: 31 },
      hourly: hourlyForecastModel,
    });

    const { result } = renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.current.temperatureC).toBe(22.3);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.data?.current.temperatureC).toBe(31),
    );
    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
  });

  it('staleTime: dados não ficam stale imediatamente após resolução', async () => {
    mockedGetWeather.mockResolvedValueOnce(baseResult);

    const client = createTestQueryClient();
    const cacheWrapper = createQueryClientWrapper(client);

    const { result, unmount } = renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    unmount();

    mockedGetWeather.mockClear();

    const { result: result2 } = renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    expect(result2.current.isLoading).toBe(false);
    expect(result2.current.data).toEqual(baseResult);
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it('troca de cidade repassa signal para cancelamento (ADR-06)', async () => {
    let capturedSignal: AbortSignal | undefined;
    mockedGetWeather.mockImplementation(
      (_req: WeatherRequest, signal?: AbortSignal) => {
        capturedSignal = signal;
        return Promise.resolve(baseResult);
      },
    );

    renderHook(
      () =>
        useWeatherQuery({
          city: SAO_PAULO_WEATHER,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(mockedGetWeather).toHaveBeenCalled());
    expect(capturedSignal).toBeInstanceOf(AbortSignal);
  });
});
