interface SkeletonProps {
  className?: string;
}

/**
 * Esqueleto de carregamento (fase 08 §1).
 *
 * Placeholder visual usado pelos estados de loading antes de os dados reais
 * chegarem. Dimensões/estilização via tokens (`bg-skeleton`); recebe apenas
 * classes de dimensão do consumidor (`LoadingState`).
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-skeleton ${className ?? ''}`}
    />
  );
}