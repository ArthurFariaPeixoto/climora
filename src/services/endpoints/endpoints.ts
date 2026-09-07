import type { City } from '@/models/City';
import type { WeatherRequest } from '@/models/WeatherRequest';

/**
 * Endpoints — rotas e construtores de parâmetros (funções puras).
 *
 * Centraliza onde a estrutura da API OpenWeather vive (stack §10). Cada
 * função constrói a query string da requisição.
 */

export const GEOCODING_PATH = '/geo/1.0/direct';
export const CURRENT_WEATHER_PATH = '/data/2.5/weather';
export const FORECAST_PATH = '/data/2.5/forecast';

export const GEOCODING_LIMIT = '5';
export const DEFAULT_LANG = 'pt_br';

interface GeoQuery {
  q: string;
  limit: string;
  lang: string;
}

/**
 * Constrói os parâmetros da busca de cidades.
 */
export function buildCitySearchQuery(term: string): GeoQuery {
  return {
    q: term,
    limit: GEOCODING_LIMIT,
    lang: DEFAULT_LANG,
  };
}

interface WeatherQuery {
  lat: number;
  lon: number;
  units: 'metric';
  lang: string;
}

/**
 * Consulta de clima resolvida conforme o escopo: paths a chamar + parâmetros.
 *
 * Os endpoints de clima atual e previsão aceitam os mesmos parâmetros (stack
 * §10) — o escopo decide os *paths*: `current` chama só o clima atual;
 * `current+forecast` soma a previsão. A chave `appid` não entra aqui: é
 * injetada pelo interceptor de `services/http` (ADR-12).
 */
export interface WeatherEndpoints {
  paths: readonly string[];
  params: WeatherQuery;
}

/**
 * Constrói os paths e parâmetros de uma consulta de clima conforme o escopo.
 */
export function buildWeatherQuery(
  city: City,
  scope: WeatherRequest['scope'],
): WeatherEndpoints {
  const params: WeatherQuery = {
    lat: city.lat,
    lon: city.lon,
    units: 'metric',
    lang: DEFAULT_LANG,
  };

  const paths =
    scope === 'current'
      ? [CURRENT_WEATHER_PATH]
      : [CURRENT_WEATHER_PATH, FORECAST_PATH];

  return { paths, params };
}
