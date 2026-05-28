import { describe, it, expect } from 'vitest';
import { formatarCpf, formatarTelefone, validarCpf } from './utils';

describe('formatarCpf', () => {
  it('deve formatar uma string de numeros em CPF formatado', () => {
    expect(formatarCpf('12345678901')).toBe('123.456.789-01');
  });

  it('deve retornar string vazia se nao houver valor', () => {
    expect(formatarCpf('')).toBe('');
    expect(formatarCpf(null)).toBe('');
  });
});

describe('formatarTelefone', () => {
  it('deve formatar telefone com 10 digitos (fixo)', () => {
    expect(formatarTelefone('1133334444')).toBe('(11) 3333-4444');
  });

  it('deve formatar telefone com 11 digitos (celular)', () => {
    expect(formatarTelefone('11999998888')).toBe('(11) 99999-8888');
  });
});

describe('validarCpf', () => {
  it('deve retornar true para CPFs validos', () => {
    // CPFs validos de teste
    expect(validarCpf('52998224725')).toBe(true);
    expect(validarCpf('529.982.247-25')).toBe(true);
  });

  it('deve retornar false para CPFs com todos digitos iguais', () => {
    expect(validarCpf('11111111111')).toBe(false);
    expect(validarCpf('222.222.222-22')).toBe(false);
  });

  it('deve retornar false para CPFs com digito verificador invalido', () => {
    expect(validarCpf('52998224726')).toBe(false); // Fim incorreto
    expect(validarCpf('12345678901')).toBe(false); // Digito verificador incorreto
  });

  it('deve retornar false se o tamanho for incorreto ou nulo', () => {
    expect(validarCpf('123')).toBe(false);
    expect(validarCpf('')).toBe(false);
    expect(validarCpf(null)).toBe(false);
  });
});
