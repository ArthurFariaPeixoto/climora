import { useQuery } from '@tanstack/react-query';

import type { City } from '@/models/City';

/**
 * Chave da consulta de busca de cidades (camada de data-fetching).
 *
 * A chave é identificada pelo termo pesquisado, permitindo cache,
 * deduplicação e invalidação por termo (stack §8).
 */
export function citySearchKey(term: string) {
  return ['cities', term] as const;
}

export interface UseCitySearchQueryOptions {
  term: string;
  enabled: boolean;
}

/**
 * Consulta de cidades via TanStack Query.
 *
 * TODO: definir `staleTime` (~60s) e conectar o fetcher em
 * `services/repositories` (`searchCities`) quando a integração for
 * implementada.
 */
export function useCitySearchQuery(_options: UseCitySearchQueryOptions) {
  return useQuery<City[], Error>({
    queryKey: citySearchKey(''),
    queryFn: () => {
      throw new Error('Not implemented');
    },
    enabled: false,
    staleTime: 0,
  });
}
