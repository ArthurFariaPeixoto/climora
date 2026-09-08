import type { QueryObserverResult } from '@tanstack/react-query';

import type { City } from '@/models/City';
import { useCitySearchQuery } from '@/hooks/data/city-query';
import type { AppError } from '@/utils/errors';
import { validateSearchTerm } from '@/utils/validation';

/**
 * Estados canônicos da busca de cidades (arquitetura §7, ADR-05).
 */
export type CitySearchStatus =
  'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface UseCitySearchResult {
  status: CitySearchStatus;
  cities: City[];
  error: AppError | null;
  isFetching: boolean;
  refetch: () => Promise<QueryObserverResult<City[], AppError>>;
}

/**
 * Fachada de feature para a busca de cidades.
 *
 * Recebe o termo submetido (estado de UI do `SearchBar`), valida antes de
 * disparar e traduz a consulta da camada de data-fetching para a taxonomia
 * canônica `idle | loading | success | error | empty`. Expõe apenas `City[]`
 * (modelos — nunca DTOs) + estados para a UI (ADR-05, ADR-11).
 *
 * Regras:
 * - termo vazio/branco → `idle` (nenhum termo submetido), sem requisição;
 * - termo inválido → `error` com `InvalidSearchError`, sem requisição
 *   (`enabled: false` — arquitetura §9);
 * - termo válido → consulta chaveada por termo; a troca de termo gera chave
 *   nova e o TanStack descarta/cancela a consulta obsoleta (ADR-06);
 * - `keepPreviousData` da query preserva o último resultado durante refetch.
 */
export function useCitySearch(term: string): UseCitySearchResult {
  const validation = validateSearchTerm(term);
  const enabled = validation.valid;

  const {
    data,
    error: queryError,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useCitySearchQuery({ term, enabled });

  const shared = { isFetching, refetch };

  if (term.trim() === '') {
    return { ...shared, status: 'idle', cities: [], error: null };
  }

  if (!validation.valid) {
    return { ...shared, status: 'error', cities: [], error: validation.reason };
  }

  if (isPending) {
    return { ...shared, status: 'loading', cities: data ?? [], error: null };
  }

  if (isError) {
    return { ...shared, status: 'error', cities: [], error: queryError };
  }

  if (data.length === 0) {
    return { ...shared, status: 'empty', cities: [], error: null };
  }

  return { ...shared, status: 'success', cities: data, error: null };
}
