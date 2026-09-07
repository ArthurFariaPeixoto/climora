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
  const city = { name: 'São Paulo', country: 'BR', lat: -23.55, lon: -46.63 };

  it('scope current → só o path de clima atual, com parâmetros exatos', () => {
    const { paths, params } = buildWeatherQuery(city, 'current');

    expect(paths).toEqual([CURRENT_WEATHER_PATH]);
    expect(params).toEqual({
      lat: city.lat,
      lon: city.lon,
      units: 'metric',
      lang: DEFAULT_LANG,
    });
  });

  it('scope current+forecast → clima atual e previsão, com parâmetros exatos', () => {
    const { paths, params } = buildWeatherQuery(city, 'current+forecast');

    expect(paths).toEqual([CURRENT_WEATHER_PATH, FORECAST_PATH]);
    expect(params).toEqual({
      lat: city.lat,
      lon: city.lon,
      units: 'metric',
      lang: DEFAULT_LANG,
    });
  });

  it('parâmetros idênticos entre os escopos', () => {
    const current = buildWeatherQuery(city, 'current').params;
    const forecast = buildWeatherQuery(city, 'current+forecast').params;

    expect(forecast).toEqual(current);
  });
});