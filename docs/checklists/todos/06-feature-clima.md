# Fase 06 — Feature: clima e gráficos

> `components/weather/*` recebem dados do `use-weather` (via composição) e usam
> `components/ui/*` + `utils/format` + `utils/selectors`. `WeatherCharts` é o único que usa
> Recharts e deve ser **lazy-loaded**.
>
> **Referência:** stack §12, §14; arquitetura §5.2, §7, §10.2, §13 (gráficos lazy).

---

## 1. `src/components/weather/CurrentWeatherCard.tsx`

**Hoje retorna `null`.** Implementar:

- [ ] Card (`Card`) com a condição atual: cidade? (nome vindo da composição), temperatura
      grande (`formatTemperature`), sensação térmica, condição (`description`) + ícone
      (mapeamento da fase 01/08).
- [ ] Observação em `observedAt` formatada (fase 01).
- [ ] Props/contrato: receber `current: CurrentWeather` (e opcionalmente `cityName`).
- [ ] Estilo fluido para o grid responsivo (ADR-08).
- [ ] Testes em `tests/components/weather/CurrentWeatherCard.test.tsx`.

## 2. `src/components/weather/MetricsGrid.tsx`

**Hoje retorna `null`.** Implementar:

- [ ] Grade de `MetricTile`s (responsiva — `grid-cols-2`/`sm:grid-cols-3`/…):
  - [ ] umidade (`formatHumidity`);
  - [ ] vento: velocidade + direção em texto (fase 01);
  - [ ] mínima / máxima (`minC`/`maxC`);
  - [ ] pressão (`pressureHpa`);
  - [ ] precipitação (`precipitationPct`); visibilidade (`visibilityKm`), se exibida.
- [ ] Receber `current: CurrentWeather` já integralizada + formatters de `utils/format`.
- [ ] Ícones lucide por métrica (`icon` do `MetricTile`).
- [ ] Testes em `tests/components/weather/MetricsGrid.test.tsx`.

## 3. `src/components/weather/HourlyForecast.tsx`

**Hoje retorna `null`.** Implementar:

- [ ] Lista horizontal (scroll) ou grid dos blocos de `HourlyForecast`.
- [ ] Cada bloco: hora (`"14h"` via dayjs — fase 01), temperatura, precipitação e ícone de
      condição.
- [ ] Receber `hourly: HourlyForecast[]`; renderizar fallback/`EmptyState` quando vazio
      (ausência de previsão não derruba o dashboard — arquitetura §9.2).
- [ ] Testes em `tests/components/weather/HourlyForecast.test.tsx` (+ caso vazio).

## 4. `src/components/weather/DailyForecast.tsx`

**Hoje retorna `null`.** Implementar:

- [ ] Lista dos dias de `DailyForecast` (derivados via `groupHourlyByDay`).
- [ ] Por dia: rótulo ("seg", "ter"… via dayjs), `minC`/`maxC`, condição/ícone,
      precipitação.
- [ ] Receber `daily: DailyForecast[]`; fallback/`EmptyState` quando vazio.
- [ ] Testes em `tests/components/weather/DailyForecast.test.tsx` (+ caso vazio).

## 5. `src/components/weather/WeatherCharts.tsx`

**Hoje retorna `null`.** Implementar (stack §14; arquitetura §13):

- [ ] Gráfico(s) com **Recharts** e `ResponsiveContainer`:
  - [ ] linha de temperatura por hora (00h–24h × °C) a partir de `hourly`;
  - [ ] (opcional) linha de temperatura por dia a partir de `daily`;
  - [ ] (opcional) barras de precipitação (%).
- [ ] Título/labels acessíveis; `aria` nas séries quando possível.
- [ ] Dados pré-formatados/reduzidos via `utils/selectors` (não montar dados brutos no
      componente — derivação em `utils`, arquitetura §5.6).
- [ ] **Lazy loading**:
  - [ ] exportar componente como default (para `React.lazy`);
  - [ ] envolver em `React.lazy(() => import(...))` + `<Suspense fallback={...}>` na **fase
        07** (`WeatherDashboard`);
  - [ ] verificar que o chunk separado é gerado no build (`dist/` com chunk de gráfico).
- [ ] Receber props: `hourly`/`daily`.
- [ ] Testes: render do wrapper com fallback + (se viável) mocks de `ResponsiveContainer`;
      `ResizeObserver` já mockado no setup.

## 6. Mapeamento condição → ícone (fase 01/08)

- [ ] Definir função/componente único `condition → lucide-react icon` (sol/sol parcial/
      nuvens/chuva/tempestade/neve/neblina…) com base em `WeatherCondition.id` ou `main`.
- [ ] Aplicar em `CurrentWeatherCard`, `HourlyForecast`, `DailyForecast` (sem duplicar lógica).

---

## Critério de conclusão da fase 06

- [ ] `npm run typecheck` e `npm run lint` passam.
- [ ] Testes de `components/weather` criados e passando (`npm run test`).
- [ ] Nenhum `null`/`Not implemented` restante em `src/components/weather/`.
- [ ] Widgets fluidos (sem conhecimento de breakpoint — ADR-08) e sem import de
      `services/`/DTOs.