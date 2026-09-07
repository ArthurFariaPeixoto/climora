import { describe, expect, it } from 'vitest';

import type { CurrentWeatherDto, ForecastBlockDto } from '@/services/dtos';
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

function validCurrentWeather(): CurrentWeatherDto {
  return {
    dt: 1_752_904_500,
    main: {
      temp: 22.3,
      feels_like: 21.8,
      temp_min: 19.1,
      temp_max: 24.7,
      pressure: 1013,
      humidity: 65,
    },
    weather: [{ id: 800, main: 'Clear', description: 'Céu limpo', icon: '01d' }],
    wind: { speed: 5, deg: 180 },
    visibility: 10_000,
  };
}

function validForecastBlock(): ForecastBlockDto {
  return {
    dt: 1_752_904_500,
    main: {
      temp: 22.3,
      feels_like: 21.8,
      temp_min: 19.1,
      temp_max: 24.7,
      pressure: 1013,
      humidity: 65,
    },
    weather: [{ id: 800, main: 'Clear', description: 'Céu limpo', icon: '01d' }],
    wind: { speed: 10, deg: 90 },
    pop: 0.5,
  };
}

describe('mapCurrentWeatherDtoToModel', () => {
  it('mapeia os campos diretos e o timestamp', () => {
    const model = mapCurrentWeatherDtoToModel(validCurrentWeather());

    expect(model.temperatureC).toBe(22.3);
    expect(model.feelsLikeC).toBe(21.8);
    expect(model.minC).toBe(19.1);
    expect(model.maxC).toBe(24.7);
    expect(model.humidityPct).toBe(65);
    expect(model.pressureHpa).toBe(1013);
    expect(model.observedAt).toBe(1_752_904_500);
  });

  it('converte visibilidade de metros para km', () => {
    expect(mapCurrentWeatherDtoToModel(validCurrentWeather()).visibilityKm).toBe(10);
  });

  it('converte vento de m/s para km/h e mantém o grau', () => {
    expect(mapCurrentWeatherDtoToModel(validCurrentWeather()).wind).toEqual({
      speedKmh: 18,
      degree: 180,
    });
  });

  it('mapeia a condição completa (id, description, main)', () => {
    expect(mapCurrentWeatherDtoToModel(validCurrentWeather()).condition).toEqual({
      id: 800,
      main: 'Clear',
      description: 'Céu limpo',
    });
  });

  it('omite precipitationPct (clima atual não possui pop)', () => {
    const model = mapCurrentWeatherDtoToModel(validCurrentWeather());
    expect('precipitationPct' in model).toBe(false);
  });

  it('lança InvalidDataError com weather vazio', () => {
    const dto = { ...validCurrentWeather(), weather: [] };
    expect(requireInvalidData(() => mapCurrentWeatherDtoToModel(dto)).message).toContain(
      'condição'
    );
  });

  it('lança InvalidDataError com main ausente', () => {
    const dto = { ...validCurrentWeather(), main: null } as unknown as CurrentWeatherDto;
    expect(requireInvalidData(() => mapCurrentWeatherDtoToModel(dto)).message).toContain(
      'main'
    );
  });

  it('lança InvalidDataError com wind ausente', () => {
    const dto = { ...validCurrentWeather(), wind: undefined } as unknown as CurrentWeatherDto;
    expect(requireInvalidData(() => mapCurrentWeatherDtoToModel(dto)).message).toContain(
      'wind'
    );
  });

  it('lança InvalidDataError com temperatura não finita', () => {
    const dto = {
      ...validCurrentWeather(),
      main: { ...validCurrentWeather().main, temp: Number.POSITIVE_INFINITY },
    } as unknown as CurrentWeatherDto;
    expect(requireInvalidData(() => mapCurrentWeatherDtoToModel(dto)).message).toContain(
      'main.temp'
    );
  });
});

describe('mapForecastBlockDtoToHourlyModel', () => {
  it('mapeia time, temperaturas, umidade e condição', () => {
    const model = mapForecastBlockDtoToHourlyModel(validForecastBlock());

    expect(model.time).toBe(1_752_904_500);
    expect(model.temperatureC).toBe(22.3);
    expect(model.feelsLikeC).toBe(21.8);
    expect(model.humidityPct).toBe(65);
    expect(model.condition).toBe('Céu limpo');
  });

  it('converte pop (0–1) para porcentagem', () => {
    expect(mapForecastBlockDtoToHourlyModel(validForecastBlock()).precipitationPct).toBe(50);
  });

  it('converte vento de m/s para km/h', () => {
    expect(mapForecastBlockDtoToHourlyModel(validForecastBlock()).windSpeedKmh).toBe(36);
  });

  it('lança InvalidDataError com weather vazio', () => {
    const dto = { ...validForecastBlock(), weather: [] };
    expect(requireInvalidData(() => mapForecastBlockDtoToHourlyModel(dto)).message).toContain(
      'condição'
    );
  });

  it('lança InvalidDataError com pop ausente', () => {
    const dto = { ...validForecastBlock(), pop: null } as unknown as ForecastBlockDto;
    expect(requireInvalidData(() => mapForecastBlockDtoToHourlyModel(dto)).message).toContain(
      'pop'
    );
  });

  it('lança InvalidDataError com main ausente', () => {
    const dto = { ...validForecastBlock(), main: null } as unknown as ForecastBlockDto;
    expect(requireInvalidData(() => mapForecastBlockDtoToHourlyModel(dto)).message).toContain(
      'main'
    );
  });

  it('lança InvalidDataError com wind.speed não finita', () => {
    const dto = {
      ...validForecastBlock(),
      wind: { speed: Number.NaN, deg: 90 },
    } as unknown as ForecastBlockDto;
    expect(requireInvalidData(() => mapForecastBlockDtoToHourlyModel(dto)).message).toContain(
      'wind.speed'
    );
  });
});