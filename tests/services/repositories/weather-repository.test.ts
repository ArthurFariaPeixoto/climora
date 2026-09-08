import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';
import type {
  CurrentWeatherDto,
  ForecastBlockDto,
  ForecastDto,
} from '@/services/dtos';
import { getWeather } from '@/services/repositories/weather-repository';

/**
 * Integração do repositório de clima via MSW (fase 02 §6, ADR-10).
 *
 * Valida o roteamento por escopo (`current` → só clima atual; `current+forecast`
 * → clima atual + blocos de 3h), a conversão pelos adapters e o repasse do
 * abort (ADR-06). Fixtures inline até a fase 04 criar `src/mocks/`.
 */
const request = { lat: -23.55, lon: -46.63, scope: 'current' as const };

const currentDto: CurrentWeatherDto = {
  dt: 1_752_904_500,
  main: {
    temp: 22.3,
    feels_like: 21.8,
    temp_min: 19.1,
    temp_max: 24.7,
    pressure: 1013,
    humidity: 65,
  },
  weather: [{ id: 800, main: 'Clear', description: 'Céu limpo', icon: '01d' }],
  wind: { speed: 5, deg: 180 },
  visibility: 10_000,
};

const forecastBlock: ForecastBlockDto = {
  dt: 1_752_904_500,
  main: {
    temp: 22.3,
    feels_like: 21.8,
    temp_min: 19.1,
    temp_max: 24.7,
    pressure: 1013,
    humidity: 65,
  },
  weather: [{ id: 800, main: 'Clear', description: 'Céu limpo', icon: '01d' }],
  wind: { speed: 10, deg: 90 },
  pop: 0.5,
};

describe('getWeather', () => {
  it('escopo current: retorna clima atual com hourly vazio', async () => {
    const forecastHandler = http.get(
      'http://localhost:3003/data/2.5/forecast',
      () => {
        throw new Error('Escopo current não deve chamar a previsão.');
      },
    );
    server.use(
      http.get('http://localhost:3003/data/2.5/weather', ({ request }) => {
        const { searchParams } = new URL(request.url);
        expect(searchParams.get('lat')).toBe('-23.55');
        expect(searchParams.get('lon')).toBe('-46.63');
        expect(searchParams.get('units')).toBe('metric');
        return HttpResponse.json(currentDto);
      }),
      forecastHandler,
    );

    const result = await getWeather(request);

    expect(result.current.temperatureC).toBe(22.3);
    expect(result.current.visibilityKm).toBe(10);
    expect(result.hourly).toEqual([]);
  });

  it('escopo current+forecast: chama ambos e converte os blocos', async () => {
    const forecastDto: ForecastDto = {
      list: [forecastBlock, { ...forecastBlock, dt: 1_752_913_500 }],
    };
    server.use(
      http.get('http://localhost:3003/data/2.5/weather', () => {
        return HttpResponse.json(currentDto);
      }),
      http.get('http://localhost:3003/data/2.5/forecast', () => {
        return HttpResponse.json(forecastDto);
      }),
    );

    const result = await getWeather({ ...request, scope: 'current+forecast' });

    expect(result.current.temperatureC).toBe(22.3);
    expect(result.hourly).toHaveLength(2);
    expect(result.hourly[0]).toEqual(
      expect.objectContaining({
        time: 1_752_904_500,
        temperatureC: 22.3,
        precipitationPct: 50,
        windSpeedKmh: 36,
        condition: 'Céu limpo',
      }),
    );
  });

  it('propaga NotFoundError em 404 no clima atual', async () => {
    server.use(
      http.get('http://localhost:3003/data/2.5/weather', () => {
        return HttpResponse.json(
          { message: 'city not found' },
          { status: 404 },
        );
      }),
    );

    await expect(getWeather(request)).rejects.toMatchObject({
      kind: 'not-found',
    });
  });

  it('repassa o erro original quando o sinal de abort é disparado', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(getWeather(request, controller.signal)).rejects.toMatchObject({
      isAxiosError: true,
      code: 'ERR_CANCELED',
    });
  });
});
