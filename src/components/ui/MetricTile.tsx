import type { LucideIcon } from 'lucide-react';

export type MetricTileVariant = 'default' | 'highlight';

interface MetricTileProps {
  /** Rótulo curto da métrica (ex.: "Umidade"). */
  label: string;
  /** Valor formatado e pronto para exibição. */
  value: string;
  /** Ícone ilustrativo da métrica. */
  icon?: LucideIcon;
  /** `highlight` dá destaque à métrica principal (fase 08 §1). */
  variant?: MetricTileVariant;
}

/**
 * Azulejo de métrica exibido no dashboard (fase 08 §1).
 *
 * Recebe apenas dados já formatados (estado derivado em `utils/format`),
 * mantendo a apresentação pura. Espaçamento/tipografia consumidos via tokens.
 */
export function MetricTile({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: MetricTileProps) {
  const isHighlight = variant === 'highlight';

  return (
    <div className="flex flex-col gap-1">
      {Icon ? (
        <Icon
          className={
            isHighlight ? 'h-4 w-4 text-accent' : 'h-4 w-4 text-ink-soft'
          }
          aria-hidden="true"
        />
      ) : null}
      <span className="text-sm text-ink-muted">{label}</span>
      <span
        className={
          isHighlight
            ? 'text-2xl font-bold text-accent'
            : 'text-lg font-semibold text-ink'
        }
      >
        {value}
      </span>
    </div>
  );
}
