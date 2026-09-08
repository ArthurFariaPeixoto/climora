import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { City } from '@/models/City';
import { searchCities } from '@/services/repositories/city-repository';
import { isRetryableAppError, type AppError } from '@/utils/errors';

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
 * Frequência de cache para a busca de cidades (~60s, stack §8).
 */
const CITY_QUERY_STALE_TIME = 60_000;

/**
 * Número máximo de tentativas de retry para erros transitórios.
 */
const CITY_QUERY_RETRY_ATTEMPTS = 2;

/**
 * Consulta de cidades via TanStack Query.
 *
 * Executa `searchCities` (fase 02) como fetcher — os erros de rede/HTTP já
 * chegam tipados `AppError` (interceptor do `apiClient`). O `signal` da query
 * é repassado ao transporte para descartar/cancelar respostas obsoletas
 * (ADR-06). `enabled` controla o disparo (a validação do termo fica na
 * fachada `use-city-search`).
 */
export function useCitySearchQuery(options: UseCitySearchQueryOptions) {
  return useQuery<City[], AppError>({
    queryKey: citySearchKey(options.term),
    queryFn: ({ signal }) => searchCities(options.term, signal),
    enabled: options.enabled,
    staleTime: CITY_QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) =>
      isRetryableAppError(error) && failureCount < CITY_QUERY_RETRY_ATTEMPTS,
  });
}
