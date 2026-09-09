import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { SEARCH_TERM_WITH_RESULTS, saoPauloGeoDto } from '@/mocks/fixtures';
import { geocodingNotFoundHandler } from '@/mocks/handlers';
import { server } from '@/mocks/server';
import type { City } from '@/models/City';
import { mapCityDtoToModel } from '@/services/adapters/city.adapter';
import {
  GEOCODING_PATH,
  buildCitySearchQuery,
} from '@/services/endpoints/endpoints';
import { apiClient } from '@/services/http/api-client';

/**
 * Integração leve http + endpoints + adapter via MSW (fase 02 §5).
 *
 * Valida o caminho real do cliente (baseURL de `.env.test`, `appid` injetado,
 * classificador de erros no interceptor de resposta) em nível de rede. Dados de
 * `src/mocks/fixtures` (fase 04 §1).
 */
describe('apiClient', () => {
  it('injeta appid e entrega o DTO da geocodificação end-to-end', async () => {
    server.use(
      http.get('http://localhost:3003/geo/1.0/direct', ({ request }) => {
        const { searchParams } = new URL(request.url);
        expect(searchParams.get('appid')).toBe('tests-only-key');
        expect(searchParams.get('q')).toBe(SEARCH_TERM_WITH_RESULTS);
        expect(searchParams.get('lang')).toBe('pt_br');
        return HttpResponse.json([saoPauloGeoDto]);
      }),
    );

    const { data } = await apiClient.get(GEOCODING_PATH, {
      params: buildCitySearchQuery(SEARCH_TERM_WITH_RESULTS),
    });

    const city: City = mapCityDtoToModel(data[0]);
    expect(city).toEqual<City>({
      name: 'São Paulo',
      country: 'BR',
      state: 'SP',
      lat: -23.55,
      lon: -46.63,
    });
  });

  it('propaga 404 como NotFoundError via interceptor de resposta', async () => {
    server.use(geocodingNotFoundHandler);

    const response = apiClient.get(GEOCODING_PATH, {
      params: buildCitySearchQuery(SEARCH_TERM_WITH_RESULTS),
    });

    await expect(response).rejects.toMatchObject({ kind: 'not-found' });
  });

  it('repassa o erro original quando o sinal de abort é disparado', async () => {
    const controller = new AbortController();
    controller.abort();

    const response = apiClient.get(GEOCODING_PATH, {
      params: buildCitySearchQuery(SEARCH_TERM_WITH_RESULTS),
      signal: controller.signal,
    });

    await expect(response).rejects.toMatchObject({
      isAxiosError: true,
      code: 'ERR_CANCELED',
    });
  });
});
