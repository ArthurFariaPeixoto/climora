import type { HttpHandler } from 'msw';

/**
 * Handlers MSW dos endpoints da OpenWeather.
 *
 * Usados apenas em testes. Os handlers reais (geocodificação, clima atual,
 * previsão) serão adicionados junto das fixtures quando a integração for
 * implementada — `tests/setup.ts` já inicia/reseta o server.
 */
export const handlers: HttpHandler[] = [];
