# AGENTS.md

Dashboard de clima (frontend-only, API OpenWeather) — trabalho de pós-graduação. Docs e comentários em pt-BR.

## Ao finalizar QUALQUER atividade — OBRIGATÓRIO

1. Revise `docs/checklists/todos/*` e marque `- [x]` cada item concluído (não conclua checkboxes sem verificação real).
2. Atualize `README.md` e este arquivo com o que mudou (novos scripts, comportamento, decisões) caso seja necessário.
3. Antes de iniciar uma nova fase, leia `00-indice-e-orientacoes.md` para conhecer a ordem e o gatilho de validação das fases. Itens `⚑ anexo-11` exigem ler a decisão pendente em `11-inconsistencias-e-decisoes.md` antes de executar.

Regra de ouro (fase 00 §2): uma fase só termina com todos os checkboxes marcados E `npm run typecheck` + `npm run lint` + `npm run test` verdes; `npm run build` ao final da fase 07 e após mudanças estruturais.

## Fontes de verdade

- `docs/decisoes_arquiteturais.md` — arquitetura e ADRs (fonte de verdade arquitetural).
- `docs/stack_definida.md` — stack tecnológica (fonte de verdade tecnológica).
- Não altere essas docs silenciosamente; divergências reais → registrar/ajustar com justificativa.

## Arquitetura (regras inegociáveis)

- `models/` é o contrato de domínio; não depende de ninguém. UI só consome `models`.
- `services/*` é a ÚNICA camada que conhece a API, DTOs e a chave (`services/http` é o único que lê `VITE_WEATHER_API_KEY`).
- `components/*` NUNCA importa `services/`, DTOs nem data-fetching — só via hooks de feature (`use-city-search`, `use-weather`).
- `services/adapters/*` = funções puras DTO → modelo. `utils/*` = funções puras testáveis sem mock.
- Sem estado global (sem Redux/Zustand); TanStack Query é data-fetching. `src/mocks/` (MSW) é somente para testes, nunca produção.

## Convenções

- Datas: apenas via `dayjs` + plugin `utc` (`src/utils/format/dayjs.ts`) com unix/UTC — nunca hora local do ambiente.
- Estado atual: bootstrap (fase 00) concluído; fase 01 (camada `utils/`) concluída
  (validação, formatadores, selectors e taxonomia de erros com `getErrorMessage`;
  §3 opcional não implementado). Fase 02 em andamento — §3 concluído:
  `services/adapters/*` implementados (DTO → modelo, unidades e validação → `InvalidDataError`,
  testes em `tests/services/adapters/`); §4 concluído: `classifyHttpError` implementado
  (duck-typing `isAxiosError`, passthrough p/ não-axios, `null` p/ `ERR_CANCELED`,
  rede/timeout/401/404/429/5xx → taxonomia, fallback `ServerError`, testes em
  `tests/services/http/`); §5 concluído: `api-client.ts` com interceptor de **resposta** como
  ponto único de classificação (erros propagados sempre `AppError`; abort `ERR_CANCELED`
  repassado como erro original — concorrência ADR-06), `appid` no request, fail-early da
  chave mantido (anexo-11 item 3) e `.env.test` commitado (chave fake) para os testes de
  integração MSW (`tests/services/http/api-client.test.ts`: feliz+endpoints+adapter, 404,
  abort); §6 concluído: `repositories/` implementados (`searchCities` com `GET /geo/1.0/direct`
  → `City[]`, `[]` p/ vazio/404; `getWeather(request: WeatherRequest)` com escopo
  `current`/`current+forecast` → `WeatherResult { current, hourly }` sem `daily`, blocos 3h →
  `HourlyForecast[]`; ambos respeitam `AbortSignal` — ADR-06, e propagam `AppError`; testes
  MSW em `tests/services/repositories/*.test.ts`). Fase 02 concluída (§1–§6) — sem
  `Not implemented` restante em `src/services/`. Fase 03 em andamento — §1 concluído:
  `city-query.ts` conecta `searchCities` no `queryFn` (com `signal` do TanStack — ADR-06),
  usa `options.term` na chave e no fetcher, `enabled` controlado pela fachada, `staleTime`
  ~60s, `placeholderData: keepPreviousData` e `retry` por consulta que só reexecuta erros
  transitórios (`network`/`timeout`/`server`, máx. 2) — 4xx/`invalid-data`/abort sem retry
  (decisão registrada no anexo-11 item 5; default global `retry: 1` mantido em `main.tsx`).
  §2 concluído: `weather-query.ts` conecta `getWeather(options.city, signal)`, `WeatherBundle`
  sem `daily` (derivação no `use-weather` — anexo-11 item 1), `staleTime` ~5min,
  `keepPreviousData` e mesmo `retry` de §1; `isRetryableAppError` extraído para `utils/errors`
  (função pura compartilhada pelas queries); `getWeather`/**`buildWeatherQuery`** refatorados
  para receber `WeatherRequest` (o modelo `City` não é mais necessário p/ clima — testes de
  `services/repositories` e `services/endpoints` atualizados).
  §3 concluído: fachada `use-city-search.ts` (`useCitySearch(term)`) só dispara
  `useCitySearchQuery` com termo válido (termo inválido → `InvalidSearchError`, sem
  requisição), traduz estados da query → `idle/loading/success/empty/error` com `City[]` +
  `error: AppError | null` + `isFetching`/`refetch` (preserva `models`; ADR-06 p/ troca de
  termo) — testes em `tests/hooks/use-city-search.test.tsx` (repositório mockado +
  QueryClient com `retry: false`; caso de `loading` com promise controlada em `act`; erro
  com `AppError` não-transitório p/ evitar retry nos testes). Fase 03 concluída — §4:
  fachada `use-weather.ts` recebe `WeatherRequest | null` (`null` → `idle`, chave inerte
  quando desabilitada — rules-of-hooks), traduz → `idle/loading/success/error` (`empty`
  defensivo, anexo-11 item 14), deriva `daily` via `groupHourlyByDay` (único ponto de
  derivação — anexo-11 item 1), expõe `current`/`hourly`/`daily` + `error`/`isFetching`/
  `refetch`; testes em `tests/hooks/use-weather.test.tsx` (mesmo arranjo da busca; troca de
  cidade exercita chave nova/ADR-06). Sem `Not implemented` em `src/hooks/`.

## Comandos

- `npm run dev` · `npm run build` (typecheck + build em `dist/`)
- `npm run typecheck` · `npm run lint` · `npm run format`
- `npm run test` (uma vez) · `npm run test:watch`
- Ambiente: Node 20.19+/22.12+, npm; `.npmrc` tem `legacy-peer-deps=true` (bug do arborist — não remover).
- `.env` local a partir de `.env.example`; nunca commitar. `.env.test` (chave fake +
  baseURL `http://localhost:3003`) é commitado e carregado pelo Vitest para os testes de
  integração MSW. Testes usam MSW com `onUnhandledRequest: 'error'` (toda chamada precisa de
  handler) e `ResizeObserver` mockado em `tests/setup.ts`.
