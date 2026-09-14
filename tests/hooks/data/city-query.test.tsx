import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCitySearchQuery, citySearchKey } from '@/hooks/data/city-query';
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

vi.mock('@/services/repositories/city-repository', () => ({
  searchCities: vi.fn(),
}));

const mockedSearchCities = vi.mocked(searchCities);

let wrapper: ReturnType<typeof createQueryClientWrapper>;

beforeEach(() => {
  wrapper = createQueryClientWrapper(createTestQueryClient());
  mockedSearchCities.mockReset();
});

describe('citySearchKey', () => {
  it('gera chave ["cities", term] com o termo informado', () => {
    expect(citySearchKey('são paulo')).toEqual(['cities', 'são paulo']);
  });

  it('gera chave distinta para termos diferentes', () => {
    expect(citySearchKey('recife')).not.toEqual(citySearchKey('salvador'));
  });
});

describe('useCitySearchQuery', () => {
  it('enabled: false não dispara query', () => {
    renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: false,
        }),
      { wrapper },
    );

    expect(mockedSearchCities).not.toHaveBeenCalled();
  });

  it('enabled: true dispara query com termo e signal', async () => {
    mockedSearchCities.mockResolvedValueOnce([saoPauloCity]);

    renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(mockedSearchCities).toHaveBeenCalled());
    expect(mockedSearchCities).toHaveBeenCalledWith(
      SEARCH_TERM_WITH_RESULTS,
      expect.any(AbortSignal),
    );
  });

  it('sucesso: retorna City[] e isFetching false', async () => {
    mockedSearchCities.mockResolvedValueOnce([saoPauloCity]);

    const { result } = renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([saoPauloCity]);
    expect(result.current.isFetching).toBe(false);
  });

  it('resposta vazia: data é array vazio', async () => {
    mockedSearchCities.mockResolvedValueOnce([]);

    const { result } = renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_NO_RESULTS,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('erro: isError true e error é AppError', async () => {
    mockedSearchCities.mockRejectedValueOnce({
      kind: 'unauthorized',
      message: 'Configuração inválida: verifique a chave de API.',
    });

    const { result } = renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('unauthorized');
  });

  it('cache/hit-miss: mesma chave reutiliza dados entre renderizações', async () => {
    mockedSearchCities.mockResolvedValueOnce([saoPauloCity]);

    const client = createTestQueryClient();
    const cacheWrapper = createQueryClientWrapper(client);

    const { result, unmount } = renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([saoPauloCity]);

    unmount();

    mockedSearchCities.mockClear();

    const { result: result2 } = renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    await waitFor(() => expect(result2.current.isSuccess).toBe(true));
    expect(result2.current.data).toEqual([saoPauloCity]);
    expect(mockedSearchCities).not.toHaveBeenCalled();
  });

  it('cache/miss: chave diferente dispara nova query', async () => {
    const { promise: p1, resolve: r1 } = deferred<City[]>();
    const recifeCity: City = { ...saoPauloCity, name: 'Recife' };

    mockedSearchCities.mockImplementationOnce(() => p1);

    const client = createTestQueryClient();
    const cacheWrapper = createQueryClientWrapper(client);

    const { result, rerender } = renderHook(
      ({ term }) =>
        useCitySearchQuery({
          term,
          enabled: true,
        }),
      { wrapper: cacheWrapper, initialProps: { term: SEARCH_TERM_WITH_RESULTS } },
    );

    await act(async () => {
      r1([saoPauloCity]);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([saoPauloCity]);

    mockedSearchCities.mockResolvedValueOnce([recifeCity]);

    rerender({ term: 'recife' });

    await waitFor(() =>
      expect(mockedSearchCities).toHaveBeenCalledWith(
        'recife',
        expect.any(AbortSignal),
      ),
    );
    expect(mockedSearchCities).toHaveBeenCalledTimes(2);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([recifeCity]);
  });

  it('dedup em voo: duas renderizações simultâneas com mesmo termo fazem 1 chamada', async () => {
    const { promise, resolve } = deferred<City[]>();
    mockedSearchCities.mockImplementation(() => promise);

    const client = createTestQueryClient();
    const cacheWrapper = createQueryClientWrapper(client);

    renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    await act(async () => {
      resolve([saoPauloCity]);
    });

    await waitFor(() =>
      expect(mockedSearchCities).toHaveBeenCalledTimes(1),
    );
  });

  it('keepPreviousData: ao trocar termo, dados antigos permanecem enquanto novo carrega', async () => {
    const { promise: p1, resolve: r1 } = deferred<City[]>();
    mockedSearchCities.mockImplementationOnce(() => p1);

    const client = createTestQueryClient();
    const cacheWrapper = createQueryClientWrapper(client);

    const { result, rerender } = renderHook(
      ({ term }) =>
        useCitySearchQuery({
          term,
          enabled: true,
        }),
      { wrapper: cacheWrapper, initialProps: { term: SEARCH_TERM_WITH_RESULTS } },
    );

    await act(async () => {
      r1([saoPauloCity]);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([saoPauloCity]);

    const { promise: p2 } = deferred<City[]>();
    mockedSearchCities.mockImplementationOnce(() => p2);

    rerender({ term: 'recife' });

    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.data).toEqual([saoPauloCity]);
  });

  it('refetch: dispara nova requisição e atualiza dados', async () => {
    mockedSearchCities
      .mockResolvedValueOnce([saoPauloCity])
      .mockResolvedValueOnce([{ ...saoPauloCity, name: 'São Paulo Atualizado' }]);

    const { result } = renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.name).toBe('São Paulo');

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.data?.[0]?.name).toBe('São Paulo Atualizado'),
    );
    expect(mockedSearchCities).toHaveBeenCalledTimes(2);
  });

  it('staleTime: dados não ficam stale imediatamente após resolução', async () => {
    mockedSearchCities.mockResolvedValueOnce([saoPauloCity]);

    const client = createTestQueryClient();
    const cacheWrapper = createQueryClientWrapper(client);

    const { result, unmount } = renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    unmount();

    mockedSearchCities.mockClear();

    const { result: result2 } = renderHook(
      () =>
        useCitySearchQuery({
          term: SEARCH_TERM_WITH_RESULTS,
          enabled: true,
        }),
      { wrapper: cacheWrapper },
    );

    expect(result2.current.isLoading).toBe(false);
    expect(result2.current.data).toEqual([saoPauloCity]);
    expect(mockedSearchCities).not.toHaveBeenCalled();
  });
});
