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
      className="flex flex-col items-center gap-2 p-4 text-center"
    >
      <Icon className="h-8 w-8 text-ink-soft" aria-hidden="true" />
      <span className="text-ink-muted">{message}</span>
    </div>
  );
}
