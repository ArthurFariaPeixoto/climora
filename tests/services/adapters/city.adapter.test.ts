import { describe, expect, it } from 'vitest';

import type { City } from '@/models/City';
import {
  beloHorizonteGeoDto,
  geocodingBlankCountryDto,
  geocodingMissingNameDto,
  geocodingNonFiniteLatDto,
  geocodingNonFiniteLonDto,
  lisboaGeoDto,
  rioGeoDto,
  saoPauloGeoDto,
} from '@/mocks/fixtures';
import { mapCityDtoToModel } from '@/services/adapters/city.adapter';
import type { InvalidDataError } from '@/utils/errors';

function requireInvalidData(fn: () => City): InvalidDataError {
  try {
    fn();
  } catch (error) {
    expect(error).toEqual(expect.objectContaining({ kind: 'invalid-data' }));
    return error as InvalidDataError;
  }
  throw new Error('Esperava InvalidDataError.');
}

describe('mapCityDtoToModel', () => {
  it('mapeia name, country, lat e lon', () => {
    expect(mapCityDtoToModel(rioGeoDto)).toEqual<City>({
      name: 'Rio de Janeiro',
      country: 'BR',
      lat: -22.9,
      lon: -43.17,
    });
  });

  it('propaga state quando presente', () => {
    expect(mapCityDtoToModel(beloHorizonteGeoDto).state).toBe('MG');
  });

  it('ignora local_names (name já vêm localizado via lang)', () => {
    expect(mapCityDtoToModel(saoPauloGeoDto)).toEqual<City>({
      name: 'São Paulo',
      country: 'BR',
      state: 'SP',
      lat: -23.55,
      lon: -46.63,
    });
  });

  it('mapeia cidade sem state e sem local_names', () => {
    expect(mapCityDtoToModel(lisboaGeoDto)).toEqual<City>({
      name: 'Lisboa',
      country: 'PT',
      lat: 38.72,
      lon: -9.14,
    });
  });

  it('lança InvalidDataError para lat não finita', () => {
    expect(
      requireInvalidData(() => mapCityDtoToModel(geocodingNonFiniteLatDto))
        .message,
    ).toContain('lat');
  });

  it('lança InvalidDataError para lon não finita', () => {
    expect(
      requireInvalidData(() => mapCityDtoToModel(geocodingNonFiniteLonDto))
        .message,
    ).toContain('lon');
  });

  it('lança InvalidDataError para country vazio', () => {
    expect(
      requireInvalidData(() => mapCityDtoToModel(geocodingBlankCountryDto))
        .message,
    ).toContain('country');
  });

  it('lança InvalidDataError para name ausente', () => {
    expect(
      requireInvalidData(() => mapCityDtoToModel(geocodingMissingNameDto))
        .message,
    ).toContain('name');
  });
});
