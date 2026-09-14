/**
 * Formatadores de exibição (funções puras, testáveis sem mock — §5.6).
 *
 * Entradas são apenas `models` (temperatura em °C, umidade em %, pressão em hPa,
 * velocidade do vento em km/h, graus do vento 0–360 e timestamps unix em UTC).
 * Datas usam obrigatoriamente `dayjsUtc.unix(...)` — nunca hora local do ambiente.
 */
import { dayjsFromUnixSeconds } from '@/utils/format/dayjs';

const TEMPERATURE_UNIT = '°C';
const WIND_SPEED_UNIT = 'km/h';
const HUMIDITY_UNIT = '%';
const PRESSURE_UNIT = 'hPa';
const PRECIPITATION_UNIT = '%';
const VISIBILITY_UNIT = 'km';

const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

/** Converte temperatura em °C para texto de exibição (ex.: "22°C"). */
export function formatTemperature(tempC: number): string {
  return `${Math.round(tempC)}${TEMPERATURE_UNIT}`;
}

/** Converte velocidade do vento (km/h) para texto de exibição (ex.: "12 km/h"). */
export function formatWindSpeed(speedKmh: number): string {
  return `${Math.round(speedKmh)} ${WIND_SPEED_UNIT}`;
}

/**
 * Converte os graus do vento (0–360, horário a partir do norte) na rosa dos
 * ventos de 8 pontos (ex.: 45 → "NE"). Valores fora do intervalo são
 * normalizados para [0, 360).
 */
export function formatWindDirection(degree: number): string {
  const normalized = ((degree % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % COMPASS_POINTS.length;
  return COMPASS_POINTS[index];
}

/** Converte umidade em % para texto de exibição (ex.: "65%"). Clamp defensivo em [0, 100]. */
export function formatHumidity(humidityPct: number): string {
  const clamped = Math.min(100, Math.max(0, humidityPct));
  return `${Math.round(clamped)}${HUMIDITY_UNIT}`;
}

/** Converte pressão em hPa para texto de exibição (ex.: "1013 hPa"). */
export function formatPressure(pressureHpa: number): string {
  return `${Math.round(pressureHpa)} ${PRESSURE_UNIT}`;
}

/**
 * Converte probabilidade de precipitação em % para texto de exibição (ex.:
 * "65%"). Clamp defensivo em [0, 100] (mesma regra de `formatHumidity`).
 */
export function formatPrecipitation(precipitationPct: number): string {
  const clamped = Math.min(100, Math.max(0, precipitationPct));
  return `${Math.round(clamped)}${PRECIPITATION_UNIT}`;
}

/** Converte visibilidade em km para texto de exibição (ex.: "10 km"). */
export function formatVisibility(visibilityKm: number): string {
  return `${Math.round(Math.max(0, visibilityKm))} ${VISIBILITY_UNIT}`;
}

/** Hora curta pt-BR em UTC a partir de timestamp unix (ex.: "14h"). */
export function formatHour(time: number): string {
  return dayjsFromUnixSeconds(time).format('H[h]');
}

/** Dia da semana curto pt-BR em UTC a partir de timestamp unix (ex.: "seg"). */
export function formatWeekday(date: number): string {
  return dayjsFromUnixSeconds(date).format('ddd');
}

/**
 * Data/hora de observação em pt-BR a partir de timestamp unix (ex.:
 * "7 de setembro de 2026 às 14:05").
 */
export function formatObservedAt(observedAt: number): string {
  return dayjsFromUnixSeconds(observedAt).format('LLL');
}
