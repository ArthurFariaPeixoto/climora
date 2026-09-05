/**
 * Taxonomia de erros da aplicação (ADR-07, §9).
 *
 * União discriminada. Os erros são produzidos na origem (`services/http`,
 * `services/adapters`) e propagados tipados até a UI, que responde por tipo.
 *
 * TODO: completar a taxonomia e o mapa erro → mensagem/ícone quando o
 * tratamento de erros for implementado.
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
