# Fase 09 — Testes por camada (suíte completa)

> Mapa completo de `docs/stack_definida.md` §16 + `docs/decisoes_arquiteturais.md` §11.1.
> Testar estados (success/loading/error/empty/concorrência), não só o caminho feliz.
> Nenhum teste depende de API real.
>
> **Referência:** stack §16 (tabela das camadas); arquitetura §11.

---

## 1. `utils/` — funções puras (sem mock)

- [ ] `tests/utils/validation.test.ts` — regras de validação do termo.
- [ ] `tests/utils/format.test.ts` — temperatura, vento/direção, umidade, pressão, hora/dia
      pt-BR, timestamps UTC.
- [ ] `tests/utils/selectors.test.ts` — `groupHourlyByDay` (agregação, ordenação, vazio).
- [ ] `tests/utils/errors.test.ts` — mensagem/ícone por tipo de erro.

## 2. `services/adapters` — DTO → modelo (fixtures)

- [ ] `tests/services/adapters/city.adapter.test.ts` — mapeamento feliz + campos ausentes.
- [ ] `tests/services/adapters/weather.adapter.test.ts` — feliz (m→km, m/s→km/h, pop→%) +
      payloads corrompidos → `InvalidDataError`.

## 3. `services/http` — classificação de erros (MSW / AxiosError injectado)

- [ ] `tests/services/http/errors.test.ts` — `classifyHttpError`: rede, timeout, cancelado,
      401, 404, 429, 5xx, desconhecido.
- [ ] `tests/services/http/api-client.test.ts` — `baseURL`, `appid` injetado, timeout e
      abort via `signal` (MSW em nível de rede).

## 4. `services/repositories` — orquestração (MSW)

- [ ] `tests/services/repositories/city-repository.test.ts` — sucesso (`City[]`), vazio (`[]`),
      404 → `NotFoundError`, 500 → `ServerError`, abort.
- [ ] `tests/services/repositories/weather-repository.test.ts` — `current` vs
      `current+forecast`, normalização, erros propagados.

## 5. Camada de data-fetching — `hooks/data/*` (QueryClient isolado + repositórios mockados)

- [ ] `tests/hooks/data/city-query.test.ts` — chave `['cities', term]`, cache/hit-miss,
      dedup em voo, invalidação por termo, `enabled`, refetch.
- [ ] `tests/hooks/data/weather-query.test.ts` — chave por `WeatherRequest`, staleTime,
      keepPreviousData, cancelamento/descarte ao trocar cidade.

## 6. Hooks de feature — tradução de estados (camada de data-fetching simulada)

- [ ] `tests/hooks/use-city-search.test.ts` — `idle/loading/success/empty/error`;
      termo inválido → `InvalidSearchError` sem requisição.
- [ ] `tests/hooks/use-weather.test.ts` — estados traduzidos, `daily` derivado,
      `refetch`, troca de cidade (concorrência).

## 7. `components/ui` e `components/state` — props diretas (sem mock)

- [ ] `tests/components/ui/Button.test.tsx` — variantes, disabled, onClick.
- [ ] `tests/components/ui/Card/MetricTile/Skeleton.test.tsx` — renderização por props.
- [ ] `tests/components/state/LoadingState.test.tsx` / `ErrorState.test.tsx` /
      `EmptyState.test.tsx` — mensagens, retry condicional, roles.

## 8. `components/search` e `components/weather` — estadodes + interação (hooks mockados)

- [ ] `tests/components/search/SearchBar.test.tsx` — digitar, submeter, teclado, selecionar.
- [ ] `tests/components/search/SearchResults.test.tsx` — 4 estados + lista.
- [ ] `tests/components/search/SearchResultItem.test.tsx` — render + `onSelect`.
- [ ] `tests/components/weather/CurrentWeatherCard.test.tsx` — dados formatados + ícone.
- [ ] `tests/components/weather/MetricsGrid.test.tsx` — métricas exibidas.
- [ ] `tests/components/weather/HourlyForecast.test.tsx` — blocos + caso vazio.
- [ ] `tests/components/weather/DailyForecast.test.tsx` — dias + caso vazio.
- [ ] `tests/components/weather/WeatherCharts.test.tsx` — render com fallback/mock do
      `ResponsiveContainer` (ResizeObserver já mockado).

## 9. Composição — `app/*`

- [ ] `tests/app/WeatherDashboard.test.tsx` — composição: busca → seleção → clima;
      estados de clima (loading/error/empty/success) com hooks mockados.
- [ ] `tests/app/App.test.tsx` — **atualizar** o smoke test atual (valida o placeholder);
      manter um smoke do dashboard montado.
- [ ] `tests/app/DashboardLayout.test.tsx` — grid responsivo (classes por breakpoint).

## 10. Teste de integração leve (opcional)

- [ ] `http + endpoints + adapter` contra o MSW (sem hooks nem UI), garantindo que os
      contratos DTO batem com os handlers (stack §16).

---

## Critério de conclusão da fase 09

- [ ] `npm run test` passa com a suíte completa.
- [ ] Cobertura adequada por camada (utilizar `vitest --coverage` se desejado — exige instalar
      `@vitest/coverage-v8`; avaliar antes de adicionar dependência).
- [ ] Nenhum teste usa API real (apenas MSW); estados de concorrência cobertos.