import { mapCurrentWeatherDtoToModel, mapForecastBlockDtoToHourlyModel } from '@/services/adapters/weather.adapter';
import type { CurrentWeatherDto, ForecastDto } from '@/services/dtos';
import { buildWeatherQuery } from '@/services/endpoints/endpoints';
import { apiClient } from '@/services/http/api-client';
import type { City } from '@/models/City';
import type { CurrentWeather } from '@/models/CurrentWeather';
import type { HourlyForecast } from '@/models/HourlyForecast';
import type { WeatherRequest } from '@/models/WeatherRequest';

export interface WeatherResult {
  current: CurrentWeather;
  hourly: HourlyForecast[];
}

/**
 * Repositório de clima — fetcher da camada de data-fetching (ADR-10).
 *
 * Orquestra client + endpoint + adapter e retorna apenas `models`. O escopo de
 * dados (`WeatherRequest.scope`) decide os endpoints chamados:
 * - `current` → só `/data/2.5/weather` (`hourly` fica vazio);
 * - `current+forecast` → além do clima atual, `/data/2.5/forecast` (blocos de
 *   3h → `HourlyForecast[]`).
 *
 * Contrato (anexo-11 item 1): o resultado nunca expõe `daily` — a previsão
 * diária é derivada dos blocos em `utils/selectors`.
 *
 * O sinal de abort é repassado ao Axios (ADR-06); erros de transporte já
 * chegam `AppError` via interceptor do `apiClient` — nada de `AxiosError` cru.
 */
export async function getWeather(
  city: City,
  scope: WeatherRequest['scope'],
  signal?: AbortSignal,
): Promise<WeatherResult> {
  const { paths, params } = buildWeatherQuery(city, scope);
  const shared = { params, signal };

  if (paths.length === 1) {
    const { data } = await apiClient.get<CurrentWeatherDto>(paths[0], shared);
    return { current: mapCurrentWeatherDtoToModel(data), hourly: [] };
  }

  const [currentResponse, forecastResponse] = await Promise.all([
    apiClient.get<CurrentWeatherDto>(paths[0], shared),
    apiClient.get<ForecastDto>(paths[1], shared),
  ]);

  const current = mapCurrentWeatherDtoToModel(currentResponse.data);
  const hourly = forecastResponse.data.list.map(mapForecastBlockDtoToHourlyModel);

  return { current, hourly };
}