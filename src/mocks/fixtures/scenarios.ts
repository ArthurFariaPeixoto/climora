import type { WeatherRequest } from '@/models/WeatherRequest';

/**
 * Constantes de cenário (fase 04 §1).
 *
 * Termos de busca, consultas de clima e corpos de erro da OpenWeather usados
 * pelos handlers MSW (§2) e pelos testes de rede/repositórios.
 */

// --- Busca de cidades ------------------------------------------------------

/** Termo que os handlers MSW podem resolver com `citySearchResultsDto`. */
export const SEARCH_TERM_WITH_RESULTS = 'são paulo';

/** Termo que "não encontra" nada (resposta vazia). */
export const SEARCH_TERM_NO_RESULTS = 'cidade-inexistente';

// --- Consultas de clima ----------------------------------------------------

export const SAO_PAULO_WEATHER: WeatherRequest = {
  lat: -23.55,
  lon: -46.63,
  scope: 'current+forecast',
};

export const SAO_PAULO_CURRENT_ONLY: WeatherRequest = {
  lat: -23.55,
  lon: -46.63,
  scope: 'current',
};

export const RIO_WEATHER: WeatherRequest = {
  lat: -22.9,
  lon: -43.17,
  scope: 'current+forecast',
};

// --- Corpos de erro da API -------------------------------------------------

export const NOT_FOUND_BODY = { cod: 404, message: 'city not found' } as const;

export const RATE_LIMIT_BODY = {
  cod: 429,
  message: 'Too many requests. Please try again later.',
} as const;

export const SERVER_ERROR_BODY = {
  cod: 500,
  message: 'Internal Server Error',
} as const;
