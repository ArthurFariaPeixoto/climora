import { describe, expect, it } from 'vitest';

import {
  formatHour,
  formatHumidity,
  formatObservedAt,
  formatPressure,
  formatTemperature,
  formatWeekday,
  formatWindDirection,
  formatWindSpeed,
} from '@/utils/format';

describe('formatTemperature', () => {
  it('formata temperatura inteira com °C', () => {
    expect(formatTemperature(22)).toBe('22°C');
  });

  it('arredonda para o inteiro mais próximo', () => {
    expect(formatTemperature(22.4)).toBe('22°C');
    expect(formatTemperature(22.5)).toBe('23°C');
  });

  it('arredonda logo abaixo do meio para baixo', () => {
    expect(formatTemperature(22.499)).toBe('22°C');
  });

  it('arredonda meio exato para cima', () => {
    expect(formatTemperature(0.5)).toBe('1°C');
  });

  it('trata -0.5 como 0°C (Math.round(-0.5) = -0)', () => {
    expect(formatTemperature(-0.5)).toBe('0°C');
  });

  it('arredonda valores negativos', () => {
    expect(formatTemperature(-5.4)).toBe('-5°C');
    expect(formatTemperature(-9.6)).toBe('-10°C');
  });

  it('formata zero', () => {
    expect(formatTemperature(0)).toBe('0°C');
  });

  it('formata valores grandes sem notação científica', () => {
    expect(formatTemperature(10000.4)).toBe('10000°C');
  });
});

describe('formatWindSpeed', () => {
  it('formata velocidade em km/h', () => {
    expect(formatWindSpeed(12)).toBe('12 km/h');
  });

  it('arredonda decimais', () => {
    expect(formatWindSpeed(12.4)).toBe('12 km/h');
    expect(formatWindSpeed(12.6)).toBe('13 km/h');
  });

  it('arredonda meio exato para cima', () => {
    expect(formatWindSpeed(12.5)).toBe('13 km/h');
  });

  it('arredonda valores quase zero', () => {
    expect(formatWindSpeed(0.49)).toBe('0 km/h');
  });

  it('formata velocidade zero', () => {
    expect(formatWindSpeed(0)).toBe('0 km/h');
  });
});

describe('formatWindDirection', () => {
  it.each([
    [0, 'N'],
    [45, 'NE'],
    [90, 'E'],
    [135, 'SE'],
    [180, 'S'],
    [225, 'SW'],
    [270, 'W'],
    [315, 'NW'],
  ])('converte %d° em %s', (degree, direction) => {
    expect(formatWindDirection(degree)).toBe(direction);
  });

  it('normaliza bordas próximas de 360°', () => {
    expect(formatWindDirection(359)).toBe('N');
    expect(formatWindDirection(360)).toBe('N');
  });

  it('normaliza valores fora do intervalo [0, 360)', () => {
    expect(formatWindDirection(405)).toBe('NE');
    expect(formatWindDirection(-45)).toBe('NW');
    expect(formatWindDirection(-360)).toBe('N');
  });

  it('normaliza graus negativos quase zero', () => {
    expect(formatWindDirection(-0.1)).toBe('N');
  });

  it('normaliza múltiplos de 360', () => {
    expect(formatWindDirection(720)).toBe('N');
    expect(formatWindDirection(725)).toBe('N');
  });

  it('arredonda graus não-inteiros para o ponto mais próximo', () => {
    expect(formatWindDirection(44.9)).toBe('NE');
    expect(formatWindDirection(45.1)).toBe('NE');
  });

  it.each([
    [22.5, 'NE'],
    [67.5, 'E'],
    [112.5, 'SE'],
    [157.5, 'S'],
    [202.5, 'SW'],
    [247.5, 'W'],
    [292.5, 'NW'],
    [337.5, 'N'],
  ])('arredonda o meio-grau exato %d° para %s', (degree, direction) => {
    expect(formatWindDirection(degree)).toBe(direction);
  });

  it('mantém o ponto anterior logo abaixo do meio-grau', () => {
    expect(formatWindDirection(22.49)).toBe('N');
    expect(formatWindDirection(67.49)).toBe('NE');
  });
});

describe('formatHumidity', () => {
  it('formata umidade com %', () => {
    expect(formatHumidity(65)).toBe('65%');
  });

  it('arredonda decimais', () => {
    expect(formatHumidity(65.4)).toBe('65%');
    expect(formatHumidity(65.6)).toBe('66%');
  });

  it('arredonda meio exato para cima', () => {
    expect(formatHumidity(65.5)).toBe('66%');
  });

  it('formata os limites da faixa', () => {
    expect(formatHumidity(0)).toBe('0%');
    expect(formatHumidity(100)).toBe('100%');
  });

  it('faz clamp defensivo para a faixa [0, 100]', () => {
    expect(formatHumidity(-5)).toBe('0%');
    expect(formatHumidity(145)).toBe('100%');
  });
});

describe('formatPressure', () => {
  it('formata pressão com hPa', () => {
    expect(formatPressure(1013)).toBe('1013 hPa');
  });

  it('arredonda decimais', () => {
    expect(formatPressure(1013.4)).toBe('1013 hPa');
    expect(formatPressure(1013.7)).toBe('1014 hPa');
  });

  it('arredonda meio exato para cima', () => {
    expect(formatPressure(1040.5)).toBe('1041 hPa');
  });
});

describe('formatHour', () => {
  it('formata hora curta pt-BR em UTC', () => {
    expect(formatHour(1788789600)).toBe('14h');
  });

  it('formata hora de dígito único sem zero à esquerda', () => {
    expect(formatHour(1788771600)).toBe('9h');
  });

  it('formata meia-noite como 0h', () => {
    expect(formatHour(1788739200)).toBe('0h');
  });

  it('usa UTC mesmo quando o dia local difere', () => {
    expect(formatHour(1788826200)).toBe('0h');
  });

  it('formata o último minuto do dia', () => {
    expect(formatHour(1788998340)).toBe('23h');
  });

  it('formata o epoch como 0h', () => {
    expect(formatHour(0)).toBe('0h');
  });
});

describe('formatWeekday', () => {
  it('formata dia da semana curto pt-BR em UTC', () => {
    expect(formatWeekday(1788789600)).toBe('seg');
  });

  it('formata terça-feira', () => {
    expect(formatWeekday(1788868800)).toBe('ter');
  });

  it('formata quarta-feira', () => {
    expect(formatWeekday(1788940800)).toBe('qua');
  });

  it('formata sábado com acento', () => {
    expect(formatWeekday(1789237800)).toBe('sáb');
  });

  it('formata domingo', () => {
    expect(formatWeekday(1789324200)).toBe('dom');
  });

  it('formata o epoch (quinta-feira)', () => {
    expect(formatWeekday(0)).toBe('qui');
  });
});

describe('formatObservedAt', () => {
  it('formata data/hora pt-BR em UTC', () => {
    expect(formatObservedAt(1788789900)).toBe('7 de setembro de 2026 às 14:05');
  });

  it('usa UTC mesmo quando o dia local difere', () => {
    expect(formatObservedAt(1788826200)).toBe('8 de setembro de 2026 às 00:10');
  });

  it('formata dia/mês de um dígito', () => {
    expect(formatObservedAt(1767229500)).toBe('1 de janeiro de 2026 às 01:05');
  });

  it('formata o último minuto do ano', () => {
    expect(formatObservedAt(1798761540)).toBe('31 de dezembro de 2026 às 23:59');
  });
});