import type { City } from '@/models/City';
import type { GeocodingLocationDto } from '@/services/dtos';

/**
 * Adaptadores — funções puras DTO → modelo (ADR-03).
 *
 * Único ponto que converte o contrato externo (OpenWeather) no contrato
 * interno da aplicação (`models`). Testáveis sem rede.
 *
 * TODO: implementar o mapeamento completo quando a integração for feita.
 */
export function mapCityDtoToModel(_dto: GeocodingLocationDto): City {
  throw new Error('Not implemented');
}
