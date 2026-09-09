import { HttpResponse, http } from 'msw';
import type { HttpHandler } from 'msw';

import {
  NOT_FOUND_BODY,
  RATE_LIMIT_BODY,
  SEARCH_TERM_WITH_RESULTS,
  SERVER_ERROR_BODY,
  citySearchResultsDto,
  currentWeatherDto,
  forecastDto,
} from '@/mocks/fixtures';
import {
  CURRENT_WEATHER_PATH,
  FORECAST_PATH,
  GEOCODING_PATH,
} from '@/services/endpoints/endpoints';

/**
 * Handlers MSW dos endpoints da OpenWeather (fase 04 §2).
 *
 * Usados apenas em testes: são a "API simulada" que o `tests/setup.ts`
 * inicia/reseta/encerra. As URLs são absolutas a partir da baseURL de
 * `VITE_WEATHER_API_BASE_URL` (`.env.test` → `http://localhost:3003`) porque, no
 * adapter Node do MSW, paths relativos não casam com a URL absoluta da
 * requisição (o `cleanUrl` é absoluto).
 *
 * Estratégia dupla:
 * - handlers padrão (`geocodingHandler`, `currentWeatherHandler`,
 *   `forecastHandler`) já cobrem o fluxo feliz e o estado `empty` da busca;
 * - handlers de erro por cenário (404/429/500/network) ficam como named
 *   exports para `server.use(...)` por teste (stack §16).
 */

const BASE_URL = import.meta.env.VITE_WEATHER_API_BASE_URL;
const geocodingUrl = `${BASE_URL}${GEOCODING_PATH}`;
const currentWeatherUrl = `${BASE_URL}${CURRENT_WEATHER_PATH}`;
const forecastUrl = `${BASE_URL}${FORECAST_PATH}`;

// --- Handlers padrão -------------------------------------------------------

/**
 * `/geo/1.0/direct` — responde conforme o `q` (match com as fixtures):
 * termo conhecido → lista multi-cidade; qualquer outro termo → `[]`
 * (estado `empty`, que não é erro de UI).
 */
export const geocodingHandler = http.get(geocodingUrl, ({ request }) => {
  const { searchParams } = new URL(request.url);
  const results =
    searchParams.get('q') === SEARCH_TERM_WITH_RESULTS
      ? citySearchResultsDto
      : [];
  return HttpResponse.json(results);
});

/** `/data/2.5/weather` — clima atual. */
export const currentWeatherHandler = http.get(currentWeatherUrl, () => {
  return HttpResponse.json(currentWeatherDto);
});

/** `/data/2.5/forecast` — previsão 5 dias / 3 horas (40 blocos). */
export const forecastHandler = http.get(forecastUrl, () => {
  return HttpResponse.json(forecastDto);
});

export const handlers: HttpHandler[] = [
  geocodingHandler,
  currentWeatherHandler,
  forecastHandler,
];

// --- Handlers de erro por cenário -----------------------------------------
//
// Override via `server.use(handler)` em um único teste; `afterEach` do setup
// volta ao default (`server.resetHandlers()`).

type ErrorStatus = 404 | 429 | 500;

function jsonErrorHandler<T extends Record<string, string | number>>(
  path: string,
  status: ErrorStatus,
  body: T,
): HttpHandler {
  return http.get(path, () => HttpResponse.json(body, { status }));
}

/** Geocodificação: cidade inexistente (404). */
export const geocodingNotFoundHandler = jsonErrorHandler(
  geocodingUrl,
  404,
  NOT_FOUND_BODY,
);

/** Geocodificação: limite de requisições excedido (429). */
export const geocodingRateLimitHandler = jsonErrorHandler(
  geocodingUrl,
  429,
  RATE_LIMIT_BODY,
);

/** Geocodificação: serviço indisponível (500). */
export const geocodingServerErrorHandler = jsonErrorHandler(
  geocodingUrl,
  500,
  SERVER_ERROR_BODY,
);

/** Clima atual: cidade inexistente (404). */
export const weatherNotFoundHandler = jsonErrorHandler(
  currentWeatherUrl,
  404,
  NOT_FOUND_BODY,
);

/** Clima atual: limite de requisições excedido (429). */
export const weatherRateLimitHandler = jsonErrorHandler(
  currentWeatherUrl,
  429,
  RATE_LIMIT_BODY,
);

/** Clima atual: serviço indisponível (500). */
export const weatherServerErrorHandler = jsonErrorHandler(
  currentWeatherUrl,
  500,
  SERVER_ERROR_BODY,
);

/**
 * Falha de rede (`ERR_NETWORK` → taxonomia `network`).
 *
 * Timeout **não** é simulado em nível de rede: o timeout do `apiClient` é 10s e
 * uma resposta atrasada deixaria os testes lentos/instáveis. A classificação
 * `ECONNABORTED`/`ETIMEDOUT` é coberta por unit em `tests/services/http/errors.test.ts`.
 */
export const geocodingNetworkErrorHandler = http.get(geocodingUrl, () =>
  HttpResponse.error(),
);

export const weatherNetworkErrorHandler = http.get(currentWeatherUrl, () =>
  HttpResponse.error(),
);
