import type { ReactNode } from 'react';

export type CardVariant = 'default' | 'highlight';
export type CardPadding = 'default' | 'none';

interface CardProps {
  children: ReactNode;
  /** `highlight` dá destaque ao card principal (fase 08 §1). */
  variant?: CardVariant;
  /** `none` remove o padding interno (conteúdo edge-to-edge). */
  padding?: CardPadding;
  className?: string;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'border-line bg-surface shadow-card',
  highlight: 'border-accent-line bg-accent-soft shadow-card',
};

/**
 * Contêiner visual reutilizável (fase 08 §1).
 *
 * Componente puro, sem estado externo. Usado por widgets de clima, métricas
 * e blocos de gráfico; consumo de tokens via `@theme` (radius/sombra/cores).
 */
export function Card({
  children,
  variant = 'default',
  padding = 'default',
  className,
}: CardProps) {
  return (
    <section
      className={`rounded-card border ${VARIANT_CLASSES[variant]} ${padding === 'default' ? 'p-4' : ''} ${className ?? ''}`}
    >
      {children}
    </section>
  );
}
