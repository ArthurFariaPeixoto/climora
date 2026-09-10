import type { City } from '@/models/City';
import type { CurrentWeather } from '@/models/CurrentWeather';
import type { DailyForecast } from '@/models/DailyForecast';
import type { HourlyForecast } from '@/models/HourlyForecast';

/**
 * Fixtures de modelos — estado derivado pronto (fase 04 §1).
 *
 * Dados para testes de hooks/componentes, já normalizados pelos adapters.
 * Modelos escritos à mão (e não derivados dos DTOs em runtime) para que um
 * possível bug de adapter não "conserte" silenciosamente as expectativas.
 */

const DAY1_1000 = Math.floor(Date.UTC(2026, 0, 5, 10, 0, 0) / 1000);
const DAY1_1300 = Math.floor(Date.UTC(2026, 0, 5, 13, 0, 0) / 1000);
const DAY1_START = Math.floor(Date.UTC(2026, 0, 5) / 1000);
const DAY2_1000 = Math.floor(Date.UTC(2026, 0, 6, 10, 0, 0) / 1000);
const DAY2_1300 = Math.floor(Date.UTC(2026, 0, 6, 13, 0, 0) / 1000);
const DAY2_START = Math.floor(Date.UTC(2026, 0, 6) / 1000);

// --- Cidades --------------------------------------------------------------

export const saoPauloCity: City = {
  name: 'São Paulo',
  country: 'BR',
  state: 'SP',
  lat: -23.55,
  lon: -46.63,
};

export const rioCity: City = {
  name: 'Rio de Janeiro',
  country: 'BR',
  lat: -22.9,
  lon: -43.17,
};

export const beloHorizonteCity: City = {
  name: 'Belo Horizonte',
  country: 'BR',
  state: 'MG',
  lat: -19.91,
  lon: -43.94,
};

export const lisboaCity: City = {
  name: 'Lisboa',
  country: 'PT',
  lat: 38.72,
  lon: -9.14,
};

/** Resultado multi-cidade da busca (espelho de `citySearchResultsDto`). */
export const citySearchResultsModel: City[] = [
  saoPauloCity,
  rioCity,
  beloHorizonteCity,
  lisboaCity,
];

// --- Clima atual ----------------------------------------------------------

export const currentWeatherModel: CurrentWeather = {
  temperatureC: 22.3,
  feelsLikeC: 21.8,
  minC: 19.1,
  maxC: 24.7,
  humidityPct: 65,
  pressureHpa: 1013,
  visibilityKm: 10,
  wind: { speedKmh: 18, degree: 180 },
  condition: { id: 800, main: 'Clear', description: 'Céu limpo' },
  observedAt: 1_752_904_500,
};

/** Variante de chuva — cenário alternativo para hooks/componentes. */
export const currentWeatherRainModel: CurrentWeather = {
  ...currentWeatherModel,
  wind: { speedKmh: 25.2, degree: 220 },
  visibilityKm: 4.5,
  condition: { id: 501, main: 'Rain', description: 'Chuva leve' },
};

/**
 * Variante com `precipitationPct` preenchido — sintética (o endpoint do clima
 * atual não expõe `pop`, anexo-11 item 4) e usada apenas para exercitar o tile
 * condicional de precipitação na fase 06 §2.
 */
export const currentWeatherWithPrecipModel: CurrentWeather = {
  ...currentWeatherModel,
  precipitationPct: 80,
  condition: { id: 501, main: 'Rain', description: 'Chuva leve' },
};

// --- Previsão por horário e por dia ---------------------------------------

/**
 * Blocos de 3h de 2 dias (4 blocos) — referência para `use-weather` derivar
 * `daily` via `groupHourlyByDay`.
 */
export const hourlyForecastModel: HourlyForecast[] = [
  {
    time: DAY1_1000,
    temperatureC: 22,
    feelsLikeC: 22,
    humidityPct: 60,
    precipitationPct: 10,
    windSpeedKmh: 14,
    condition: 'Sun',
  },
  {
    time: DAY1_1300,
    temperatureC: 30,
    feelsLikeC: 31,
    humidityPct: 40,
    precipitationPct: 30,
    windSpeedKmh: 8,
    condition: 'Rain',
  },
  {
    time: DAY2_1000,
    temperatureC: 15,
    feelsLikeC: 14,
    humidityPct: 80,
    precipitationPct: 0,
    windSpeedKmh: 5,
    condition: 'Fog',
  },
  {
    time: DAY2_1300,
    temperatureC: 21,
    feelsLikeC: 22,
    humidityPct: 70,
    precipitationPct: 0,
    windSpeedKmh: 15,
    condition: 'Clear',
  },
];

/**
 * Previsão diária agregada — deve ser idêntica ao resultado de
 * `groupHourlyByDay(hourlyForecastModel)` (média por grupo; `minC`/`maxC` por
 * extremo; `condition` do bloco mais próximo do meio-dia UTC).
 */
export const dailyForecastModel: DailyForecast[] = [
  {
    date: DAY1_START,
    minC: 22,
    maxC: 30,
    humidityPct: 50,
    precipitationPct: 20,
    windSpeedKmh: 11,
    condition: 'Rain',
  },
  {
    date: DAY2_START,
    minC: 15,
    maxC: 21,
    humidityPct: 75,
    precipitationPct: 0,
    windSpeedKmh: 10,
    condition: 'Clear',
  },
];
