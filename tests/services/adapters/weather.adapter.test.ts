import { describe, expect, it } from 'vitest';

import {
  currentWeatherDto,
  currentWeatherEmptyWeatherDto,
  currentWeatherInfiniteTempDto,
  currentWeatherMissingMainDto,
  currentWeatherMissingWindDto,
  forecastBlockDto,
  forecastBlockEmptyWeatherDto,
  forecastBlockMissingPopDto,
  forecastBlockNonFiniteWindSpeedDto,
  forecastBlockNullMainDto,
} from '@/mocks/fixtures';
import {
  mapCurrentWeatherDtoToModel,
  mapForecastBlockDtoToHourlyModel,
} from '@/services/adapters/weather.adapter';
import type { InvalidDataError } from '@/utils/errors';

function requireInvalidData(fn: () => unknown): InvalidDataError {
  try {
    fn();
  } catch (error) {
    expect(error).toEqual(expect.objectContaining({ kind: 'invalid-data' }));
    return error as InvalidDataError;
  }
  throw new Error('Esperava InvalidDataError.');
}

describe('mapCurrentWeatherDtoToModel', () => {
  it('mapeia os campos diretos e o timestamp', () => {
    const model = mapCurrentWeatherDtoToModel(currentWeatherDto);

    expect(model.temperatureC).toBe(22.3);
    expect(model.feelsLikeC).toBe(21.8);
    expect(model.minC).toBe(19.1);
    expect(model.maxC).toBe(24.7);
    expect(model.humidityPct).toBe(65);
    expect(model.pressureHpa).toBe(1013);
    expect(model.observedAt).toBe(currentWeatherDto.dt);
  });

  it('converte visibilidade de metros para km', () => {
    expect(mapCurrentWeatherDtoToModel(currentWeatherDto).visibilityKm).toBe(
      10,
    );
  });

  it('converte vento de m/s para km/h e mantém o grau', () => {
    expect(mapCurrentWeatherDtoToModel(currentWeatherDto).wind).toEqual({
      speedKmh: 18,
      degree: 180,
    });
  });

  it('mapeia a condição completa (id, description, main)', () => {
    expect(mapCurrentWeatherDtoToModel(currentWeatherDto).condition).toEqual({
      id: 800,
      main: 'Clear',
      description: 'Céu limpo',
    });
  });

  it('omite precipitationPct (clima atual não possui pop)', () => {
    const model = mapCurrentWeatherDtoToModel(currentWeatherDto);
    expect('precipitationPct' in model).toBe(false);
  });

  it('lança InvalidDataError com weather vazio', () => {
    expect(
      requireInvalidData(() =>
        mapCurrentWeatherDtoToModel(currentWeatherEmptyWeatherDto),
      ).message,
    ).toContain('condição');
  });

  it('lança InvalidDataError com main ausente', () => {
    expect(
      requireInvalidData(() =>
        mapCurrentWeatherDtoToModel(currentWeatherMissingMainDto),
      ).message,
    ).toContain('main');
  });

  it('lança InvalidDataError com wind ausente', () => {
    expect(
      requireInvalidData(() =>
        mapCurrentWeatherDtoToModel(currentWeatherMissingWindDto),
      ).message,
    ).toContain('wind');
  });

  it('lança InvalidDataError com temperatura não finita', () => {
    expect(
      requireInvalidData(() =>
        mapCurrentWeatherDtoToModel(currentWeatherInfiniteTempDto),
      ).message,
    ).toContain('main.temp');
  });
});

describe('mapForecastBlockDtoToHourlyModel', () => {
  it('mapeia time, temperaturas, umidade e condição', () => {
    const model = mapForecastBlockDtoToHourlyModel(forecastBlockDto);

    expect(model.time).toBe(forecastBlockDto.dt);
    expect(model.temperatureC).toBe(22.3);
    expect(model.feelsLikeC).toBe(21.8);
    expect(model.humidityPct).toBe(65);
    expect(model.condition).toBe('Céu limpo');
  });

  it('converte pop (0–1) para porcentagem', () => {
    expect(
      mapForecastBlockDtoToHourlyModel(forecastBlockDto).precipitationPct,
    ).toBe(50);
  });

  it('converte vento de m/s para km/h', () => {
    expect(
      mapForecastBlockDtoToHourlyModel(forecastBlockDto).windSpeedKmh,
    ).toBe(36);
  });

  it('lança InvalidDataError com weather vazio', () => {
    expect(
      requireInvalidData(() =>
        mapForecastBlockDtoToHourlyModel(forecastBlockEmptyWeatherDto),
      ).message,
    ).toContain('condição');
  });

  it('lança InvalidDataError com pop ausente', () => {
    expect(
      requireInvalidData(() =>
        mapForecastBlockDtoToHourlyModel(forecastBlockMissingPopDto),
      ).message,
    ).toContain('pop');
  });

  it('lança InvalidDataError com main ausente', () => {
    expect(
      requireInvalidData(() =>
        mapForecastBlockDtoToHourlyModel(forecastBlockNullMainDto),
      ).message,
    ).toContain('main');
  });

  it('lança InvalidDataError com wind.speed não finita', () => {
    expect(
      requireInvalidData(() =>
        mapForecastBlockDtoToHourlyModel(forecastBlockNonFiniteWindSpeedDto),
      ).message,
    ).toContain('wind.speed');
  });
});
