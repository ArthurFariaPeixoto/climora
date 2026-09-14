import type { CurrentWeather } from '@/models/CurrentWeather';
import type { HourlyForecast } from '@/models/HourlyForecast';
import type {
  CurrentWeatherDto,
  ForecastBlockDto,
  WeatherConditionDto,
  WindDto,
} from '@/services/dtos';
import type { InvalidDataError } from '@/utils/errors';

/**
 * Adaptadores — funções puras DTO → modelo (ADR-03).
 *
 * Conversões de unidade (a API entrega `metric`): visibilidade em metros →
 * km, vento em m/s → km/h, `pop` 0–1 → %. Dados corrompidos/incompletos
 * lançam `InvalidDataError` (arquitetura §9) — não há fallback.
 */

export function mapCurrentWeatherDtoToModel(
  dto: CurrentWeatherDto,
): CurrentWeather {
  const main = requireObject(dto.main, 'main');
  const wind = requireObject(dto.wind, 'wind');
  const condition = requireNonEmptyWeather(dto.weather);

  return {
    temperatureC: requireFinite(main.temp, 'main.temp'),
    feelsLikeC: requireFinite(main.feels_like, 'main.feels_like'),
    minC: requireFinite(main.temp_min, 'main.temp_min'),
    maxC: requireFinite(main.temp_max, 'main.temp_max'),
    humidityPct: requireFinite(main.humidity, 'main.humidity'),
    pressureHpa: requireFinite(main.pressure, 'main.pressure'),
    visibilityKm: requireFinite(dto.visibility, 'visibility') / 1000,
    // O endpoint `/data/2.5/weather` não expõe `pop` — o campo fica omitido
    // (anexo-11 item 4); a UI esconde a métrica quando ausente (fase 06).
    wind: mapWind(wind),
    condition: {
      id: requireFinite(condition.id, 'weather[0].id'),
      main: requireText(condition.main, 'weather[0].main'),
      description: requireText(condition.description, 'weather[0].description'),
    },
    observedAt: requireFinite(dto.dt, 'dt'),
  };
}

export function mapForecastBlockDtoToHourlyModel(
  dto: ForecastBlockDto,
): HourlyForecast {
  const main = requireObject(dto.main, 'main');
  const wind = requireObject(dto.wind, 'wind');
  const condition = requireNonEmptyWeather(dto.weather);

  return {
    time: requireFinite(dto.dt, 'dt'),
    temperatureC: requireFinite(main.temp, 'main.temp'),
    feelsLikeC: requireFinite(main.feels_like, 'main.feels_like'),
    humidityPct: requireFinite(main.humidity, 'main.humidity'),
    precipitationPct: requireFinite(dto.pop, 'pop') * 100,
    windSpeedKmh: requireFinite(wind.speed, 'wind.speed') * 3.6,
    condition: requireText(condition.description, 'weather[0].description'),
  };
}

function mapWind(wind: WindDto): CurrentWeather['wind'] {
  return {
    speedKmh: requireFinite(wind.speed, 'wind.speed') * 3.6,
    degree: requireFinite(wind.deg, 'wind.deg'),
  };
}

function requireNonEmptyWeather(
  weather: WeatherConditionDto[],
): WeatherConditionDto {
  if (!Array.isArray(weather) || weather.length === 0) {
    throw invalidDataError('Resposta sem condição meteorológica.');
  }
  return weather[0];
}

function requireObject<T>(value: T, field: string): T {
  if (typeof value !== 'object' || value === null) {
    throw invalidDataError(`Campo "${field}" ausente em resposta da API.`);
  }
  return value;
}

function requireText(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw invalidDataError(`Campo "${field}" inválido em resposta da API.`);
  }
  return value;
}

function requireFinite(value: number, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw invalidDataError(`Campo "${field}" inválido em resposta da API.`);
  }
  return value;
}

function invalidDataError(message: string): InvalidDataError {
  return { kind: 'invalid-data', message };
}
