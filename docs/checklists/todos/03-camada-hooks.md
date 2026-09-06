# Fase 03 — Camada `hooks/` (data-fetching + lógica de aplicação)

> `hooks/data/*` é a camada de data-fetching (TanStack Query); `use-city-search` e
> `use-weather` são fachadas finas que traduzem a consulta para
> `idle | loading | success | error | empty` e expõem apenas `models` (ADR-05, ADR-11).
>
> **Referência:** stack §8; arquitetura §5.3, §5.3a, §6, §7; ADR-05/06/09/10.

---

## 1. `src/hooks/data/city-query.ts` — consulta de cidades

**Já existe:** `citySearchKey(term)` (chave `['cities', term]`).

Pendente (TODO em `city-query.ts:23-25`):

- [ ] Conectar o fetcher `searchCities` (da fase 02) no `queryFn` — hoje lança
      `Not implemented`.
- [ ] Usar `options.term` na chave e no fetcher (hoje usa `citySearchKey('')`).
- [ ] Usar `options.enabled` para controlar disparo (só busca após validação do termo).
- [ ] `staleTime` ≈ **60s** (stack §8).
- [ ] `placeholderData: keepPreviousData` para preservar resultados durante refetch.
- [ ] Definir `retry` coerente (engolir retry em 4xx? decisão em `main.tsx`/consulta).
- [ ] ⚑ anexo-11 (relacionado): `useWeatherQuery`/`useCitySearchQuery` do queryFn propaga
      `AppError`.

## 2. `src/hooks/data/weather-query.ts` — consulta de clima

**Já existe:** `weatherQueryKey(city)` (chave `['weather', { lat, lon, scope }]`),
`WeatherBundle` (tipo).

Pendente (TODO em `weather-query.ts:32-34`):

- [ ] Conectar o fetcher `getWeather` no `queryFn` — hoje lança `Not implemented`.
- [ ] Usar `options.city` e `options.enabled` na chamada.
- [ ] `staleTime` ≈ **5min** (stack §8).
- [ ] `placeholderData: keepPreviousData` (atualização em segundo plano sem apagar dados).
- [ ] ⚑ anexo-11 (item 1): `WeatherBundle` tem `daily` mas o repositório retorna `current +
      hourly` — **decidir** onde o `daily` entra: derivar via `groupHourlyByDay` no próprio
      `queryFn` (e remover `daily` do bundle) OU deixar o hook `use-weather` derivar. Escolher
      um lugar único.
- [ ] Retry/estados conforme ADR-05/06/09.

## 3. `src/hooks/use-city-search.ts` — fachada da busca

**Hoje retorna `{ cities: [], status: 'idle' }` (`use-city-search.ts:13-14`).** Implementar:

- [ ] Receber o termo; chamar `useCitySearchQuery` somente quando o termo for **válido**
      (em contraste: termo inválido → `InvalidSearchError`, sem requisição — arquitetura §9).
- [ ] Usar `validateSearchTerm` (fase 01) antes de disparar.
- [ ] Traduzir estados da query → taxonomia canônica:
  - [ ] `idle` (nenhum termo submetido);
  - [ ] `loading` (consulta pendente);
  - [ ] `success` (dados → `City[]`);
  - [ ] `empty` (`success` sem resultados);
  - [ ] `error` (traduzido da taxonomia de erros).
- [ ] Expor `City[]` + estado (preservando `models`, nunca DTOs).
- [ ] Conduzir invalidação/refetch quando o termo muda (chave nova descarta/cancela a antiga —
      ADR-06).
- [ ] Criar testes em `tests/hooks/use-city-search.test.ts` (ver fase 09 para o mapa completo).

## 4. `src/hooks/use-weather.ts` — fachada do clima

**Hoje retorna `{ status: 'idle' }` (`use-weather.ts:12-13`).** Implementar:

- [ ] Receber a cidade selecionada (`WeatherRequest | null`); `null` → estado `idle`.
- [ ] Montar `WeatherRequest` a partir de `City` selecionada (`lat`, `lon`, escopo) —
      chave da consulta.
- [ ] Chamar `useWeatherQuery` com `enabled` (cidade presente).
- [ ] Traduzir estados → `idle/loading/success/empty/error`; `empty` = sucesso sem dados.
- [ ] Expor para a UI: `current` (`CurrentWeather | null`), `hourly` (`HourlyForecast[]`),
      `daily` (`DailyForecast[]`, derivado via `groupHourlyByDay` — a menos que decidido no
      `queryFn`, ver anexo-11 item 1) + estado canônico.
- [ ] Expor `refetch`/`isFetching` para o retry e indicador de atualização em segundo plano.
- [ ] Tratar concorrência: selecionar cidade nova enquanto anterior está em voo → descarta/cancela
      (ADR-06).
- [ ] Criar testes em `tests/hooks/use-weather.test.ts`.

---

## Critério de conclusão da fase 03

- [ ] `npm run typecheck` e `npm run lint` passam.
- [ ] Testes de `hooks/*` criados e passando (`npm run test`).
- [ ] Nenhum `Not implemented` restante em `src/hooks/`.
- [ ] Hooks expõem somente `models` + estados canônicos (ADR-11) — revisar que nenhum DTO
      vaza.