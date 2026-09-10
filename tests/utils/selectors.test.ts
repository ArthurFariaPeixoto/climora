import { describe, expect, it } from 'vitest';

import type { HourlyForecast } from '@/models/HourlyForecast';
import {
  groupHourlyByDay,
  toHourlyChartData,
} from '@/utils/selectors';
import { formatHour } from '@/utils/format';

const DAY_1_START = 1788739200; // 7 de setembro de 2026, 00:00 UTC
const DAY_2_START = 1788825600; // 8 de setembro de 2026, 00:00 UTC

const DAY_1_BLOCKS: HourlyForecast[] = [
  block(DAY_1_START, { temperatureC: 16, humidityPct: 80, precipitationPct: 0, windSpeedKmh: 10, condition: 'Céu limpo' }),
  block(DAY_1_START + 3 * 3600, { temperatureC: 15, humidityPct: 85, precipitationPct: 0, windSpeedKmh: 12, condition: 'Céu limpo' }),
  block(DAY_1_START + 6 * 3600, { temperatureC: 15, humidityPct: 88, precipitationPct: 5, windSpeedKmh: 11, condition: 'Nuvens dispersas' }),
  block(DAY_1_START + 9 * 3600, { temperatureC: 18, humidityPct: 75, precipitationPct: 20, windSpeedKmh: 9, condition: 'Nuvens dispersas' }),
  block(DAY_1_START + 12 * 3600, { temperatureC: 22, humidityPct: 60, precipitationPct: 10, windSpeedKmh: 14, condition: 'Chuva leve' }),
  block(DAY_1_START + 15 * 3600, { temperatureC: 23, humidityPct: 58, precipitationPct: 15, windSpeedKmh: 16, condition: 'Chuva leve' }),
  block(DAY_1_START + 18 * 3600, { temperatureC: 20, humidityPct: 65, precipitationPct: 30, windSpeedKmh: 18, condition: 'Chuva leve' }),
  block(DAY_1_START + 21 * 3600, { temperatureC: 17, humidityPct: 72, precipitationPct: 40, windSpeedKmh: 15, condition: 'Chuva leve' }),
];

const DAY_2_BLOCKS: HourlyForecast[] = [
  block(DAY_2_START, { temperatureC: 16, humidityPct: 70, precipitationPct: 10, windSpeedKmh: 8, condition: 'Céu limpo' }),
  block(DAY_2_START + 3 * 3600, { temperatureC: 15, humidityPct: 75, precipitationPct: 5, windSpeedKmh: 7, condition: 'Céu limpo' }),
  block(DAY_2_START + 6 * 3600, { temperatureC: 14, humidityPct: 80, precipitationPct: 0, windSpeedKmh: 6, condition: 'Nuvens dispersas' }),
  block(DAY_2_START + 9 * 3600, { temperatureC: 19, humidityPct: 62, precipitationPct: 0, windSpeedKmh: 9, condition: 'Nuvens dispersas' }),
  block(DAY_2_START + 12 * 3600, { temperatureC: 24, humidityPct: 50, precipitationPct: 0, windSpeedKmh: 12, condition: 'Céu limpo' }),
  block(DAY_2_START + 15 * 3600, { temperatureC: 25, humidityPct: 48, precipitationPct: 0, windSpeedKmh: 13, condition: 'Céu limpo' }),
  block(DAY_2_START + 18 * 3600, { temperatureC: 21, humidityPct: 55, precipitationPct: 0, windSpeedKmh: 10, condition: 'Céu limpo' }),
  block(DAY_2_START + 21 * 3600, { temperatureC: 18, humidityPct: 60, precipitationPct: 5, windSpeedKmh: 9, condition: 'Céu limpo' }),
];

describe('groupHourlyByDay', () => {
  it('agrupa blocos de 3h por dia (UTC) preservando o início do dia', () => {
    const result = groupHourlyByDay([...DAY_1_BLOCKS, ...DAY_2_BLOCKS]);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe(DAY_1_START);
    expect(result[1].date).toBe(DAY_2_START);
  });

  it('deriva minC/maxC do grupo', () => {
    const result = groupHourlyByDay(DAY_1_BLOCKS);

    expect(result[0].minC).toBe(15);
    expect(result[0].maxC).toBe(23);
  });

  it('deriva humidade/precipitação/vento como média do grupo', () => {
    const [day1, day2] = groupHourlyByDay([...DAY_1_BLOCKS, ...DAY_2_BLOCKS]);

    expect(day1.humidityPct).toBe(72.875);
    expect(day1.precipitationPct).toBe(15);
    expect(day1.windSpeedKmh).toBe(13.125);

    expect(day2.humidityPct).toBe(62.5);
    expect(day2.precipitationPct).toBe(2.5);
    expect(day2.windSpeedKmh).toBe(9.25);
  });

  it('usa a condição do bloco mais próximo do meio-dia UTC', () => {
    const result = groupHourlyByDay([...DAY_1_BLOCKS, ...DAY_2_BLOCKS]);

    expect(result[0].condition).toBe('Chuva leve'); // bloco de 12h UTC
    expect(result[1].condition).toBe('Céu limpo'); // bloco de 12h UTC
  });

  it('elege o bloco mais próximo do meio-dia quando não há bloco de 12h', () => {
    const day1WithoutNoon = DAY_1_BLOCKS.filter(
      (blockHour) =>
        blockHour.time !== DAY_1_START + 12 * 3600 &&
        blockHour.time !== DAY_1_START + 9 * 3600, // evita empate (09h e 15h)
    );

    const result = groupHourlyByDay(day1WithoutNoon);

    expect(result[0].condition).toBe('Chuva leve'); // 15h, 3h de distância vs 6h da manhã
  });

  it('desempate mantém o primeiro bloco quando duas distâncias são iguais', () => {
    const blocks = [
      block(DAY_1_START + 6 * 3600, { condition: 'Nublado' }),
      block(DAY_1_START + 18 * 3600, { condition: 'Chuva forte' }),
    ];

    const result = groupHourlyByDay(blocks);

    expect(result[0].condition).toBe('Nublado');
  });

  it('agrupa mesmo com a mudança de dia no meio do array', () => {
    const shuffled = [
      DAY_1_BLOCKS[0],
      DAY_2_BLOCKS[0],
      DAY_1_BLOCKS[1],
      DAY_2_BLOCKS[1],
      DAY_1_BLOCKS[2],
    ];

    const result = groupHourlyByDay(shuffled);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe(DAY_1_START);
    expect(result[1].date).toBe(DAY_2_START);
  });

  it('ordena a saída por data mesmo com entrada fora de ordem', () => {
    const shuffled = [...DAY_2_BLOCKS, ...DAY_1_BLOCKS];

    const result = groupHourlyByDay(shuffled);

    expect(result.map((day) => day.date)).toEqual([DAY_1_START, DAY_2_START]);
  });

  it('retorna [] para entrada vazia', () => {
    expect(groupHourlyByDay([])).toEqual([]);
  });

  it('trata um único bloco no início do dia', () => {
    const result = groupHourlyByDay([block(DAY_1_START, { condition: 'Nevoeiro' })]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      date: DAY_1_START,
      minC: 20,
      maxC: 20,
      humidityPct: 60,
      precipitationPct: 0,
      windSpeedKmh: 10,
      condition: 'Nevoeiro',
    });
  });

  it('trata um único bloco no fim do dia', () => {
    const lateTime = DAY_1_START + 21 * 3600;
    const result = groupHourlyByDay([block(lateTime, { condition: 'Tempestade' })]);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe(DAY_1_START);
    expect(result[0].condition).toBe('Tempestade');
  });

  it('não combina blocos de dias distintos na mesma agregação', () => {
    const lastBlockOfDay1 = DAY_1_BLOCKS[6];
    const firstBlockOfDay2 = DAY_2_BLOCKS[0];

    const result = groupHourlyByDay([lastBlockOfDay1, firstBlockOfDay2]);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe(DAY_1_START);
    expect(result[0].maxC).toBe(lastBlockOfDay1.temperatureC);
    expect(result[1].date).toBe(DAY_2_START);
    expect(result[1].maxC).toBe(firstBlockOfDay2.temperatureC);
  });
});

describe('toHourlyChartData', () => {
  it('pré-formata rótulo e preserva temperatureC/precipitationPct por bloco', () => {
    const result = toHourlyChartData(DAY_1_BLOCKS);

    expect(result).toHaveLength(DAY_1_BLOCKS.length);
    for (let i = 0; i < DAY_1_BLOCKS.length; i++) {
      const blockHour = DAY_1_BLOCKS[i];
      expect(result[i]).toEqual({
        time: blockHour.time,
        label: formatHour(blockHour.time),
        temperatureC: blockHour.temperatureC,
        precipitationPct: blockHour.precipitationPct,
      });
    }
  });

  it('usa formatHour (UTC) nos rótulos', () => {
    const noon = toHourlyChartData([block(DAY_1_START + 12 * 3600)]);

    expect(noon[0].label).toBe('12h');
  });

  it('retorna [] para entrada vazia', () => {
    expect(toHourlyChartData([])).toEqual([]);
  });
});

function block(
  time: number,
  overrides: Partial<HourlyForecast> = {},
): HourlyForecast {
  return {
    time,
    temperatureC: 20,
    feelsLikeC: 20,
    humidityPct: 60,
    precipitationPct: 0,
    windSpeedKmh: 10,
    condition: 'Céu limpo',
    ...overrides,
  };
}