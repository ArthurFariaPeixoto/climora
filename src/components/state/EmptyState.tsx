interface EmptyStateProps {
  message: string;
}

/**
 * Estado de interface para ausência de dados.
 *
 * Exibido quando uma consulta termina com sucesso, porém sem resultados
 * (busca sem cidades, cidade sem previsão).
 */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div role="status" className="text-neutral-500">
      {message}
    </div>
  );
}
