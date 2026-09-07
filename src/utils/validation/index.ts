import type { InvalidSearchError } from '@/utils/errors';

export type ValidationResult =
  { valid: true } | { valid: false; reason: InvalidSearchError };

const LATIN_SEARCH = /^(?=.*\p{Script=Latin})[\p{Script=Latin} -]+$/u;

/**
 * Valida o termo de busca de cidades (função pura — §5.6).
 *
 * Regras:
 * - vazio/branco → erro;
 * - menos de 3 caracteres → erro;
 * - caracteres além de letras do alfabeto latino/romano, espaços ou hífens → erro.
 *
 * O termo é normalizado para NFC antes da validação (reconstrói acentos
 * decompostos: "Sa\u0303o" → "São") e exige ao menos uma letra latina.
 */
export function validateSearchTerm(term: string): ValidationResult {
  const trimmed = term.normalize('NFC').trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      reason: {
        kind: 'invalid-search',
        message: 'Informe o nome de uma cidade.',
      },
    };
  }

  if (trimmed.length < 3) {
    return {
      valid: false,
      reason: {
        kind: 'invalid-search',
        message: 'Digite pelo menos 3 caracteres.',
      },
    };
  }

  if (!LATIN_SEARCH.test(trimmed)) {
    return {
      valid: false,
      reason: {
        kind: 'invalid-search',
        message: 'Use apenas letras, espaços e hífens.',
      },
    };
  }

  return { valid: true };
}
