import type {
  AppError,
  NetworkError,
  NotFoundError,
  ServerError,
  TimeoutError,
  UnauthorizedError,
} from '@/utils/errors';

/**
 * Classificador de erros de transporte (stack §9).
 *
 * Converte um erro de transporte (Axios) na taxonomia de `utils/errors`
 * (ADR-07), em uma função pura testável isoladamente com mocks.
 *
 * Contrato de retorno:
 * - `AppError` tipado para erros que devem chegar à UI (rede, timeout, status);
 * - `null` para **cancelamento por abort** (`ERR_CANCELED`) — é concorrência
 *   (ADR-06), não um erro de UI; o chamador deve repassar o erro original de
 *   forma silenciosa;
 * - erro **não-transporte** (ex.: `InvalidDataError` lançado pelos adapters) é
 *   mantido inalterado — não é rotulado a partir daqui.
 *
 * As mensagens internas são descritivas em pt-BR; a mensagem apresentada à UI
 * vem de `getErrorMessage` (`utils/errors`) — detalhes crus nunca vazam.
 */
export function classifyHttpError(error: unknown): AppError | null {
  if (!isAxiosErrorLike(error)) {
    // Não-transporte (ex.: erro já tipado dos adapters) → mantém como está;
    // não inventamos um rótulo para o que desconhecemos.
    return error as AppError;
  }

  if (error.code === 'ERR_CANCELED') {
    return null;
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return timeoutError('Tempo de requisição excedido (timeout).');
  }

  if (error.code === 'ERR_NETWORK') {
    return networkError('Falha de rede ao contatar o serviço.');
  }

  switch (error.response?.status) {
    case 401:
      return unauthorizedError('Chave de API inválida ou expirada (401).');
    case 404:
      return notFoundError('Cidade não encontrada (404).');
    case 429:
      return serverError('Limite de requisições excedido (429).');
    default:
      return fallbackServerError(error);
  }
}

interface AxiosErrorLike {
  code?: string;
  response?: { status?: number };
}

function isAxiosErrorLike(error: unknown): error is AxiosErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError?: unknown }).isAxiosError === true
  );
}

/**
 * Fallback tipado: status HTTP fora dos casos mapeados (ex.: 400, 403, 3xx) e
 * `AxiosError` sem `response` → `ServerError` (anomalia do serviço).
 */
function fallbackServerError(_error: AxiosErrorLike): ServerError {
  return serverError('Erro inesperado do serviço de clima.');
}

function timeoutError(message: string): TimeoutError {
  return { kind: 'timeout', message };
}

function networkError(message: string): NetworkError {
  return { kind: 'network', message };
}

function unauthorizedError(message: string): UnauthorizedError {
  return { kind: 'unauthorized', message };
}

function notFoundError(message: string): NotFoundError {
  return { kind: 'not-found', message };
}

function serverError(message: string): ServerError {
  return { kind: 'server', message };
}