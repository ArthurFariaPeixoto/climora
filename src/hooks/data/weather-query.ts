import { useQuery } from '@tanstack/react-query';

import type { WeatherRequest } from '@/models/WeatherRequest';
import type { CurrentWeather } from '@/models/CurrentWeather';
import type { HourlyForecast } from '@/models/HourlyForecast';
import type { DailyForecast } from '@/models/DailyForecast';

export interface WeatherBundle {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
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
 * Consulta de clima via TanStack Query.
 *
 * TODO: definir `staleTime` (~5min) e conectar o fetcher em
 * `services/repositories` (`getWeather`) quando a integração for
 * implementada.
 */
export function useWeatherQuery(options: UseWeatherQueryOptions) {
  return useQuery<WeatherBundle, Error>({
    queryKey: weatherQueryKey(options.city),
    queryFn: () => {
      throw new Error('Not implemented');
    },
    enabled: false,
    staleTime: 0,
  });
}
