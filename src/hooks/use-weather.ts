import type { QueryObserverResult } from '@tanstack/react-query';

import type { CurrentWeather } from '@/models/CurrentWeather';
import type { DailyForecast } from '@/models/DailyForecast';
import type { HourlyForecast } from '@/models/HourlyForecast';
import type { WeatherRequest } from '@/models/WeatherRequest';
import {
  useWeatherQuery,
  type WeatherBundle,
} from '@/hooks/data/weather-query';
import type { AppError } from '@/utils/errors';
import { groupHourlyByDay } from '@/utils/selectors';

/**
 * Estados canônicos da consulta de clima (arquitetura §7, ADR-05).
 */
export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface UseWeatherResult {
  status: WeatherStatus;
  current: CurrentWeather | null;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  error: AppError | null;
  isFetching: boolean;
  refetch: () => Promise<QueryObserverResult<WeatherBundle, AppError>>;
}

/**
 * Pedido sentinela da query quando nenhuma cidade está selecionada.
 *
 * `useQuery` não pode ser chamado condicionalmente (rules-of-hooks); com
 * `enabled: false` a chave nunca dispara o fetcher — mesmo princípio do termo
 * vazio de `city-query` (fachada usa `request ?? NO_CITY`).
 */
const NO_CITY: WeatherRequest = { lat: 0, lon: 0, scope: 'current+forecast' };

/**
 * Fachada de feature para o clima do dashboard.
 *
 * Recebe a cidade selecionada como `WeatherRequest` (montado pelo chamador na
 * fase 07 a partir de `City` — `endpoints.ts` mantém `City` fora do clima),
 * conduz a consulta (`useWeatherQuery`) e traduz para a taxonomia canônica
 * `idle | loading | success | error | empty`. Expõe apenas `models` + estados
 * (ADR-05, ADR-11).
 *
 * Derivação do `daily`: a previsão diária é calculada **aqui** via
 * `groupHourlyByDay`, único ponto de derivação (anexo-11 item 1 —
 * `WeatherBundle` entrega só `current` + blocos de 3h).
 *
 * Regras:
 * - `null` → `idle` (nenhuma cidade selecionada), sem requisição;
 * - troca de cidade gera chave nova (`lat`/`lon`/`scope`) e o TanStack
 *   descarta/cancela a consulta obsoleta (ADR-06);
 * - `keepPreviousData` preserva o último resultado enquanto o novo carrega;
 * - `empty` é defensivo (anexo-11 item 14): o contrato garante `current` e o
 *   TanStack rejeita payload `undefined`, então "sucesso sem dados" não ocorre
 *   na prática — o estado permanece na taxonomia por coerência.
 */
export function useWeather(request: WeatherRequest | null): UseWeatherResult {
  const {
    data,
    error: queryError,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useWeatherQuery({
    city: request ?? NO_CITY,
    enabled: request !== null,
  });

  const shared = { isFetching, refetch };

  if (request === null) {
    return {
      ...shared,
      status: 'idle',
      current: null,
      hourly: [],
      daily: [],
      error: null,
    };
  }

  const current = data?.current ?? null;
  const hourly = data?.hourly ?? [];
  const daily = groupHourlyByDay(hourly);

  if (isPending) {
    return {
      ...shared,
      status: 'loading',
      current,
      hourly,
      daily,
      error: null,
    };
  }

  if (isError) {
    return {
      ...shared,
      status: 'error',
      current: null,
      hourly: [],
      daily: [],
      error: queryError,
    };
  }

  // Guard defensivo de tipos: o TanStack rejeita payload `undefined` e o contrato
  // garante `WeatherResult`, então `empty` é de facto inalcançável aqui; o estado
  // permanece na taxonomia por coerência (anexo-11 item 14, tipos "empty").
  if (!data) {
    return {
      ...shared,
      status: 'empty',
      current: null,
      hourly: [],
      daily: [],
      error: null,
    };
  }

  return {
    ...shared,
    status: 'success',
    current: data.current,
    hourly: data.hourly,
    daily,
    error: null,
  };
}
