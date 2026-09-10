import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { App } from '@/app/App';

import './index.css';

/**
 * Defaults globais do `QueryClient` (anexo-11 item 5, resolvido na fase 07 §4):
 * - `staleTime: 0` — default conservador: a validade dos dados vem do `staleTime`
 *   definido por consulta (`city-query` ~60s, `weather-query` ~5min); qualquer
 *   query futura sem `staleTime` revalida a data (sem gratuidade de cache).
 * - `retry: 1` — rede de segurança global; as consultas de feature já definem
 *   retry próprio que só reexecuta erros transitórios (máx. 2).
 * - `refetchOnWindowFocus: false` — refetch determinístico: ocorre apenas de
 *   forma explícita (nova busca, troca de cidade, `retry`) e não por foco da
 *   janela (evita reexecuções surpreendentes em dev/banca/avaliação).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
