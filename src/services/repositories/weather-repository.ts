import type { CurrentWeather } from '@/models/CurrentWeather';
import type { HourlyForecast } from '@/models/HourlyForecast';
import type { WeatherRequest } from '@/models/WeatherRequest';
import type { City } from '@/models/City';

export interface WeatherResult {
  current: CurrentWeather;
  hourly: HourlyForecast[];
}

/**
 * Repositório de clima — fetcher da camada de data-fetching (ADR-10).
 *
 * Orquestra client + endpoint + adapter e retorna apenas `models`. O escopo de
 * dados (`WeatherRequest.scope`) permite reduzir futuramente a resposta.
 *
 * TODO: implementar a chamada HTTP real (clima atual + previsão, conforme o
 * escopo) quando a integração for feita.
 */
export async function getWeather(
  _city: City,
  _scope: WeatherRequest['scope'],
): Promise<WeatherResult> {
  throw new Error('Not implemented');
}
