import { setupServer } from 'msw/node';

import { handlers } from '@/mocks/handlers';

/**
 * Server MSW em nível de rede (Node adapter).
 *
 * Intercepta o transporte nos testes (`services/http` e `repositories`);
 * iniciado/resetado/encerrado em `tests/setup.ts`.
 */
export const server = setupServer(...handlers);
