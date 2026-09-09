import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import {
  SAO_PAULO_CURRENT_ONLY,
  SAO_PAULO_WEATHER,
  buildForecastDto,
  currentWeatherDto,
  forecastBlockDto,
} from '@/mocks/fixtures';
import {
  weatherNotFoundHandler,
  weatherRateLimitHandler,
} from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { getWeather } from '@/services/repositories/weather-repository';

/**
 * Integração do repositório de clima via MSW (fase 02 §6, ADR-10).
 *
 * Valida o roteamento por escopo (`current` → só clima atual; `current+forecast`
 * → clima atual + blocos de 3h), a conversão pelos adapters e o repasse do
 * abort (ADR-06). O fluxo feliz usa handlers inline porque o default da
 * previsão tem 40 blocos (o teste exercita um payload reduzido); os cenários de
 * erro usam os named exports de `src/mocks/handlers` (fase 04 §2).
 */
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
        return HttpResponse.json(currentWeatherDto);
      }),
      forecastHandler,
    );

    const result = await getWeather(SAO_PAULO_CURRENT_ONLY);

    expect(result.current.temperatureC).toBe(22.3);
    expect(result.current.visibilityKm).toBe(10);
    expect(result.hourly).toEqual([]);
  });

  it('escopo current+forecast: chama ambos e converte os blocos', async () => {
    const forecastDto = buildForecastDto(2);
    server.use(
      http.get('http://localhost:3003/data/2.5/weather', () => {
        return HttpResponse.json(currentWeatherDto);
      }),
      http.get('http://localhost:3003/data/2.5/forecast', () => {
        return HttpResponse.json(forecastDto);
      }),
    );

    const result = await getWeather(SAO_PAULO_WEATHER);

    expect(result.current.temperatureC).toBe(22.3);
    expect(result.hourly).toHaveLength(2);
    expect(result.hourly[0]).toEqual(
      expect.objectContaining({
        time: forecastBlockDto.dt,
        temperatureC: 22.3,
        precipitationPct: 50,
        windSpeedKmh: 36,
        condition: 'Céu limpo',
      }),
    );
  });

  it('propaga NotFoundError em 404 no clima atual', async () => {
    server.use(weatherNotFoundHandler);

    await expect(getWeather(SAO_PAULO_CURRENT_ONLY)).rejects.toMatchObject({
      kind: 'not-found',
    });
  });

  it('propaga ServerError em 429 no clima atual', async () => {
    server.use(weatherRateLimitHandler);

    await expect(getWeather(SAO_PAULO_CURRENT_ONLY)).rejects.toMatchObject({
      kind: 'server',
    });
  });

  it('repassa o erro original quando o sinal de abort é disparado', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      getWeather(SAO_PAULO_CURRENT_ONLY, controller.signal),
    ).rejects.toMatchObject({
      isAxiosError: true,
      code: 'ERR_CANCELED',
    });
  });
});
