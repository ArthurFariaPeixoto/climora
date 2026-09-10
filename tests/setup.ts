import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from '@/mocks/server';

// RTL só registra cleanup automático quando existe `afterEach` global
// (Vitest com `globals: false`), então limpamos o DOM explicitamente.
afterEach(() => cleanup());

// Recharts (ResponsiveContainer) requer ResizeObserver no ambiente de teste.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

// MSW: simula a rede nos testes (nenhuma chamada à API real).
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
