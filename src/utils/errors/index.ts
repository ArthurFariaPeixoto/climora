/**
 * Taxonomia de erros da aplicação (ADR-07, §9).
 *
 * União discriminada. Os erros são produzidos na origem (`services/http`,
 * `services/adapters`) e propagados tipados até a UI, que responde por tipo.
 *
 * A apresentação usa `getErrorMessage` (mapa erro → mensagem amigável). O
 * ícone por tipo fica a cargo de `ErrorState` (fase 08) — `utils/` é camada
 * pura sem dependência de UI (§5.6; anexo-11 item 11/13).
 */

export interface InvalidSearchError {
  kind: 'invalid-search';
  message: string;
}

export interface NetworkError {
  kind: 'network';
  message: string;
}

export interface TimeoutError {
  kind: 'timeout';
  message: string;
}

export interface NotFoundError {
  kind: 'not-found';
  message: string;
}

export interface UnauthorizedError {
  kind: 'unauthorized';
  message: string;
}

export interface ServerError {
  kind: 'server';
  message: string;
}

export interface InvalidDataError {
  kind: 'invalid-data';
  message: string;
}

export type AppError =
  | InvalidSearchError
  | NetworkError
  | TimeoutError
  | NotFoundError
  | UnauthorizedError
  | ServerError
  | InvalidDataError;

/**
 * Mapa erro → mensagem amigável (arquitetura §9.2, §9).
 *
 * Função pura. Para `invalid-search` a origem (`utils/validation`) já produz
 * mensagem específica e apresentável (ex.: tamanho mínimo), então o `message`
 * do erro é propagado. Para os demais tipos, usa-se uma mensagem canônica
 * fixa, garantindo que detalhes crus da origem (ex.: mensagens do axios/API)
 * nunca cheguem à UI.
 */
export function getErrorMessage(error: AppError): string {
  switch (error.kind) {
    case 'invalid-search':
      return error.message;
    case 'network':
      return 'Sem conexão com a internet.';
    case 'timeout':
      return 'A conexão está lenta. Tente novamente.';
    case 'not-found':
      return 'Cidade não encontrada.';
    case 'unauthorized':
      return 'Configuração inválida: verifique a chave de API.';
    case 'server':
      return 'Serviço indisponível, tente novamente.';
    case 'invalid-data':
      return 'Dados incompletos. Tente novamente mais tarde.';
  }
}
