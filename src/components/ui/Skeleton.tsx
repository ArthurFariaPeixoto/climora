interface SkeletonProps {
  className?: string;
}

/**
 * Esqueleto de carregamento.
 *
 * Placeholder visual usado pelos estados de loading antes de os dados reais
 * chegarem. Recebe apenas classes de dimensão/estilo.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-neutral-200 ${className ?? ''}`}
    />
  );
}
