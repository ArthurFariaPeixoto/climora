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

interface GeoQuery {
  q: string;
  limit: string;
  lang: string;
}

/**
 * Constrói os parâmetros da busca de cidades.
 *
 * TODO: parametrizar idioma/limite conforme a configuração quando a
 * integração for implementada.
 */
export function buildCitySearchQuery(term: string): GeoQuery {
  return {
    q: term,
    limit: '5',
    lang: 'pt_br',
  };
}

interface WeatherQuery {
  lat: number;
  lon: number;
  units: 'metric';
  lang: string;
}

/**
 * Constrói os parâmetros de uma consulta de clima (`current` ou `current+forecast`).
 *
 * TODO: derivar o escopo (usa `FORECAST_PATH` quando `scope` incluir previsão)
 * quando a integração for implementada.
 */
export function buildWeatherQuery(
  city: City,
  _scope: WeatherRequest['scope'],
): WeatherQuery {
  return {
    lat: city.lat,
    lon: city.lon,
    units: 'metric',
    lang: 'pt_br',
  };
}
