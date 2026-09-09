import { describe, expect, it } from 'vitest';

import {
  SEARCH_TERM_NO_RESULTS,
  SEARCH_TERM_WITH_RESULTS,
} from '@/mocks/fixtures';
import {
  geocodingNetworkErrorHandler,
  geocodingNotFoundHandler,
  geocodingRateLimitHandler,
  geocodingServerErrorHandler,
} from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { searchCities } from '@/services/repositories/city-repository';

/**
 * Integração do repositório de cidades via MSW (fase 02 §6, ADR-10).
 *
 * Valida o contrato do fetcher: `City[]` no fluxo feliz, `[]` para resposta
 * vazia **e** `404`, além do repasse do abort (ADR-06). Fluxo feliz/`empty`
 * exercitam os handlers padrão de `src/mocks/handlers` (fase 04 §2); cenários
 * de erro usam os named exports via `server.use(...)`.
 */
describe('searchCities', () => {
  it('retorna City[] no fluxo feliz (handler padrão por q)', async () => {
    const cities = await searchCities(SEARCH_TERM_WITH_RESULTS);

    expect(cities).toEqual([
      expect.objectContaining({
        name: 'São Paulo',
        country: 'BR',
        state: 'SP',
        lat: -23.55,
        lon: -46.63,
      }),
      expect.objectContaining({
        name: 'Rio de Janeiro',
        country: 'BR',
        lat: -22.9,
        lon: -43.17,
      }),
      expect.objectContaining({
        name: 'Belo Horizonte',
        country: 'BR',
        state: 'MG',
        lat: -19.91,
        lon: -43.94,
      }),
      expect.objectContaining({
        name: 'Lisboa',
        country: 'PT',
        lat: 38.72,
        lon: -9.14,
      }),
    ]);
  });

  it('retorna [] para termo desconhecido (handler padrão → empty)', async () => {
    await expect(searchCities(SEARCH_TERM_NO_RESULTS)).resolves.toEqual([]);
  });

  it('retorna [] em 404 (cidade inexistente não é erro de UI)', async () => {
    server.use(geocodingNotFoundHandler);

    await expect(searchCities(SEARCH_TERM_NO_RESULTS)).resolves.toEqual([]);
  });

  it('propaga ServerError em 429 (limite de requisições)', async () => {
    server.use(geocodingRateLimitHandler);

    await expect(searchCities(SEARCH_TERM_WITH_RESULTS)).rejects.toMatchObject({
      kind: 'server',
    });
  });

  it('propaga ServerError em 500 (serviço indisponível)', async () => {
    server.use(geocodingServerErrorHandler);

    await expect(searchCities(SEARCH_TERM_WITH_RESULTS)).rejects.toMatchObject({
      kind: 'server',
    });
  });

  it('propaga NetworkError em falha de rede', async () => {
    server.use(geocodingNetworkErrorHandler);

    await expect(searchCities(SEARCH_TERM_WITH_RESULTS)).rejects.toMatchObject({
      kind: 'network',
    });
  });

  it('repassa o erro original quando o sinal de abort é disparado', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      searchCities(SEARCH_TERM_WITH_RESULTS, controller.signal),
    ).rejects.toMatchObject({
      isAxiosError: true,
      code: 'ERR_CANCELED',
    });
  });
});
