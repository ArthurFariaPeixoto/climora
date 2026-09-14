import { mapCityDtoToModel } from '@/services/adapters/city.adapter';
import type { GeocodingLocationDto } from '@/services/dtos';
import {
  GEOCODING_PATH,
  buildCitySearchQuery,
} from '@/services/endpoints/endpoints';
import { apiClient } from '@/services/http/api-client';
import type { City } from '@/models/City';
import type { NotFoundError } from '@/utils/errors';

/**
 * Repositório de cidades — fetcher da camada de data-fetching (ADR-10).
 *
 * Orquestra client + endpoint + adapter e retorna apenas `models` (`City[]`).
 * Fronteira de mock para os testes de `city-query`.
 *
 * Regras do contrato (arquitetura §5.3):
 * - resposta vazia **ou `404`** é traduzida em `[]` — o estado `empty` é
 *   interpretado no hook (nenhuma cidade de um termo não é erro de UI);
 * - o sinal de abort é repassado ao Axios (ADR-06); quando disparado, o erro
 *   original (`ERR_CANCELED`) sobe para a camada de data-fetching tratar como
 *   concorrência — não vira erro de UI;
 * - os erros de transporte já chegam aqui como `AppError` (interceptor do
 *   `apiClient`); nenhum `AxiosError` cru escapa desta camada.
 */
export async function searchCities(
  term: string,
  signal?: AbortSignal,
): Promise<City[]> {
  let data: GeocodingLocationDto[];
  try {
    ({ data } = await apiClient.get<GeocodingLocationDto[]>(GEOCODING_PATH, {
      params: buildCitySearchQuery(term),
      signal,
    }));
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }

  if (data.length === 0) {
    return [];
  }

  return data.map(mapCityDtoToModel);
}

function isNotFound(error: unknown): error is NotFoundError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { kind?: string }).kind === 'not-found'
  );
}
