import type { DailyForecast } from '@/models/DailyForecast';
import type { HourlyForecast } from '@/models/HourlyForecast';

/**
 * Selectors — funções puras de derivação para exibição.
 *
 * TODO: implementar o agrupamento dos blocos de 3h por dia (fonte do
 * `DailyForecast`) e outras derivações quando o dashboard for desenvolvido.
 */
export function groupHourlyByDay(_hourly: HourlyForecast[]): DailyForecast[] {
  throw new Error('Not implemented');
}
