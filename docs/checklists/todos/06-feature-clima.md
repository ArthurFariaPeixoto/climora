# Fase 06 — Feature: clima e gráficos

> `components/weather/*` recebem dados do `use-weather` (via composição) e usam
> `components/ui/*` + `utils/format` + `utils/selectors`. `WeatherCharts` é o único que usa
> Recharts e deve ser **lazy-loaded**.
>
> **Referência:** stack §12, §14; arquitetura §5.2, §7, §10.2, §13 (gráficos lazy).

---

## 1. `src/components/weather/CurrentWeatherCard.tsx`

**Hoje retorna `null`.** Implementar:

- [x] Card (`Card`) com a condição atual: cidade? (nome vindo da composição), temperatura
      grande (`formatTemperature`), sensação térmica, condição (`description`) + ícone
      (mapeamento da fase 01/08).
- [x] Observação em `observedAt` formatada (fase 01).
- [x] Props/contrato: receber `current: CurrentWeather` (e opcionalmente `cityName`).
- [x] Estilo fluido para o grid responsivo (ADR-08).
- [x] Testes em `tests/components/weather/CurrentWeatherCard.test.tsx`.

## 2. `src/components/weather/MetricsGrid.tsx`

**Hoje retorna `null`.** Implementar:

- [x] Grade de `MetricTile`s (fluida `repeat(auto-fit, minmax(...))` — anexo-11 item 15):
  - [x] umidade (`formatHumidity`);
  - [x] vento: velocidade + direção em texto (fase 01);
  - [x] mínima / máxima (`minC`/`maxC`);
  - [x] pressão (`pressureHpa`);
  - [x] precipitação (`precipitationPct`); visibilidade (`visibilityKm`), se exibida.
- [x] Receber `current: CurrentWeather` já integralizada + formatters de `utils/format`.
- [x] Ícones lucide por métrica (`icon` do `MetricTile`).
- [x] Testes em `tests/components/weather/MetricsGrid.test.tsx`.

## 3. `src/components/weather/HourlyForecast.tsx`

**Hoje retorna `null`.** Implementar:

- [x] Lista horizontal (scroll) ou grid dos blocos de `HourlyForecast`.
- [x] Cada bloco: hora (`"14h"` via dayjs — fase 01), temperatura, precipitação e ícone de
      condição.
- [x] Receber `hourly: HourlyForecast[]`; renderizar fallback/`EmptyState` quando vazio
      (ausência de previsão não derruba o dashboard — arquitetura §9.2).
- [x] Testes em `tests/components/weather/HourlyForecast.test.tsx` (+ caso vazio).

## 4. `src/components/weather/DailyForecast.tsx`

**Hoje retorna `null`.** Implementar:

- [x] Lista dos dias de `DailyForecast` (derivados via `groupHourlyByDay`).
- [x] Por dia: rótulo ("seg", "ter"… via dayjs), `minC`/`maxC`, condição/ícone,
      precipitação.
- [x] Receber `daily: DailyForecast[]`; fallback/`EmptyState` quando vazio.
- [x] Testes em `tests/components/weather/DailyForecast.test.tsx` (+ caso vazio).

## 5. `src/components/weather/WeatherCharts.tsx`

**Hoje retorna `null`.** Implementar (stack §14; arquitetura §13):

- [x] Gráfico(s) com **Recharts** e `ResponsiveContainer`:
  - [x] linha de temperatura por hora (00h–24h × °C) a partir de `hourly`;
  - [x] (opcional **dispensado**) linha de temperatura por dia a partir de `daily` —
        decisão de escopo: não implementado (fixture tem só 2 dias; escopo escolhido =
        linha+barras); `daily` permanece no contrato de props para a fase 07;
  - [x] (opcional) barras de precipitação (%) — em eixo direito, junto da linha.
- [x] Título/labels acessíveis; `aria` nas séries quando possível — heading + `role="img"`/
      `aria-label` (Recharts v3 não expõe `accessibilityLayer` do v2).
- [x] Dados pré-formatados/reduzidos via `utils/selectors` (não montar dados brutos no
      componente — derivação em `utils`, arquitetura §5.6): `toHourlyChartData`.
- [x] **Lazy loading**:
  - [x] exportar componente como default (para `React.lazy`).

> Wrapper `React.lazy` + `<Suspense>` e verificação do chunk no build são **pendências da
> fase 07** — ver `07-composicao-dashboard.md` §1 (linhas 23/24 e 74). Movidos daqui ao
> concluir a fase 06.
- [x] Receber props: `hourly`/`daily`.
- [x] Testes: render do wrapper com fallback + (se viável) mocks de `ResponsiveContainer`;
      `ResizeObserver` já mockado no setup — mock apenas do `ResponsiveContainer`
      (dimensionado 600×300 via recharts importOriginal).

## 6. Mapeamento condição → ícone (fase 01/08)

- [x] Definir função/componente único `condition → lucide-react icon` (sol/sol parcial/
      nuvens/chuva/tempestade/neve/neblina…) com base em `WeatherCondition.id` ou `main`.
- [x] Aplicar em `CurrentWeatherCard`, `HourlyForecast`, `DailyForecast` (sem duplicar lógica).

---

## Critério de conclusão da fase 06

- [x] `npm run typecheck` e `npm run lint` passam.
- [x] Testes de `components/weather` criados e passando (`npm run test`).
- [x] Nenhum `null`/`Not implemented` restante em `src/components/weather/`.
- [x] Widgets fluidos (sem conhecimento de breakpoint — ADR-08) e sem import de
      `services/`/DTOs.