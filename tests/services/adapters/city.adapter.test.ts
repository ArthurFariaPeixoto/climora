import { describe, expect, it } from 'vitest';

import type { City } from '@/models/City';
import type { GeocodingLocationDto } from '@/services/dtos';
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
    const dto: GeocodingLocationDto = {
      name: 'São Paulo',
      lat: -23.55,
      lon: -46.63,
      country: 'BR',
    };

    expect(mapCityDtoToModel(dto)).toEqual<City>({
      name: 'São Paulo',
      country: 'BR',
      lat: -23.55,
      lon: -46.63,
    });
  });

  it('propaga state quando presente', () => {
    const dto: GeocodingLocationDto = {
      name: 'Belo Horizonte',
      lat: -19.91,
      lon: -43.94,
      country: 'BR',
      state: 'MG',
    };

    expect(mapCityDtoToModel(dto).state).toBe('MG');
  });

  it('ignora local_names (name já vêm localizado via lang)', () => {
    const dto: GeocodingLocationDto = {
      name: 'Rio de Janeiro',
      local_names: { ar: 'ريو دي جانيرو' },
      lat: -22.9,
      lon: -43.17,
      country: 'BR',
    };

    expect(mapCityDtoToModel(dto)).toEqual({
      name: 'Rio de Janeiro',
      country: 'BR',
      lat: -22.9,
      lon: -43.17,
    });
  });

  it('lança InvalidDataError para lat não finita', () => {
    const dto = {
      name: 'Curitiba',
      lat: Number.NaN,
      lon: -49.27,
      country: 'BR',
    } as unknown as GeocodingLocationDto;

    expect(requireInvalidData(() => mapCityDtoToModel(dto)).message).toContain('lat');
  });

  it('lança InvalidDataError para country vazio', () => {
    const dto = {
      name: 'Florianópolis',
      lat: -27.59,
      lon: -48.55,
      country: '   ',
    } as unknown as GeocodingLocationDto;

    expect(requireInvalidData(() => mapCityDtoToModel(dto)).message).toContain('country');
  });

  it('lança InvalidDataError para name ausente', () => {
    const dto = {
      lat: -15.79,
      lon: -47.88,
      country: 'BR',
    } as unknown as GeocodingLocationDto;

    expect(requireInvalidData(() => mapCityDtoToModel(dto)).message).toContain('name');
  });
});