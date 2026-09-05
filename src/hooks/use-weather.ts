import type { WeatherRequest } from '@/models/WeatherRequest';

/**
 * Facha de feature para o clima do dashboard.
 *
 * Recebe a cidade selecionada, conduz a consulta (`useWeatherQuery`) e traduz
 * para `CurrentWeather` + previsões + estados canônicos para os widgets.
 *
 * TODO: implementar tradução de estados (loading/success/error/empty) e
 * refetch quando a feature for desenvolvida.
 */
export function useWeather(_city: WeatherRequest | null) {
  return { status: 'idle' as const };
}
