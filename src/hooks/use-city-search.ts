import type { City } from '@/models/City';

/**
 * Facha de feature para a busca de cidades.
 *
 * Traduz a consulta da camada de data-fetching (`useCitySearchQuery`) para a
 * taxonomia canônica de estados (`idle | loading | success | error | empty`)
 * e expõe apenas `City[]` + estados para a UI.
 *
 * TODO: implementar validação do termo (`utils/validation`), states deados e
 * tradução de erros quando a feature for desenvolvida.
 */
export function useCitySearch(_term: string) {
  return { cities: [] as City[], status: 'idle' as const };
}
