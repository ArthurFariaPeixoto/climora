import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { DefaultOptions } from '@tanstack/react-query';
import type { ReactNode } from 'react';

/**
 * Camada de data-fetching de teste (arquitetura §5.7, §11.2).
 *
 * Provedor controlado em memória para induzir estados em hooks/componentes de
 * feature — usa apenas em testes, nunca em produção. As queries de feature
 * definem `staleTime` próprio; aqui o `QueryClient` é isolado por teste com
 * `retry: false` (erros propositais não reexecutam) e `gcTime: 0` (nenhuma
 * interferência de cache entre testes) — fase 04 §3.
 */

/**
 * `QueryClient` isolado para testes.
 *
 * Defaults que garantem isolação (§3 item 3):
 * - `retry: false` — um `AppError` proposital não dispara reexecuções (os
 *   testes de query que quiserem exercitar retry passam override);
 * - `gcTime: 0` — dados desmontados são recolhidos na hora, sem vazamento
 *   entre testes;
 * - o `staleTime` default (`0`) não sobrescreve o das queries de feature
 *   (elas o definem no `useQuery`), mas garante que remontagens no mesmo
 *   teste refetcham em vez de usar cache.
 */
export function createTestQueryClient(
  defaultOptions: DefaultOptions = {},
): QueryClient {
  return new QueryClient({
    defaultOptions: {
      ...defaultOptions,
      queries: {
        retry: false,
        gcTime: 0,
        ...defaultOptions.queries,
      },
    },
  });
}

/**
 * Componente `QueryClientProvider` pronto para `renderHook({ wrapper })`.
 */
export function createQueryClientWrapper(client: QueryClient) {
  return function QueryClientWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}
