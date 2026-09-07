/**
 * DTOs — espelham a resposta da API externa (OpenWeather).
 *
 * Contratos externos, nomeados por área. Os componentes nunca conhecem estes
 * tipos: a ponte para os `models` é feita em `services/adapters`.
 *
 * Unidades conforme o parâmetro `units=metric` usado nos endpoints
 * (`services/endpoints`): temperaturas em °C, vento em m/s, visibilidade em
 * metros e pressão em hPa. Revisão da fase 02 (anexo-11 item 4): campos não
 * consumidos pelos adapters/UI não foram adicionados; `pop` (probabilidade de
 * precipitação) existe **somente** nos blocos de previsão, não no clima atual.
 */

/**
 * Item da resposta de geocodificação (`GET /geo/1.0/direct`).
 *
 * `local_names`/`state` são opcionais — só vêm na resposta quando disponíveis.
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
 *
 * Este endpoint não retorna `pop` (probabilidade de precipitação) — por isso o
 * modelo `CurrentWeather.precipitationPct` é opcional (ausente aqui).
 */
export interface CurrentWeatherDto {
  /** Timestamp unix (UTC) do cálculo. */
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
  /** Visibilidade em metros. */
  visibility: number;
}

/**
 * Resposta de previsão 5 dias / 3 horas (`GET /data/2.5/forecast`).
 */
export interface ForecastDto {
  list: ForecastBlockDto[];
}

/**
 * Bloco de 3 horas da previsão — contém `pop` (probabilidade de precipitação,
 * 0 a 1), ao contrário do clima atual. `dt` é a fonte do `time` do modelo.
 */
export interface ForecastBlockDto {
  /** Timestamp unix (UTC) do bloco. */
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
  /** Probabilidade de precipitação (0 a 1; 1 = 100%). */
  pop: number;
}

export interface WeatherConditionDto {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WindDto {
  /** Velocidade em m/s. */
  speed: number;
  /** Direção em graus (meteorológica). */
  deg: number;
}
