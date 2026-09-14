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
    <div className="relative flex flex-col justify-between rounded-xl border border-line/70 bg-canvas/70 p-3.5 transition-colors hover:border-line hover:bg-canvas">
      {Icon ? (
        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-surface shadow-2xs">
          <Icon
            className={
              isHighlight
                ? 'h-3.5 w-3.5 text-accent'
                : 'h-3.5 w-3.5 text-ink-muted'
            }
            aria-hidden="true"
          />
        </div>
      ) : null}
      <span className="text-xs font-semibold tracking-wider text-ink-muted uppercase">
        {label}
      </span>
      <span
        className={
          isHighlight
            ? 'mt-3 text-2xl font-bold text-accent'
            : 'mt-3 text-lg font-semibold text-ink'
        }
      >
        {value}
      </span>
    </div>
  );
}
