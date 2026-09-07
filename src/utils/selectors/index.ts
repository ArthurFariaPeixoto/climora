/**
 * Selectors — funções puras de derivação para exibição.
 *
 * Derivações de dados calculados a partir de `models`, sem efeitos colaterais
 * e sem dependência de UI/rede (arquitetura §5.6). Datas usam obrigatoriamente
 * `dayjsFromUnixSeconds` em UTC — nunca hora local do ambiente.
 */
import type { DailyForecast } from '@/models/DailyForecast';
import type { HourlyForecast } from '@/models/HourlyForecast';
import { dayjsFromUnixSeconds } from '@/utils/format/dayjs';

const SECONDS_PER_HOUR = 3600;
const NOON_HOUR = 12;

/**
 * Agrupa os blocos de 3h por dia (UTC) e deriva um `DailyForecast` por grupo.
 *
 * - `date` é o início do dia em UTC;
 * - `minC`/`maxC` derivam de `temperatureC`;
 * - `humidityPct`, `precipitationPct` e `windSpeedKmh` são a média do grupo
 *   (sem arredondamento — a formatação/clamp acontece nos formatadores);
 * - `condition` é a condição do bloco mais próximo do meio-dia UTC.
 *
 * A saída é ordenada por data (crescente). Entrada vazia retorna `[]`.
 */
export function groupHourlyByDay(hourly: HourlyForecast[]): DailyForecast[] {
  if (hourly.length === 0) return [];

  const groups = new Map<number, HourlyForecast[]>();
  for (const block of hourly) {
    const dayStart = dayjsFromUnixSeconds(block.time).startOf('day').unix();
    const group = groups.get(dayStart);
    if (group) {
      group.push(block);
    } else {
      groups.set(dayStart, [block]);
    }
  }

  return Array.from(groups.entries())
    .sort(([dayA], [dayB]) => dayA - dayB)
    .map(([dayStart, blocks]) => deriveDaily(dayStart, blocks));
}

function deriveDaily(dayStart: number, blocks: HourlyForecast[]): DailyForecast {
  const temperatures = blocks.map((block) => block.temperatureC);
  return {
    date: dayStart,
    minC: Math.min(...temperatures),
    maxC: Math.max(...temperatures),
    humidityPct: mean(blocks.map((block) => block.humidityPct)),
    precipitationPct: mean(blocks.map((block) => block.precipitationPct)),
    windSpeedKmh: mean(blocks.map((block) => block.windSpeedKmh)),
    condition: conditionClosestToNoon(dayStart, blocks),
  };
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function conditionClosestToNoon(
  dayStart: number,
  blocks: HourlyForecast[],
): string {
  const noon = dayStart + NOON_HOUR * SECONDS_PER_HOUR;
  return blocks.reduce((closest, block) => {
    const closestDistance = Math.abs(closest.time - noon);
    const blockDistance = Math.abs(block.time - noon);
    return blockDistance < closestDistance ? block : closest;
  }).condition;
}