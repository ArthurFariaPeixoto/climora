/**
 * Condição meteorológica descritiva (ex.: "Céu limpo", "Chuva leve").
 */
export interface WeatherCondition {
  /** Identificador do grupo da condição retornado pela API. */
  id: number;
  /** Texto curto da condição (já localizado). */
  description: string;
  /** Categoria principal ("Clear", "Clouds", "Rain" etc.). */
  main: string;
}

/**
 * Vento.
 */
export interface Wind {
  speedKmh: number;
  degree: number;
}

/**
 * Clima atual como a aplicação o entende (modelo interno).
 *
 * Valores já normalizados pelos adapters (ex.: unidade métrica). A data/hora
 * de observação é em unix (UTC) e deve ser formatada via `utils/format/dayjs`.
 */
export interface CurrentWeather {
  temperatureC: number;
  feelsLikeC: number;
  minC: number;
  maxC: number;
  humidityPct: number;
  pressureHpa: number;
  visibilityKm: number;
  /**
   * Probabilidade de precipitação (%). Ausente quando o clima atual não a
   * fornece — o endpoint da OpenWeather expõe `pop` apenas na previsão. A UI
   * esconde a métrica quando este campo não está presente (fase 06).
   */
  precipitationPct?: number;
  wind: Wind;
  condition: WeatherCondition;
  /** Timestamp unix (UTC) da observação. */
  observedAt: number;
}
