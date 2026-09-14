# Fase 09 — Testes por camada (suíte completa)

> Mapa completo de `docs/stack_definida.md` §16 + `docs/decisoes_arquiteturais.md` §11.1.
> Testar estados (success/loading/error/empty/concorrência), não só o caminho feliz.
> Nenhum teste depende de API real.
> Testar bastante Edge Cases.
> Caso os testes ja existam e cubram o especificado, apenas marque o checkbox
> A meta aqui NÃO é escrever centenas de testes, mas sim garantir **cobertura de estado e de fluxo** por camada, com poucos exemplos representativos.
> **Referência:** stack §16 (tabela das camadas); arquitetura §11.

---

## 1. `utils/` — funções puras (sem mock)

- [x] `tests/utils/validation.test.ts` — regras de validação do termo.
- [x] `tests/utils/format.test.ts` — temperatura, vento/direção, umidade, pressão, hora/dia
      pt-BR, timestamps UTC.
- [x] `tests/utils/selectors.test.ts` — `groupHourlyByDay` (agregação, ordenação, vazio).
- [x] `tests/utils/errors.test.ts` — mensagem/ícone por tipo de erro.

## 2. `services/adapters` — DTO → modelo (fixtures)

- [x] `tests/services/adapters/city.adapter.test.ts` — mapeamento feliz + campos ausentes.
- [x] `tests/services/adapters/weather.adapter.test.ts` — feliz (m→km, m/s→km/h, pop→%) +
      payloads corrompidos → `InvalidDataError`.

## 3. `services/http` — classificação de erros (MSW / AxiosError injectado)

- [x] `tests/services/http/errors.test.ts` — `classifyHttpError`: rede, timeout, cancelado,
      401, 404, 429, 5xx, desconhecido.
- [x] `tests/services/http/api-client.test.ts` — `baseURL`, `appid` injetado, timeout e
      abort via `signal` (MSW em nível de rede).

## 4. `services/repositories` — orquestração (MSW)

- [x] `tests/services/repositories/city-repository.test.ts` — sucesso (`City[]`), vazio (`[]`),
      404 → `NotFoundError`, 500 → `ServerError`, abort.
- [x] `tests/services/repositories/weather-repository.test.ts` — `current` vs
      `current+forecast`, normalização, erros propagados.

## 5. Camada de data-fetching — `hooks/data/*` (QueryClient isolado + repositórios mockados)

- [x] `tests/hooks/data/city-query.test.tsx` — chave `['cities', term]`, cache/hit-miss,
      dedup em voo, invalidação por termo, `enabled`, refetch, staleTime, keepPreviousData.
- [x] `tests/hooks/data/weather-query.test.tsx` — chave por `WeatherRequest`, staleTime,
      keepPreviousData, cancelamento/descarte ao trocar cidade, refetch.

## 6. Hooks de feature — tradução de estados (camada de data-fetching simulada)

- [x] `tests/hooks/use-city-search.test.tsx` — `idle/loading/success/empty/error`;
      termo inválido → `InvalidSearchError` sem requisição.
- [x] `tests/hooks/use-weather.test.tsx` — estados traduzidos, `daily` derivado,
      `refetch`, troca de cidade (concorrência).

## 7. `components/ui` e `components/state` — props diretas (sem mock)

- [x] `tests/components/ui/Button.test.tsx` — variantes, disabled, onClick.
- [x] `tests/components/ui/Card/MetricTile/Skeleton.test.tsx` — renderização por props.
- [x] `tests/components/state/LoadingState.test.tsx` / `ErrorState.test.tsx` /
      `EmptyState.test.tsx` — mensagens, retry condicional, roles.

## 8. `components/search` e `components/weather` — estadodes + interação (hooks mockados)

- [x] `tests/components/search/SearchBar.test.tsx` — digitar, submeter, teclado, selecionar.
- [x] `tests/components/search/SearchResults.test.tsx` — 4 estados + lista.
- [x] `tests/components/search/SearchResultItem.test.tsx` — render + `onSelect`.
- [x] `tests/components/weather/CurrentWeatherCard.test.tsx` — dados formatados + ícone.
- [x] `tests/components/weather/MetricsGrid.test.tsx` — métricas exibidas.
- [x] `tests/components/weather/HourlyForecast.test.tsx` — blocos + caso vazio.
- [x] `tests/components/weather/DailyForecast.test.tsx` — dias + caso vazio.
- [x] `tests/components/weather/WeatherCharts.test.tsx` — render com fallback/mock do
      `ResponsiveContainer` (ResizeObserver já mockado).

## 9. Composição — `app/*`

- [x] `tests/app/WeatherDashboard.test.tsx` — composição: busca → seleção → clima;
      estados de clima (loading/error/empty/success) com hooks mockados.
- [x] `tests/app/App.test.tsx` — **atualizar** o smoke test atual (valida o placeholder);
      manter um smoke do dashboard montado.
- [x] `tests/app/DashboardLayout.test.tsx` — grid responsivo (classes por breakpoint).

## 10. Teste de integração leve (opcional)

- [x] `http + endpoints + adapter` contra o MSW (sem hooks nem UI), garantindo que os
      contratos DTO batem com os handlers (stack §16).

---

## Critério de conclusão da fase 09

- [x] `npm run test` passa com a suíte completa.
- [x] Cobertura adequada por camada (utilizar `vitest --coverage` se desejado — exige instalar
      `@vitest/coverage-v8`; avaliar antes de adicionar dependência).
- [x] Nenhum teste usa API real (apenas MSW); estados de concorrência cobertos.