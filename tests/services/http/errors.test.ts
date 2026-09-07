import { describe, expect, it } from 'vitest';

import { classifyHttpError } from '@/services/http/errors';

/**
 * Mocks de `AxiosError` como objetos simples (duck-typing em `isAxiosError`);
 * a função é pura e testável sem instanciar o axios.
 */
function mockAxiosError(overrides: {
  code?: string;
  response?: { status: number };
} = {}) {
  return { isAxiosError: true, ...overrides };
}

describe('classifyHttpError', () => {
  it('mantém erros não-transporte inalterados (mesma referência)', () => {
    const adapterError = { kind: 'invalid-data', message: 'dados incompletos' };
    expect(classifyHttpError(adapterError)).toBe(adapterError);

    const plain = new Error('algum erro de programação');
    expect(classifyHttpError(plain)).toBe(plain);
  });

  it('classifica timeout via ECONNABORTED como timeout', () => {
    expect(classifyHttpError(mockAxiosError({ code: 'ECONNABORTED' }))).toMatchObject({
      kind: 'timeout',
    });
  });

  it('classifica timeout via ETIMEDOUT como timeout', () => {
    expect(classifyHttpError(mockAxiosError({ code: 'ETIMEDOUT' }))).toMatchObject({
      kind: 'timeout',
    });
  });

  it('classifica falha de rede como network', () => {
    expect(classifyHttpError(mockAxiosError({ code: 'ERR_NETWORK' }))).toMatchObject({
      kind: 'network',
    });
  });

  it('retorna null para cancelamento por abort (ERR_CANCELED)', () => {
    expect(classifyHttpError(mockAxiosError({ code: 'ERR_CANCELED' }))).toBeNull();
  });

  it('classifica 401 como unauthorized (erro de configuração)', () => {
    expect(
      classifyHttpError(mockAxiosError({ code: 'ERR_BAD_RESPONSE', response: { status: 401 } }))
    ).toMatchObject({ kind: 'unauthorized' });
  });

  it('classifica 404 como not-found (cidade inexistente)', () => {
    expect(
      classifyHttpError(mockAxiosError({ code: 'ERR_BAD_REQUEST', response: { status: 404 } }))
    ).toMatchObject({ kind: 'not-found' });
  });

  it('classifica 429 como server (limite de taxa)', () => {
    expect(
      classifyHttpError(mockAxiosError({ code: 'ERR_BAD_RESPONSE', response: { status: 429 } }))
    ).toMatchObject({ kind: 'server' });
  });

  it('classifica 5xx como server', () => {
    for (const status of [500, 502, 503]) {
      expect(
        classifyHttpError(mockAxiosError({ code: 'ERR_BAD_RESPONSE', response: { status } }))
      ).toMatchObject({ kind: 'server' });
    }
  });

  it('usa fallback server para status fora dos casos mapeados (400)', () => {
    expect(
      classifyHttpError(mockAxiosError({ code: 'ERR_BAD_REQUEST', response: { status: 400 } }))
    ).toMatchObject({ kind: 'server' });
  });

  it('usa fallback server para AxiosError sem response', () => {
    expect(classifyHttpError(mockAxiosError({ code: 'ERR_INVALID_URL' }))).toMatchObject({
      kind: 'server',
    });
  });
});