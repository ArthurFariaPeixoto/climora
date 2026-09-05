/**
 * Previsão diária agregada (modelo interno).
 *
 * O plano gratuito da OpenWeather não fornece "daily" nativo; esta previsão é
 * derivada agrupando os blocos de 3h por dia em `utils/selectors`.
 */
export interface DailyForecast {
  /** Timestamp unix (UTC) do início do dia. */
  date: number;
  minC: number;
  maxC: number;
  humidityPct: number;
  precipitationPct: number;
  windSpeedKmh: number;
  condition: string;
}
