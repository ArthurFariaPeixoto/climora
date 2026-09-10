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
  cidade exercita chave nova/ADR-06). Sem `Not implemented` em `src/hooks/`. Fase 04 concluída —
  §1 concluído: `src/mocks/fixtures/` criado (`dto.ts`: DTOs válidos — cidades
  com/sem `state`/`local_names`, clima atual + variante chuva, previsão com builder de 40
  blocos/5 dias e payloads corrompidos p/ adapters; `models.ts`: modelos prontos — `City[]`,
  current/hourly/daily; `scenarios.ts`: termos de busca, `WeatherRequest` e corpos de erro
  404/429/500; barrel `index.ts`). Testes das fases 02–03 migrados de fixtures inline para
  `@/mocks/fixtures` (adapters, repositories, api-client, hooks). §2 concluído:
  `src/mocks/handlers/index.ts` com handlers padrão (`geocodingHandler` por `q`,
  `currentWeatherHandler`, `forecastHandler` — URLs absolutas via `VITE_WEATHER_API_BASE_URL`,
  pois o adapter Node do MSW não casa paths relativos) + handlers de erro parametrizáveis
  por cenário (404/429/500 e network via `HttpResponse.error()` — `server.use` por teste;
  timeout avaliado e **não** simulado em rede, coberto por unit em `errors.test.ts`).
  `city-repository.test.ts` passa a exercitar os handlers padrão no fluxo feliz/`empty` e
  ganhou cenários de 429/500/network; `weather-repository.test.ts` usa `weatherNotFoundHandler`
  e ganhou 429; happy paths do clima mantêm handlers inline (default da previsão = 40 blocos).
  §3 concluído: camada de data-fetching de teste em `src/mocks/testing/` (arquitetura
  §5.7/§11.2) — `createTestQueryClient()` (`QueryClient` por teste com `retry: false` +
  `gcTime: 0`, overrides p/ queries da fase 09), `createQueryClientWrapper(client)` p/
  `renderHook({ wrapper })` e `deferred<T>()` p/ induzir `loading` (transição
  `loading → success/error` via `act`). Testes `use-city-search`/`use-weather` refatorados
  p/ usar os helpers (repositórios seguem mockados por arquivo — `vi.mock` hoisted);
  `success`/`empty`/`error` via `mockResolvedValueOnce`/`mockRejectedValueOnce` com fixtures.
  §4 concluído (validação, sem código): `ResizeObserver` mockado (setup.ts), regra
  `onUnhandledRequest: 'error'` forte garantida e suíte completa (14 arquivos / 180 testes,
  smoke `App` incluso) verde **sem rede real** — critérios de conclusão da fase 04 atendidos
  (`typecheck` + `lint` + `test`).
  Fase 05 em andamento — §1 a §3 concluídos: `SearchBar` implementado (colapsa
  `use-city-search` — anexo-11 item 9; `draft`/`submittedTerm` como estados de UI; submissão
  via formulário; combobox WAI-ARIA com `aria-expanded`/`aria-controls`/`aria-activedescendant`,
  setas com wrap, Enter seleciona/submete, Escape e Tab fecham; `onBlur` verifica
  `relatedTarget` p/ não fechar ao clicar dentro do painel). `SearchResults` renderiza os 4
  estados (`LoadingState` em `role="status"`, `ErrorState` com retry só p/ transitórios via
  `onRetry`/`refetch`, `EmptyState` "Nenhuma cidade encontrada", `listbox` com
  `max-h-72`/scroll); `SearchResultItem` é botão `role="option"` com `aria-selected`,
  `name`/`state?`/`country` e destaque visual — contrato de `SearchResultsProps` definido
  (apresentação pura por props). Testes: `tests/components/search/SearchBar.test.tsx`,
  `SearchResults.test.tsx` (4 estados + interação) e `SearchResultItem.test.tsx`
  (`use-city-search` mockada). Infra de teste: `cleanup` explícito adicionado em
  `tests/setup.ts` (Vitest com `globals: false` não registra o auto-cleanup do RTL).
  Fase 06 em andamento — §1 concluído: `CurrentWeatherCard` implementado (props
  `{ current, cityName? }`, `Card` fluido `h-full` — ADR-08 — com temperatura grande via
  `formatTemperature`, sensação térmica, condição `description` + ícone e "Observado em
  {formatObservedAt}"). Mapeamento `condição → ícone` materializado no anexo-11 item 11:
  `components/weather/condition-icon.ts` (`getConditionIcon` por `id` 2xx–7xx/800–804,
  fallback `main`) + `ConditionIcon.tsx` (render via `createElement` p/ satisfazer
  `react-hooks/static-components`; `aria-hidden`). Testes em
  `tests/components/weather/CurrentWeatherCard.test.tsx` (props puras com fixtures —
  temperatura/observação checados contra os formatadores puros, ícone via `.lucide-*`).
  §2 concluído: `MetricsGrid` implementado (prop `{ current }`, `Card` + grade **fluida**
  `grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]` — anexo-11 item 15, decisão ADR-08 em
  vez do `sm:grid-cols-*` literal — com 7 `MetricTile`: umidade, vento (velocidade +
  direção "18 km/h · S"), mín/máx, pressão, precipitação **condicional** (ausente quando
  `precipitationPct` indefinido — anexo-11 item 4) e visibilidade; ícones lucide estáticos
  por prop). Adicionados `formatPrecipitation` e `formatVisibility` em `utils/format`
  (funções puras — anexo-11 item 16) + fixture `currentWeatherWithPrecipModel`. Testes:
  `tests/components/weather/MetricsGrid.test.tsx` (valores via formatadores puros, tile
  condicional presente/ausente, ícones `.lucide-*`) e `tests/utils/format.test.ts`
  (clamp/arredondamento).
  §3 concluído: `HourlyForecast` implementado (prop `{ hourly }`, `Card` + heading
  "Previsão por hora" + lista horizontal com scroll `ul`/`li` — ADR-08; blocos com hora
  via `formatHour`, `ConditionIcon`, temperatura e precipitação; vazio → `EmptyState`
  "Previsão horária indisponível.", arquitetura §9.2). `getConditionIcon` estendido p/
  aceitar `string` (`getConditionIconFromText`): o adapter entrega a **descrição** da API
  nas previsões, então o matching por keywords cobre descrições pt-BR ("Chuva leve",
  "Nevoeiro", "Tempestade"…) e categorias em inglês/fixture ('Sun', 'Rain', 'Fog',
  'Clear') — anexo-11 item 11. Testes em `tests/components/weather/HourlyForecast.test.tsx`
  (blocos + ícones por categoria e por descrição real + caso vazio).
  §4 concluído: `DailyForecast` implementado (prop `{ daily }`, `Card` + heading
  "Previsão diária" + lista horizontal com scroll `ul`/`li` — ADR-08; cada dia com
  `formatWeekday`, `ConditionIcon`, mín/máx (`formatTemperature`) e precipitação; vazio →
  `EmptyState` "Previsão diária indisponível."). §6 concluído: mapeamento `condition →
  ícone` (`condition-icon.ts` + `ConditionIcon.tsx`, anexo-11 item 11) aplicado nos três
  widgets sem duplicação. Testes em `tests/components/weather/DailyForecast.test.tsx`
  (dias + range de temperatura + ícones por categoria e por descrição real + caso vazio).
  §5 concluído: `WeatherCharts` implementado (**default export** p/ `React.lazy` —
  wrapper/`Suspense`/chunk no build ficam na fase 07, golden rule), props
  `{ hourly, daily? }` (`daily` reservado; linha diária opcional dispensada — decisão de
  escopo), `Card` + heading "Temperatura e precipitação por hora" + `ResponsiveContainer`
  (`ComposedChart`: linha `temperatureC` em eixo °C + barras `precipitationPct` em eixo %;
  `CartesianGrid`/`Tooltip`; animação desligada p/ testes); acessibilidade via
  `role="img"` + `aria-label` + heading (Recharts v3 não expõe `accessibilityLayer`);
  vazio → `EmptyState` "Gráfico indisponível." (arquitetura §9.2). Dados derivados por
  `toHourlyChartData` em `utils/selectors` (arquitetura §5.6 — sem montar dados brutos no
  componente). Testes em `tests/components/weather/WeatherCharts.test.tsx` (mock apenas do
  `ResponsiveContainer` via `importOriginal`, dimensionado 600×300; labels `formatHour`,
  barras só p/ precipitação > 0, `aria-label`, caso vazio) e `toHourlyChartData` em
  `tests/utils/selectors.test.ts`. `src/components/weather/` sem `null`/`Not implemented`.
  Fase 06 concluída (§1–§6) nos itens de componentes/testes; o critério de lazy (chunk
  separado) e o `npm run build` são validados na fase 07.
  Fase 07 em andamento — §1 concluído: `WeatherDashboard` implementado (arquitetura §5.1):
  cidade selecionada via `useState` (elo fases A→B, §6), `use-weather` consumido a partir
  de `WeatherRequest` montado inline de `City` (`lat`/`lon`/`scope: 'current+forecast'` —
  decisão fase 03 §3), `SearchBar` (sem prop-drilling; `SearchResults` fica no próprio
  `SearchBar` — anexo-11 item 9), estados `idle`/`loading`/`error`/`empty`/`success` com
  `EmptyState`/`LoadingState`/`ErrorState` (retry só p/ transitórios), widgets
  `CurrentWeatherCard`/`MetricsGrid`/`HourlyForecast`/`DailyForecast` +
  `WeatherCharts` **lazy** (`React.lazy` + `<Suspense>` só no gráfico — §13), blocos em
  coluna fluida sem breakpoints (ADR-08; grade é do §2/DashboardLayout). Testes em
  `tests/app/WeatherDashboard.test.tsx` (hooks mockados — fase 09 — cobrem idle,
  busca→seleção→clima, loading, erro transitório/não-transitório e empty).
  §2 concluído: `DashboardLayout` implementado (arquitetura §5.1/§12, ADR-08) — shell
  responsivo com header (`<h1>` "Climora" — promovido de marca não-heading no §3 ao
  remover o placeholder do `App`), `<main>` com `max-w-6xl`/padding consistente e
  grade `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` p/ `children`. Composição delegada ao
  `App` (§3). Grade declarada e testável por classes; a disposição multi-coluna visual dos
  widgets fica explícita p/ a fase 08 (polimento). Testes em
  `tests/app/DashboardLayout.test.tsx` (banner/marca/children + classes de grid).
  §3 concluído: `App` substituiu o placeholder por `DashboardLayout` + `WeatherDashboard`
  (arquitetura §5.1), h1 "Climora" agora vive no header; `WeatherDashboard` usa
  `col-span-full` na raiz p/ ocupar a largura total da grade (single-column até a fase 08).
  Smoke `tests/app/App.test.tsx` atualizado: render com `QueryClientProvider` de teste
  (`createTestQueryClient`) — no estado inicial os hooks reais não disparam requisição
  (idle), zero chamadas MSW; valida h1 no header + combobox + prompt inicial (placeholder
  removido).
  §4 concluído: `main.tsx` com defaults de provider fechados (anexo-11 item 5 resolvido na
  fase 07 §4) — `staleTime: 0` global mantido (validade vem do `staleTime` por consulta
  60s/5min), `retry: 1` mantido (rede de segurança global; features têm retry
  transitório-only máx. 2) e `refetchOnWindowFocus: false` adicionado (refetch
  determinístico — só explícito: busca, troca de cidade, `retry`; nada de refetch por foco
  da janela em dev/banca). `<Suspense>` do gráfico lazy permanece no `WeatherDashboard`
  (sem fallback global). Fase 07 §1–§4 concluídos.
  Critérios de conclusão da fase 07: 4/5 fechados — suíte completa 25 arquivos / 244 testes
  verde, build com chunk separado do gráfico e fluxo ponta a ponta sob MSW exercitado por
  `tests/app/weather-flow.test.tsx` (integração com hooks reais: busca → seleção → clima,
  e cenário de erro 500 → retry → recuperação). **Pendente:** fluxo manual no navegador
  (`.env` presente — verificado pelo usuário, item final da fase).

## Comandos

- `npm run dev` · `npm run build` (typecheck + build em `dist/`)
- `npm run typecheck` · `npm run lint` · `npm run format`
- `npm run test` (uma vez) · `npm run test:watch`
- Ambiente: Node 20.19+/22.12+, npm; `.npmrc` tem `legacy-peer-deps=true` (bug do arborist — não remover).
- `.env` local a partir de `.env.example`; nunca commitar. `.env.test` (chave fake +
  baseURL `http://localhost:3003`) é commitado e carregado pelo Vitest para os testes de
  integração MSW. Testes usam MSW com `onUnhandledRequest: 'error'` (toda chamada precisa de
  handler) e `ResizeObserver` mockado em `tests/setup.ts`.
