import { describe, expect, it } from 'vitest';

import { getErrorMessage } from '@/utils/errors';
import type { AppError } from '@/utils/errors';

function makeError(kind: AppError['kind'], message = 'mensagem técnica'): AppError {
  return { kind, message };
}

describe('getErrorMessage', () => {
  it('propaga a mensagem específica da validação para invalid-search', () => {
    const error = makeError('invalid-search', 'Digite pelo menos 3 caracteres.');
    expect(getErrorMessage(error)).toBe('Digite pelo menos 3 caracteres.');
  });

  it('retorna mensagem de falta de conexão para network', () => {
    expect(getErrorMessage(makeError('network'))).toBe('Sem conexão com a internet.');
  });

  it('retorna mensagem de lentidão para timeout', () => {
    expect(getErrorMessage(makeError('timeout'))).toBe(
      'A conexão está lenta. Tente novamente.'
    );
  });

  it('retorna mensagem de cidade não encontrada para not-found', () => {
    expect(getErrorMessage(makeError('not-found'))).toBe('Cidade não encontrada.');
  });

  it('retorna mensagem de configuração para unauthorized', () => {
    expect(getErrorMessage(makeError('unauthorized'))).toBe(
      'Configuração inválida: verifique a chave de API.'
    );
  });

  it('retorna mensagem de indisponibilidade para server', () => {
    expect(getErrorMessage(makeError('server'))).toBe(
      'Serviço indisponível, tente novamente.'
    );
  });

  it('retorna mensagem de dados incompletos para invalid-data', () => {
    expect(getErrorMessage(makeError('invalid-data'))).toBe(
      'Dados incompletos. Tente novamente mais tarde.'
    );
  });

  it('nunca vaza a mensagem técnica da origem para a UI', () => {
    for (const kind of [
      'network',
      'timeout',
      'not-found',
      'unauthorized',
      'server',
      'invalid-data',
    ] as const) {
      expect(getErrorMessage(makeError(kind))).not.toContain('mensagem técnica');
    }
  });

  it('retorna mensagem não vazia para todos os tipos da taxonomia', () => {
    for (const kind of [
      'invalid-search',
      'network',
      'timeout',
      'not-found',
      'unauthorized',
      'server',
      'invalid-data',
    ] as const) {
      expect(getErrorMessage(makeError(kind, kind))).not.toBe('');
    }
  });
});