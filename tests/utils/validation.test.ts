import { describe, expect, it } from 'vitest';

import { validateSearchTerm } from '@/utils/validation';

describe('validateSearchTerm', () => {
  describe('termos válidos', () => {
    it('aceita uma cidade comum', () => {
      expect(validateSearchTerm('São Paulo')).toEqual({ valid: true });
    });

    it('aceita cidade com espaços', () => {
      expect(validateSearchTerm('Belo Horizonte')).toEqual({ valid: true });
    });

    it('aceita cidade com hífen', () => {
      expect(validateSearchTerm('Juiz de Fora')).toEqual({ valid: true });
    });

    it('aceita cidade com 3 caracteres', () => {
      expect(validateSearchTerm('São')).toEqual({ valid: true });
    });

    it('aceita cidade em maiúsculas', () => {
      expect(validateSearchTerm('RIO DE JANEIRO')).toEqual({ valid: true });
    });

    it('aceita cidade com acentos', () => {
      expect(validateSearchTerm('Curitiba')).toEqual({ valid: true });
    });
  });

  describe('termos inválidos', () => {
    it('rejeita string vazia', () => {
      const result = validateSearchTerm('');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason.kind).toBe('invalid-search');
        expect(result.reason.message).toBe('Informe o nome de uma cidade.');
      }
    });

    it('rejeita string com apenas espaços', () => {
      const result = validateSearchTerm('   ');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason.kind).toBe('invalid-search');
        expect(result.reason.message).toBe('Informe o nome de uma cidade.');
      }
    });

    it('rejeita 1 caractere', () => {
      const result = validateSearchTerm('S');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason.kind).toBe('invalid-search');
        expect(result.reason.message).toBe('Digite pelo menos 3 caracteres.');
      }
    });

    it('rejeita 2 caracteres', () => {
      const result = validateSearchTerm('Sp');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason.kind).toBe('invalid-search');
        expect(result.reason.message).toBe('Digite pelo menos 3 caracteres.');
      }
    });

    it('rejeita números', () => {
      const result = validateSearchTerm('123');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason.kind).toBe('invalid-search');
        expect(result.reason.message).toBe('Use apenas letras, espaços e hífens.');
      }
    });

    it('rejeita caracteres especiais', () => {
      const result = validateSearchTerm('@#$');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason.kind).toBe('invalid-search');
        expect(result.reason.message).toBe('Use apenas letras, espaços e hífens.');
      }
    });

    it('rejeita mistura de letras e números', () => {
      const result = validateSearchTerm('São123');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason.kind).toBe('invalid-search');
        expect(result.reason.message).toBe('Use apenas letras, espaços e hífens.');
      }
    });
  });

  describe('trimming', () => {
    it('valida após remover espaços extras', () => {
      const result = validateSearchTerm('  São Paulo  ');
      expect(result.valid).toBe(true);
    });

    it('rejeita string com apenas 2 caracteres após trim', () => {
      const result = validateSearchTerm('  Sp  ');
      expect(result.valid).toBe(false);
    });
  });

  describe('precedência das regras', () => {
    it.each(['@', '@@', 'a!'])(
      'reporta erro de tamanho antes do de caracteres para %j',
      (term) => {
        const result = validateSearchTerm(term);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.reason.message).toBe('Digite pelo menos 3 caracteres.');
        }
      }
    );
  });

  describe('termos sem nenhuma letra', () => {
    it('rejeita termo composto apenas de hífens', () => {
      const result = validateSearchTerm('---');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason.message).toBe('Use apenas letras, espaços e hífens.');
      }
    });

    it('rejeita termo só de hífens e espaços', () => {
      expect(validateSearchTerm('  ---  ').valid).toBe(false);
    });
  });

  describe('alfabeto não latino', () => {
    it.each(['福岡市'])(
      'rejeita termo em alfabeto não latino/romano: %j',
      (term) => {
        const result = validateSearchTerm(term);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.reason.message).toBe('Use apenas letras, espaços e hífens.');
        }
      }
    );
  });

  describe('normalização NFC', () => {
    it('aceita acentos decompostos (NFD → NFC)', () => {
      expect(validateSearchTerm('Sa\u0303o Paulo')).toEqual({ valid: true });
    });

    it('rejeita acento decomposto misturado a caracteres inválidos', () => {
      const result = validateSearchTerm('Sa\u0303o123');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason.message).toBe('Use apenas letras, espaços e hífens.');
      }
    });
  });

  describe('whitespace e caracteres especiais', () => {
    it.each(['São\tPaulo', 'São\nPaulo'])(
      'rejeita termo com whitespace interno %j',
      (term) => {
        expect(validateSearchTerm(term).valid).toBe(false);
      }
    );

    it.each(['São\u200BPaulo', 'São\u00A0Paulo'])(
      'rejeita termo com espaço de largura zero/não quebrado %j',
      (term) => {
        expect(validateSearchTerm(term).valid).toBe(false);
      }
    );

    it.each(['\u00A0abc\u00A0', '\u3000abc\u3000'])(
      'remove %j das bordas antes de validar',
      (term) => {
        expect(validateSearchTerm(term)).toEqual({ valid: true });
      }
    );

    it.each(['São１Paulo', "D'Agosto", 'St. Louis'])(
      'rejeita %j (apenas letras latinas, espaço e hífen)',
      (term) => {
        const result = validateSearchTerm(term);
        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.reason.message).toBe('Use apenas letras, espaços e hífens.');
        }
      }
    );
  });
});
