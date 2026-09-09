import type {
  CurrentWeatherDto,
  ForecastBlockDto,
  ForecastDto,
  GeocodingLocationDto,
} from '@/services/dtos';

/**
 * Fixtures de DTOs — espelham a resposta da OpenWeather (fase 04 §1).
 *
 * Dados de exemplo por estado de sucesso e por cenário de erro/corrupção.
 * Usados pelos handlers MSW (§2) e pelos testes de adapters/repositories.
 * Timestamps em unix UTC (nunca hora local — convenção do AGENTS.md).
 */

const THREE_HOURS_SECONDS = 3 * 3600;
const BLOCKS_PER_DAY = 8;
const FULL_FORECAST_BLOCKS = 40;

/** Início da previsão: 2026-01-05 00:00 UTC. */
const FORECAST_START_UTC = Math.floor(Date.UTC(2026, 0, 5) / 1000);

// --- Geocodificação -------------------------------------------------------

/** Cidade completa: com `state` e `local_names`. */
export const saoPauloGeoDto: GeocodingLocationDto = {
  name: 'São Paulo',
  local_names: { pt: 'São Paulo', en: 'São Paulo' },
  lat: -23.55,
  lon: -46.63,
  country: 'BR',
  state: 'SP',
};

/** Cidade com `local_names`, sem `state`. */
export const rioGeoDto: GeocodingLocationDto = {
  name: 'Rio de Janeiro',
  local_names: { pt: 'Rio de Janeiro', es: 'Río de Janeiro' },
  lat: -22.9,
  lon: -43.17,
  country: 'BR',
};

/** Cidade com `state`, sem `local_names`. */
export const beloHorizonteGeoDto: GeocodingLocationDto = {
  name: 'Belo Horizonte',
  lat: -19.91,
  lon: -43.94,
  country: 'BR',
  state: 'MG',
};

/** Cidade sem `state` e sem `local_names` (resultado internacional). */
export const lisboaGeoDto: GeocodingLocationDto = {
  name: 'Lisboa',
  lat: 38.72,
  lon: -9.14,
  country: 'PT',
};

/** Resposta multi-cidade do `/geo/1.0/direct` (limites `limit=5`). */
export const citySearchResultsDto: GeocodingLocationDto[] = [
  saoPauloGeoDto,
  rioGeoDto,
  beloHorizonteGeoDto,
  lisboaGeoDto,
];

// --- Clima atual ----------------------------------------------------------

/** Payload válido completo de `/data/2.5/weather` (sem `pop`). */
export const currentWeatherDto: CurrentWeatherDto = {
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

/** Variante de chuva — útil para cenários de condição nos handlers/UI. */
export const currentWeatherRainDto: CurrentWeatherDto = {
  ...currentWeatherDto,
  weather: [{ id: 501, main: 'Rain', description: 'Chuva leve', icon: '10d' }],
  wind: { speed: 7, deg: 220 },
  visibility: 4_500,
};

// --- Previsão 5 dias / 3 horas --------------------------------------------
//
// Cada dia tem 8 blocos (00h, 03h, ..., 21h UTC). Os templates por horário
// produzem uma curva de temperatura realista; dias ímpares são de chuva para
// variar a `condition` entre os dias.

type BlockSpec = Omit<ForecastBlockDto, 'dt' | 'weather'>;

const SLOT_SPECS: readonly BlockSpec[] = [
  {
    main: {
      temp: 22.3,
      feels_like: 21.8,
      temp_min: 19.1,
      temp_max: 24.7,
      pressure: 1013,
      humidity: 65,
    },
    wind: { speed: 10, deg: 90 },
    pop: 0.5,
  },
  {
    main: {
      temp: 18.5,
      feels_like: 18.1,
      temp_min: 17.2,
      temp_max: 23.1,
      pressure: 1012,
      humidity: 72,
    },
    wind: { speed: 3, deg: 110 },
    pop: 0.2,
  },
  {
    main: {
      temp: 16.4,
      feels_like: 16.0,
      temp_min: 15.8,
      temp_max: 21.9,
      pressure: 1014,
      humidity: 80,
    },
    wind: { speed: 2, deg: 140 },
    pop: 0.1,
  },
  {
    main: {
      temp: 21.7,
      feels_like: 21.4,
      temp_min: 19.0,
      temp_max: 26.4,
      pressure: 1013,
      humidity: 62,
    },
    wind: { speed: 4, deg: 35 },
    pop: 0.15,
  },
  {
    main: {
      temp: 26.9,
      feels_like: 27.5,
      temp_min: 24.1,
      temp_max: 30.2,
      pressure: 1011,
      humidity: 48,
    },
    wind: { speed: 6, deg: 205 },
    pop: 0.3,
  },
  {
    main: {
      temp: 30.1,
      feels_like: 31.0,
      temp_min: 27.6,
      temp_max: 31.4,
      pressure: 1009,
      humidity: 41,
    },
    wind: { speed: 7, deg: 250 },
    pop: 0.4,
  },
  {
    main: {
      temp: 28.4,
      feels_like: 29.2,
      temp_min: 25.8,
      temp_max: 30.1,
      pressure: 1010,
      humidity: 45,
    },
    wind: { speed: 5, deg: 230 },
    pop: 0.35,
  },
  {
    main: {
      temp: 24.2,
      feels_like: 24.0,
      temp_min: 22.4,
      temp_max: 27.0,
      pressure: 1012,
      humidity: 55,
    },
    wind: { speed: 4, deg: 190 },
    pop: 0.25,
  },
];

const CLEAR_WEATHER: ForecastBlockDto['weather'] = [
  { id: 800, main: 'Clear', description: 'Céu limpo', icon: '01d' },
];
const RAIN_WEATHER: ForecastBlockDto['weather'] = [
  { id: 501, main: 'Rain', description: 'Chuva leve', icon: '10d' },
];

/**
 * Constrói o bloco de 3 horas de índice `index` da previsão (determinístico).
 *
 * Dias pares → condição `Clear`, dias ímpares → `Rain` (temperaturas mais
 * baixas e `pop` maior). O bloco 0 coincide com `forecastBlockDto` e é o que
 * os testes de adapter usam como referência.
 */
export function buildForecastBlock(index: number): ForecastBlockDto {
  const dayIndex = Math.floor(index / BLOCKS_PER_DAY);
  const slot = index % BLOCKS_PER_DAY;
  const isRainDay = dayIndex % 2 === 1;
  const spec = SLOT_SPECS[slot];

  const main = isRainDay
    ? {
        ...spec.main,
        temp: spec.main.temp - 6,
        feels_like: spec.main.feels_like - 6,
        temp_min: spec.main.temp_min - 6,
        temp_max: spec.main.temp_max - 6,
      }
    : spec.main;

  return {
    dt: FORECAST_START_UTC + index * THREE_HOURS_SECONDS,
    main,
    weather: isRainDay ? RAIN_WEATHER : CLEAR_WEATHER,
    wind: spec.wind,
    pop: isRainDay ? Math.min(0.9, spec.pop + 0.4) : spec.pop,
  };
}

/**
 * Constrói uma resposta de previsão com `count` blocos de 3h.
 *
 * Default de 40 blocos = 5 dias completos (8 blocos/dia) — quantidade
 * suficiente para `groupHourlyByDay` agrupar ≥ 2 dias.
 */
export function buildForecastDto(count = FULL_FORECAST_BLOCKS): ForecastDto {
  return {
    list: Array.from({ length: count }, (_, index) =>
      buildForecastBlock(index),
    ),
  };
}

/** Previsão completa (40 blocos / 5 dias) para os handlers e testes de rede. */
export const forecastDto: ForecastDto = buildForecastDto();

/** Bloco único válido (índice 0) — referência dos testes de adapter. */
export const forecastBlockDto: ForecastBlockDto = buildForecastBlock(0);

// --- Payloads corrompidos (para os adapters) ------------------------------

/** Geocodificação sem `name` (campo ausente). */
export const geocodingMissingNameDto = {
  lat: -23.55,
  lon: -46.63,
  country: 'BR',
  state: 'SP',
} as unknown as GeocodingLocationDto;

/** Geocodificação com `lat` não finita. */
export const geocodingNonFiniteLatDto = {
  ...saoPauloGeoDto,
  lat: Number.NaN,
} as unknown as GeocodingLocationDto;

/** Geocodificação com `country` em branco. */
export const geocodingBlankCountryDto = {
  ...saoPauloGeoDto,
  country: '   ',
} as unknown as GeocodingLocationDto;

/** Clima atual com `main` nulo. */
export const currentWeatherMissingMainDto = {
  ...currentWeatherDto,
  main: null,
} as unknown as CurrentWeatherDto;

/** Clima atual sem condição meteorológica (`weather: []`). */
export const currentWeatherEmptyWeatherDto = {
  ...currentWeatherDto,
  weather: [],
} as unknown as CurrentWeatherDto;

/** Clima atual com `wind` ausente. */
export const currentWeatherMissingWindDto = {
  ...currentWeatherDto,
  wind: undefined,
} as unknown as CurrentWeatherDto;

/** Clima atual com temperatura não finita. */
export const currentWeatherInfiniteTempDto = {
  ...currentWeatherDto,
  main: { ...currentWeatherDto.main, temp: Number.POSITIVE_INFINITY },
} as unknown as CurrentWeatherDto;

/** Bloco de previsão com `pop` nulo. */
export const forecastBlockMissingPopDto = {
  ...forecastBlockDto,
  pop: null,
} as unknown as ForecastBlockDto;

/** Bloco de previsão sem condição meteorológica. */
export const forecastBlockEmptyWeatherDto = {
  ...forecastBlockDto,
  weather: [],
} as unknown as ForecastBlockDto;

/** Bloco de previsão com `main` nulo. */
export const forecastBlockNullMainDto = {
  ...forecastBlockDto,
  main: null,
} as unknown as ForecastBlockDto;

/** Bloco de previsão com `wind.speed` não finita. */
export const forecastBlockNonFiniteWindSpeedDto = {
  ...forecastBlockDto,
  wind: { speed: Number.NaN, deg: 90 },
} as unknown as ForecastBlockDto;
