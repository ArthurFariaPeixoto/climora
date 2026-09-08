import { describe, expect, it } from 'vitest';

import {
  buildCitySearchQuery,
  buildWeatherQuery,
  CURRENT_WEATHER_PATH,
  DEFAULT_LANG,
  FORECAST_PATH,
  GEOCODING_LIMIT,
} from '@/services/endpoints/endpoints';

describe('buildCitySearchQuery', () => {
  it('retorna termos, limite e idioma', () => {
    expect(buildCitySearchQuery('São Paulo')).toEqual({
      q: 'São Paulo',
      limit: GEOCODING_LIMIT,
      lang: DEFAULT_LANG,
    });
  });

  it('mantém o limite e o idioma padrão fixos', () => {
    expect(buildCitySearchQuery('Belo Horizonte')).toEqual({
      q: 'Belo Horizonte',
      limit: GEOCODING_LIMIT,
      lang: DEFAULT_LANG,
    });
  });
});

describe('buildWeatherQuery', () => {
  const request = {
    lat: -23.55,
    lon: -46.63,
    scope: 'current' as const,
  };

  it('scope current → só o path de clima atual, com parâmetros exatos', () => {
    const { paths, params } = buildWeatherQuery(request);

    expect(paths).toEqual([CURRENT_WEATHER_PATH]);
    expect(params).toEqual({
      lat: request.lat,
      lon: request.lon,
      units: 'metric',
      lang: DEFAULT_LANG,
    });
  });

  it('scope current+forecast → clima atual e previsão, com parâmetros exatos', () => {
    const { paths, params } = buildWeatherQuery({
      ...request,
      scope: 'current+forecast',
    });

    expect(paths).toEqual([CURRENT_WEATHER_PATH, FORECAST_PATH]);
    expect(params).toEqual({
      lat: request.lat,
      lon: request.lon,
      units: 'metric',
      lang: DEFAULT_LANG,
    });
  });

  it('parâmetros idênticos entre os escopos', () => {
    const current = buildWeatherQuery(request).params;
    const forecast = buildWeatherQuery({
      ...request,
      scope: 'current+forecast',
    }).params;

    expect(forecast).toEqual(current);
  });
});
