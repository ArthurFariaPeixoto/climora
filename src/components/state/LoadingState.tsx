import { Skeleton } from '@/components/ui/Skeleton';

interface LoadingStateProps {
  /** Rótulo lido por leitores de tela (região `role="status"`). */
  label?: string;
}

/**
 * Estado de interface para carregamento (fase 08 §2).
 *
 * Compõe `Skeleton`s no layout dos widgets do dashboard — card do clima,
 * grade de métricas, linha de previsões e bloco do gráfico — com alturas
 * coerentes e grade fluida (ADR-08), centralizando a região de status
 * acessível (`role="status"` + `aria-label`).
 */
export function LoadingState({
  label = 'Carregando dados',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label={label}
      data-testid="loading-state"
      className="flex flex-col gap-4"
    >
      <Skeleton className="h-28 w-full rounded-card" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
