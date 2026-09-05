import type { LucideIcon } from 'lucide-react';

interface MetricTileProps {
  /** Rótulo curto da métrica (ex.: "Umidade"). */
  label: string;
  /** Valor formatado e pronto para exibição. */
  value: string;
  /** Ícone ilustrativo da métrica. */
  icon?: LucideIcon;
}

/**
 * Azulejo de métrica exibido no dashboard.
 *
 * Recebe apenas dados já formatados (estado derivado em `utils/format`),
 * mantendo a apresentação pura.
 */
export function MetricTile({ label, value, icon: Icon }: MetricTileProps) {
  return (
    <div className="flex flex-col gap-1">
      {Icon ? (
        <Icon className="h-4 w-4 text-neutral-500" aria-hidden="true" />
      ) : null}
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
