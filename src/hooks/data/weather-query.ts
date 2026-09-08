import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { WeatherRequest } from '@/models/WeatherRequest';
import type { CurrentWeather } from '@/models/CurrentWeather';
import type { HourlyForecast } from '@/models/HourlyForecast';
import { getWeather } from '@/services/repositories/weather-repository';
import { isRetryableAppError, type AppError } from '@/utils/errors';

/**
 * Pacote de clima como a camada de data-fetching entrega à fachada.
 *
 * Sem `daily`: a previsão diária é derivada dos blocos de 3h em
 * `utils/selectors.groupHourlyByDay` (anexo-11 item 1) — a derivação fica no
 * hook `use-weather`, mantendo a query enxuta (arquitetura §5.6).
 */
export interface WeatherBundle {
  current: CurrentWeather;
  hourly: HourlyForecast[];
}

export interface UseWeatherQueryOptions {
  city: WeatherRequest;
  enabled: boolean;
}

/**
 * Chave da consulta de clima.
 *
 * A chave combina a coordenada da cidade e o escopo de dados, permitindo
 * cache/deduplicação por cidade+escopo (stack §8).
 */
export function weatherQueryKey(city: WeatherRequest) {
  return ['weather', city] as const;
}

/**
 * Frequência de cache para a consulta de clima (~5min, stack §8).
 */
const WEATHER_QUERY_STALE_TIME = 300_000;

/**
 * Número máximo de tentativas de retry para erros transitórios.
 */
const WEATHER_QUERY_RETRY_ATTEMPTS = 2;

/**
 * Consulta de clima via TanStack Query.
 *
 * Executa `getWeather` (fase 02) como fetcher — os erros de rede/HTTP já
 * chegam tipados `AppError` (interceptor do `apiClient`). O `signal` da query
 * é repassado ao transporte para descartar/cancelar respostas obsoletas
 * (ADR-06). `enabled` controla o disparo (a cidade selecionada dita a fachada
 * `use-weather`).
 */
export function useWeatherQuery(options: UseWeatherQueryOptions) {
  return useQuery<WeatherBundle, AppError>({
    queryKey: weatherQueryKey(options.city),
    queryFn: ({ signal }) => getWeather(options.city, signal),
    enabled: options.enabled,
    staleTime: WEATHER_QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) =>
      isRetryableAppError(error) && failureCount < WEATHER_QUERY_RETRY_ATTEMPTS,
  });
}
