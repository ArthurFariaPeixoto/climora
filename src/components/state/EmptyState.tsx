import { CloudOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  /** Ícone ilustrativo (default `CloudOff`); configurável por contexto. */
  icon?: LucideIcon;
}

/**
 * Estado de interface para ausência de dados (fase 08 §2).
 *
 * Exibido quando uma consulta termina com sucesso, porém sem resultados
 * (busca sem cidades, cidade sem previsão). Região de status acessível
 * (`role="status"`) com ícone decorativo `aria-hidden`.
 */
export function EmptyState({
  message,
  icon: Icon = CloudOff,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong/80 bg-surface/50 p-8 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-ink-soft shadow-2xs">
        <Icon className="h-6 w-6 text-ink-soft" aria-hidden="true" />
      </div>
      <span className="max-w-sm text-sm font-medium text-ink-muted leading-relaxed">
        {message}
      </span>
    </div>
  );
}
