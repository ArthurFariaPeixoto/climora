import { lazy, Suspense, useState } from 'react';

import { SearchBar } from '@/components/search/SearchBar';
import { EmptyState } from '@/components/state/EmptyState';
import { ErrorState } from '@/components/state/ErrorState';
import { LoadingState } from '@/components/state/LoadingState';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import { DailyForecast } from '@/components/weather/DailyForecast';
import { HourlyForecast } from '@/components/weather/HourlyForecast';
import { MetricsGrid } from '@/components/weather/MetricsGrid';
import { useWeather } from '@/hooks/use-weather';
import type { City } from '@/models/City';
import type { WeatherRequest } from '@/models/WeatherRequest';
import { getErrorMessage, isRetryableAppError } from '@/utils/errors';

/**
 * Gráficos do dashboard em chunk separado (arquitetura §13; stack §14). O
 * `React.lazy` + `Suspense` isola o Recharts: apenas o gráfico cai no
 * fallback — o restante do dashboard carrega normalmente.
 */
const WeatherCharts = lazy(() => import('@/components/weather/WeatherCharts'));

/**
 * Composição raiz do dashboard (arquitetura §5.1).
 *
 * Mantém a cidade selecionada (`useState` — elo entre as fases A e B do
 * fluxo, §6), consome a fachada `use-weather` e distribui dados e estados para
 * os widgets. Não contém lógica de negócio nem conhece a API — apenas hooks de
 * feature (ADR-04, ADR-11).
 *
 * Divisão de estado (anexo-11 item 9): o termo da busca é local ao `SearchBar`;
 * a seleção sobe até aqui via `onSelect(city)`. A grade responsiva é decisão do
 * `DashboardLayout` (fase 07 §2 — ADR-08), então aqui os blocos apenas
 * empilham em coluna fluida dentro de `col-span-full` (o dashboard ocupa a
 * largura total da grade em todos os breakpoints — a disposição multi-coluna
 * visual dos widgets fica para a fase 08, polimento).
 *
 * Pedido de clima: montado inline a partir de `City` (fase 03 §3 — o chamador
 * monta o `WeatherRequest`; `buildWeatherQuery` não conhece o modelo `City`).
 */
export function WeatherDashboard() {
  const [city, setCity] = useState<City | null>(null);

  const request: WeatherRequest | null = city
    ? { lat: city.lat, lon: city.lon, scope: 'current+forecast' }
    : null;

  const { status, current, hourly, daily, error, refetch } = useWeather(request);

  function renderWeather() {
    if (status === 'loading') return <LoadingState />;

    if (status === 'error' && error !== null) {
      return (
        <ErrorState
          message={getErrorMessage(error)}
          onRetry={
            isRetryableAppError(error) ? () => void refetch() : undefined
          }
        />
      );
    }

    if (status === 'empty') {
      return <EmptyState message="Clima indisponível para esta cidade." />;
    }

    if (status === 'success' && current !== null) {
      return (
        <>
          <CurrentWeatherCard current={current} cityName={city?.name} />
          <MetricsGrid current={current} />
          <HourlyForecast hourly={hourly} />
          <DailyForecast daily={daily} />
          <Suspense fallback={<LoadingState />}>
            <WeatherCharts hourly={hourly} />
          </Suspense>
        </>
      );
    }

    return <EmptyState message="Busque uma cidade para ver o clima." />;
  }

  return (
    <div className="col-span-full flex flex-col gap-4">
      <SearchBar onSelect={setCity} />
      {renderWeather()}
    </div>
  );
}