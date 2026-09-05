import type { City } from '@/models/City';

/**
 * Repositório de cidades — fetcher da camada de data-fetching (ADR-10).
 *
 * Orquestra client + endpoint + adapter e retorna apenas `models` (`City[]`).
 * Fronteira de mock para os testes de `city-query`.
 *
 * TODO: implementar a chamada HTTP real (`apiClient` + `buildCitySearchQuery`
 * + `mapCityDtoToModel`) quando a integração for feita.
 */
export async function searchCities(_term: string): Promise<City[]> {
  throw new Error('Not implemented');
}
