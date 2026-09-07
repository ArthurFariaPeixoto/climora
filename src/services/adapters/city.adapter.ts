import type { City } from '@/models/City';
import type { GeocodingLocationDto } from '@/services/dtos';
import type { InvalidDataError } from '@/utils/errors';

/**
 * Adaptadores — funções puras DTO → modelo (ADR-03).
 *
 * Único ponto que converte o contrato externo (OpenWeather) no contrato
 * interno da aplicação (`models`). Testáveis sem rede.
 */
export function mapCityDtoToModel(dto: GeocodingLocationDto): City {
  const name = requireText(dto.name, 'name');
  const country = requireText(dto.country, 'country');
  const lat = requireFinite(dto.lat, 'lat');
  const lon = requireFinite(dto.lon, 'lon');

  // `local_names` não é consumido: `name` já chega localizado pelo parâmetro
  // `lang=pt_br` usado em `buildCitySearchQuery`.
  const city: City = { name, country, lat, lon };
  if (dto.state !== undefined) {
    city.state = dto.state;
  }
  return city;
}

function requireText(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw invalidDataError(`Campo "${field}" inválido em resposta de geocodificação.`);
  }
  return value;
}

function requireFinite(value: number, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw invalidDataError(`Campo "${field}" inválido em resposta de geocodificação.`);
  }
  return value;
}

function invalidDataError(message: string): InvalidDataError {
  return { kind: 'invalid-data', message };
}