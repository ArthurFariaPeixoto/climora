import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';
import { searchCities } from '@/services/repositories/city-repository';

/**
 * Integração do repositório de cidades via MSW (fase 02 §6, ADR-10).
 *
 * Valida o contrato do fetcher: `City[]` no fluxo feliz, `[]` para resposta
 * vazia **e** `404`, além do repasse do abort (ADR-06). Fixtures inline até a
 * fase 04 criar `src/mocks/`.
 */
const cityDtos = [
  { name: 'São Paulo', lat: -23.55, lon: -46.63, country: 'BR', state: 'SP' },
];

describe('searchCities', () => {
  it('retorna City[] no fluxo feliz', async () => {
    server.use(
      http.get('http://localhost:3003/geo/1.0/direct', ({ request }) => {
        const { searchParams } = new URL(request.url);
        expect(searchParams.get('q')).toBe('São Paulo');
        expect(searchParams.get('limit')).toBe('5');
        expect(searchParams.get('lang')).toBe('pt_br');
        return HttpResponse.json(cityDtos);
      }),
    );

    const cities = await searchCities('São Paulo');

    expect(cities).toEqual([
      expect.objectContaining({
        name: 'São Paulo',
        country: 'BR',
        state: 'SP',
        lat: -23.55,
        lon: -46.63,
      }),
    ]);
  });

  it('retorna [] quando a resposta vem vazia', async () => {
    server.use(
      http.get('http://localhost:3003/geo/1.0/direct', () => {
        return HttpResponse.json([]);
      }),
    );

    await expect(searchCities('cidade-inexistente')).resolves.toEqual([]);
  });

  it('retorna [] em 404 (cidade inexistente não é erro de UI)', async () => {
    server.use(
      http.get('http://localhost:3003/geo/1.0/direct', () => {
        return HttpResponse.json({ message: 'city not found' }, { status: 404 });
      }),
    );

    await expect(searchCities('cidade-inexistente')).resolves.toEqual([]);
  });

  it('repassa o erro original quando o sinal de abort é disparado', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(searchCities('São Paulo', controller.signal)).rejects.toMatchObject({
      isAxiosError: true,
      code: 'ERR_CANCELED',
    });
  });
});