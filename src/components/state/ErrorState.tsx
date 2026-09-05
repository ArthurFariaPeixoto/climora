import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Estado de interface para erro.
 *
 * Consome a taxonomia de erros (`utils/errors`) já traduzida em mensagem
 * amigável e oferece ação de "tentar novamente" quando aplicável.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4">
      <p className="text-neutral-600">{message}</p>
      {onRetry ? <Button onClick={onRetry}>Tentar novamente</Button> : null}
    </div>
  );
}
