import {
  Cloud,
  Clock,
  KeyRound,
  MapPinOff,
  SearchX,
  TriangleAlert,
  WifiOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import {
  getErrorMessage,
  isRetryableAppError,
  type AppError,
} from '@/utils/errors';

interface ErrorStateProps {
  /** Erro da taxonomia (ADR-07, anexo-11 item 13) — ícone e mensagem derivados do `kind`. */
  error: AppError;
  /** Ação "tentar novamente". O botão só aparece para erros transitórios. */
  onRetry?: () => void;
}

/**
 * Mapa erro → ícone (fase 08 §2; anexo-11 item 13 — decidido/diferido da fase 01).
 *
 * `utils/` é camada pura sem dependência de UI (§5.6), então o mapa vive no
 * componente `ErrorState`, lendo a taxa por `kind`.
 */
const ERROR_ICON: Record<AppError['kind'], LucideIcon> = {
  'invalid-search': SearchX,
  network: WifiOff,
  timeout: Clock,
  'not-found': MapPinOff,
  unauthorized: KeyRound,
  server: Cloud,
  'invalid-data': TriangleAlert,
};

/**
 * Estado de interface para erro (fase 08 §2).
 *
 * Recebe o erro taxonômico e deriva apresentação via `getErrorMessage`
 * (mensagem amigável canônica) e `isRetryableAppError` (retry só para falhas
 * transitórias) — regra única, sem duplicação nos consumidores.
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const Icon = ERROR_ICON[error.kind];
  const canRetry = onRetry !== undefined && isRetryableAppError(error);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-6 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger shadow-2xs">
        <Icon className="h-6 w-6 text-danger" aria-hidden="true" />
      </div>
      <p className="max-w-md text-sm font-medium text-ink-muted">
        {getErrorMessage(error)}
      </p>
      {canRetry ? (
        <Button
          variant="secondary"
          onClick={onRetry}
          className="mt-1 font-semibold shadow-xs"
        >
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
