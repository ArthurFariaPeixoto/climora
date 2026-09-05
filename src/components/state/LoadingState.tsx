import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Estado de interface para carregamento.
 *
 * TODO: compor a partir de `Skeleton` conforme o design final.
 */
export function LoadingState() {
  return (
    <div data-testid="loading-state" className="flex flex-col gap-2">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
