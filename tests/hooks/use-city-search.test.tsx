import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCitySearch } from '@/hooks/use-city-search';
import {
  SEARCH_TERM_NO_RESULTS,
  SEARCH_TERM_WITH_RESULTS,
  saoPauloCity,
} from '@/mocks/fixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
  deferred,
} from '@/mocks/testing';
import type { City } from '@/models/City';
import { searchCities } from '@/services/repositories/city-repository';

/**
 * Fachada `use-city-search` (fase 03 §3, ADR-05/06/09/11).
 *
 * Tradução dos estados para a taxonomia canônica com a camada de data-fetching
 * real e o repositório mockado (stack §16, fase 04 §3): `idle` e termo inválido
 * nunca disparam requisição; quando válido, o gating `enabled`/chave da query
 * de §1 é exercitado de verdade. Dados de `src/mocks/fixtures` (fase 04 §1) e
 * `QueryClient` isolado de `src/mocks/testing`.
 */
vi.mock('@/services/repositories/city-repository', () => ({
  searchCities: vi.fn(),
}));

const mockedSearchCities = vi.mocked(searchCities);

let wrapper: ReturnType<typeof createQueryClientWrapper>;

beforeEach(() => {
  wrapper = createQueryClientWrapper(createTestQueryClient());
  mockedSearchCities.mockReset();
});

describe('useCitySearch', () => {
  it('termo vazio: idle, sem requisição', () => {
    const { result } = renderHook(() => useCitySearch(''), { wrapper });

    expect(result.current.status).toBe('idle');
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(mockedSearchCities).not.toHaveBeenCalled();
  });

  it('termo inválido: error com InvalidSearchError, sem requisição', () => {
    const { result } = renderHook(() => useCitySearch('ab'), { wrapper });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.kind).toBe('invalid-search');
    expect(result.current.cities).toEqual([]);
    expect(mockedSearchCities).not.toHaveBeenCalled();
  });

  it('loading enquanto pendente e success ao resolver', async () => {
    const { promise, resolve } = deferred<City[]>();
    mockedSearchCities.mockImplementationOnce(() => promise);

    const { result } = renderHook(
      () => useCitySearch(SEARCH_TERM_WITH_RESULTS),
      {
        wrapper,
      },
    );

    expect(result.current.status).toBe('loading');

    await act(async () => {
      resolve([saoPauloCity]);
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.cities).toEqual([saoPauloCity]);
    expect(mockedSearchCities).toHaveBeenCalledWith(
      SEARCH_TERM_WITH_RESULTS,
      expect.anything(),
    );
  });

  it('success: expõe City[] do repositório', async () => {
    mockedSearchCities.mockResolvedValueOnce([saoPauloCity]);

    const { result } = renderHook(
      () => useCitySearch(SEARCH_TERM_WITH_RESULTS),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.cities).toEqual([saoPauloCity]);
    expect(result.current.error).toBeNull();
    expect(result.current.isFetching).toBe(false);
    expect(typeof result.current.refetch).toBe('function');
  });

  it('empty: success sem resultados', async () => {
    mockedSearchCities.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCitySearch(SEARCH_TERM_NO_RESULTS), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe('empty'));
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('error: propaga AppError da consulta', async () => {
    mockedSearchCities.mockRejectedValueOnce({
      kind: 'unauthorized',
      message: 'Configuração inválida: verifique a chave de API.',
    });

    const { result } = renderHook(
      () => useCitySearch(SEARCH_TERM_WITH_RESULTS),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.kind).toBe('unauthorized');
    expect(result.current.cities).toEqual([]);
  });

  it('troca de termo: chave nova dispara nova consulta e troca os dados', async () => {
    mockedSearchCities.mockImplementation((term: string) =>
      Promise.resolve([{ ...saoPauloCity, name: term }]),
    );

    const { result, rerender } = renderHook(
      (term: string) => useCitySearch(term),
      {
        wrapper,
        initialProps: SEARCH_TERM_WITH_RESULTS,
      },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.cities[0].name).toBe(SEARCH_TERM_WITH_RESULTS);

    rerender('recife');

    await waitFor(() => expect(result.current.cities[0]?.name).toBe('recife'));
    expect(mockedSearchCities).toHaveBeenCalledTimes(2);
  });
});
