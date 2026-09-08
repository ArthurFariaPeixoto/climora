# Fase 03 — Camada `hooks/` (data-fetching + lógica de aplicação)

> `hooks/data/*` é a camada de data-fetching (TanStack Query); `use-city-search` e
> `use-weather` são fachadas finas que traduzem a consulta para
> `idle | loading | success | error | empty` e expõem apenas `models` (ADR-05, ADR-11).
>
> **Referência:** stack §8; arquitetura §5.3, §5.3a, §6, §7; ADR-05/06/09/10.

---

## 1. `src/hooks/data/city-query.ts` — consulta de cidades

**Já existe:** `citySearchKey(term)` (chave `['cities', term]`).

**Concluído (§1, fase 03):**

- [x] Conectar o fetcher `searchCities` (da fase 02) no `queryFn` — hoje lança
      `Not implemented`.
- [x] Usar `options.term` na chave e no fetcher (hoje usa `citySearchKey('')`).
- [x] Usar `options.enabled` para controlar disparo (só busca após validação do termo).
- [x] `staleTime` ≈ **60s** (stack §8).
- [x] `placeholderData: keepPreviousData` para preservar resultados durante refetch.
- [x] Definir `retry` coerente (engolir retry em 4xx? decisão em `main.tsx`/consulta).
- [x] ⚑ anexo-11 (relacionado): `useWeatherQuery`/`useCitySearchQuery` do queryFn propaga
      `AppError`.

## 2. `src/hooks/data/weather-query.ts` — consulta de clima

**Já existe:** `weatherQueryKey(city)` (chave `['weather', { lat, lon, scope }]`),
`WeatherBundle` (tipo).

**Concluído (§2, fase 03):**

- [x] Conectar o fetcher `getWeather` no `queryFn` — hoje lança `Not implemented`.
- [x] Usar `options.city` e `options.enabled` na chamada.
- [x] `staleTime` ≈ **5min** (stack §8).
- [x] `placeholderData: keepPreviousData` (atualização em segundo plano sem apagar dados).
- [x] ⚑ anexo-11 (item 1): `WeatherBundle` tem `daily` mas o repositório retorna `current +
      hourly` — **decidido:** remover `daily` do bundle e derivar no hook `use-weather`
      (opção (a) do anexo), mantendo a query enxuta e os selectors como fonte de derivação.
- [x] Retry/estados conforme ADR-05/06/09.

## 3. `src/hooks/use-city-search.ts` — fachada da busca

**Hoje retorna `{ cities: [], status: 'idle' }` (`use-city-search.ts:13-14`).** Implementado:

- [x] Receber o termo; chamar `useCitySearchQuery` somente quando o termo for **válido**
      (em contraste: termo inválido → `InvalidSearchError`, sem requisição — arquitetura §9).
- [x] Usar `validateSearchTerm` (fase 01) antes de disparar.
- [x] Traduzir estados da query → taxonomia canônica:
  - [x] `idle` (nenhum termo submetido);
  - [x] `loading` (consulta pendente);
  - [x] `success` (dados → `City[]`);
  - [x] `empty` (`success` sem resultados);
  - [x] `error` (traduzido da taxonomia de erros).
- [x] Expor `City[]` + estado (preservando `models`, nunca DTOs).
- [x] Conduzir invalidação/refetch quando o termo muda (chave nova descarta/cancela a antiga —
      ADR-06).
- [x] Criar testes em `tests/hooks/use-city-search.test.tsx` (ver fase 09 para o mapa completo).

## 4. `src/hooks/use-weather.ts` — fachada do clima

**Hoje retorna `{ status: 'idle' }` (`use-weather.ts:12-13`).** Implementado:

- [x] Receber a cidade selecionada (`WeatherRequest | null`); `null` → estado `idle`.
- [x] Montar `WeatherRequest` a partir de `City` selecionada (`lat`, `lon`, escopo) —
      chave da consulta (montagem no chamador — `WeatherDashboard`, fase 07; o modelo
      `City` pertence à busca, `endpoints.ts`).
- [x] Chamar `useWeatherQuery` com `enabled` (cidade presente) — chave inerte/sentinela
      quando `null` (rules-of-hooks).
- [x] Traduzir estados → `idle/loading/success/empty/error`; `empty` = sucesso sem dados
      (defensivo: o TanStack rejeita payload `undefined` e o contrato garante `current`,
      então de facto inalcançável — anexo-11 item 14).
- [x] Expor para a UI: `current` (`CurrentWeather | null`), `hourly` (`HourlyForecast[]`),
      `daily` (`DailyForecast[]`, **derivado** via `groupHourlyByDay` — anexo-11 item 1,
      único ponto de derivação) + estado canônico.
- [x] Expor `refetch`/`isFetching` para o retry e indicador de atualização em segundo plano.
- [x] Tratar concorrência: selecionar cidade nova enquanto anterior está em voo → descarta/cancela
      (ADR-06).
- [x] Criar testes em `tests/hooks/use-weather.test.tsx`.

---

## Critério de conclusão da fase 03

- [x] `npm run typecheck` e `npm run lint` passam.
- [x] Testes de `hooks/*` criados e passando (`npm run test`).
- [x] Nenhum `Not implemented` restante em `src/hooks/`.
- [x] Hooks expõem somente `models` + estados canônicos (ADR-11) — revisar que nenhum DTO
      vaza.