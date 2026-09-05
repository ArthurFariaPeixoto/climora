/**
 * Classificador de erros de transporte (stack §9).
 *
 * Converte um `AxiosError` na taxonomia de `utils/errors`, em um função pura
 * testável isoladamente.
 *
 * TODO: implementar a classificação (rede/timeout/cancelamento + status
 * 401/404/429/5xx → `AppError`) quando o tratamento de erros for desenvolvido.
 */
export function classifyHttpError(error: unknown) {
  return error;
}
