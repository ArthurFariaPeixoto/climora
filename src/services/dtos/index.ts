/**
 * DTOs — espelham a resposta da API externa (OpenWeather).
 *
 * Contratos externos, nomeados por área. Os componentes nunca conhecem estes
 * tipos: a ponte para os `models` é feita em `services/adapters`.
 */

/**
 * Item da resposta de geocodificação
 * (`GET /geo/1.0/direct`).
 */
export interface GeocodingLocationDto {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/**
 * Resposta de clima atual (`GET /data/2.5/weather`).
 */
export interface CurrentWeatherDto {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherConditionDto[];
  wind: WindDto;
  visibility: number;
  pop?: number;
}

/**
 * Resposta de previsão (`GET /data/2.5/forecast`).
 */
export interface ForecastDto {
  list: ForecastBlockDto[];
}

export interface ForecastBlockDto {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherConditionDto[];
  wind: WindDto;
  pop: number;
}

export interface WeatherConditionDto {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WindDto {
  speed: number;
  deg: number;
}
