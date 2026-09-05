/**
 * Bloco de previsão por horário (modelo interno).
 *
 * Derivado dos blocos de 3 horas retornados pela OpenWeather.
 */
export interface HourlyForecast {
  /** Timestamp unix (UTC) do início do bloco. */
  time: number;
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  precipitationPct: number;
  windSpeedKmh: number;
  condition: string;
}
