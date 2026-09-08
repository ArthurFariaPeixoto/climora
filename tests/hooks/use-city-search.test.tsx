import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCitySearch } from '@/hooks/use-city-search';
import type { City } from '@/models/City';
import { searchCities } from '@/services/repositories/city-repository';

/**
 * Fachada `use-city-search` (fase 03 §3, ADR-05/06/09/11).
 *
 * Tradução dos estados para a taxonomia canônica com a camada de data-fetching
 * real e o repositório mockado (stack §16): `idle` e termo inválido nunca
 * disparam requisição; quando válido, o gating `enabled`/chave da query de §1
 * é exercitado de verdade.
 */
vi.mock('@/services/repositories/city-repository', () => ({
  searchCities: vi.fn(),
}));

const mockedSearchCities = vi.mocked(searchCities);

const saoPaulo: City = {
  name: 'São Paulo',
  country: 'BR',
  state: 'SP',
  lat: -23.55,
  lon: -46.63,
};

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  mockedSearchCities.mockReset();
});

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

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
    let resolve!: (value: City[]) => void;
    mockedSearchCities.mockImplementationOnce(
      () =>
        new Promise<City[]>((res) => {
          resolve = res;
        }),
    );

    const { result } = renderHook(() => useCitySearch('são paulo'), {
      wrapper,
    });

    expect(result.current.status).toBe('loading');

    await act(async () => {
      resolve([saoPaulo]);
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.cities).toEqual([saoPaulo]);
    expect(mockedSearchCities).toHaveBeenCalledWith(
      'são paulo',
      expect.anything(),
    );
  });

  it('success: expõe City[] do repositório', async () => {
    mockedSearchCities.mockResolvedValueOnce([saoPaulo]);

    const { result } = renderHook(() => useCitySearch('são paulo'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.cities).toEqual([saoPaulo]);
    expect(result.current.error).toBeNull();
    expect(result.current.isFetching).toBe(false);
    expect(typeof result.current.refetch).toBe('function');
  });

  it('empty: success sem resultados', async () => {
    mockedSearchCities.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCitySearch('cidade inexistente'), {
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

    const { result } = renderHook(() => useCitySearch('são paulo'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.kind).toBe('unauthorized');
    expect(result.current.cities).toEqual([]);
  });

  it('troca de termo: chave nova dispara nova consulta e troca os dados', async () => {
    mockedSearchCities.mockImplementation((term: string) =>
      Promise.resolve([{ ...saoPaulo, name: term }]),
    );

    const { result, rerender } = renderHook(
      (term: string) => useCitySearch(term),
      {
        wrapper,
        initialProps: 'são paulo',
      },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.cities[0].name).toBe('são paulo');

    rerender('recife');

    await waitFor(() => expect(result.current.cities[0]?.name).toBe('recife'));
    expect(mockedSearchCities).toHaveBeenCalledTimes(2);
  });
});
