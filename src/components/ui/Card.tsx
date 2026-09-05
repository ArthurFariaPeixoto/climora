import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

/**
 * Contêiner visual reutilizável.
 *
 * Componente puro, sem estado externo. Usado por widgets de clima, métricas
 * e blocos de gráfico.
 */
export function Card({ children }: CardProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      {children}
    </section>
  );
}
