# Anexo — Inconsistências e decisões pendentes

> Registro das inconsistências detectadas na verificação do código. **Resolva cada item na
> fase indicada** (`⚑ anexo-11` nos respectivos checklists), não no fim do projeto.
> Nenhuma alteração de arquitetura é feita aqui — apenas documentação da decisão.

---

## Item 1 — `WeatherBundle.daily` vs `WeatherResult` sem `daily`

- **Onde:** `src/hooks/data/weather-query.ts:8` (interface `WeatherBundle` inclui `daily`);
  `src/services/repositories/weather-repository.ts:6` (`WeatherResult` tem só
  `current`/`hourly`).
- **Conflito:** a arquitetura/stack determinam que `DailyForecast` é **derivado** por
  `utils/selectors.groupHourlyByDay` dos blocos de 3h (stack §10), não buscado da API.
  Portanto `daily` não deveria vir do repositório/query.
- **Resolução (fase 03, §2):** adotada a opção **(a)** — `WeatherBundle` ficou sem `daily`
  (`{ current, hourly }`); a derivação via `groupHourlyByDay` acontece **apenas** no hook
  `use-weather` (fase 03, §4), que é o único ponto de derivação (arquitetura §5.6). O
  repositório e a query permanecem enxutos, entregando exatamente o que a API provê.
- **Checkbox afetado:** `03-camada-hooks.md` §2 e §4.

## Item 2 — `validateSearchTerm` retorna `string | null` em vez de usar a taxonomia

- **Onde:** `src/utils/validation/index.ts:7`.
- **Conflito:** a arquitetura §9 prevê `InvalidSearchError` para busca inválida; o retorno
  genérico de string perde o "tipo" para a UI responder por estado.
- **Resolução (fase 01):** discriminated union `{ valid: true } | { valid: false; reason: InvalidSearchError }`.
  - `utils/validation` importa `InvalidSearchError` de `utils/errors` (mesma camada — permitido).
  - A origem do erro permanece em `utils/validation` (coerente com §9.1).
  - O hook `use-city-search` (fase 03) apenas propaga `result.reason` quando `!result.valid`.
- **Checkbox afetado:** `01-camada-utils.md` §1.

## Item 3 — `api-client.ts` lança erro no load do módulo sem chave

- **Onde:** `src/services/http/api-client.ts:19-23`.
- **Comportamento atual:** sem `VITE_WEATHER_API_KEY`, o próprio import do módulo quebra a
  aplicação ("fail early", coerente com stack §18).
- **Resolução (fase 02, §5):** **fail-early mantido** (recomendação do anexo). Sem chave, o
  build/dev quebra no load do módulo com mensagem clara ("Copie `.env.example` para `.env`");
  docker da chave nunca chega como `UnauthorizedError` na UI por essa ausência de
  configuração. `.env.example`/README já descrevem a variável como obrigatória.
  Para os testes de integração (MSW), o fail-early é satisfeito por um `.env.test` commitado
  com chave **fake** (`VITE_WEATHER_API_KEY=tests-only-key`) e baseURL de teste
  (`http://localhost:3003`) — Vitest carrega `.env.test` no modo `test`.
- **Checkbox afetado:** `02-camada-servicos.md` §5.

## Item 4 — Contrato DTO pode estar incompleto vs resposta real da OpenWeather

- **Onde:** `src/services/dtos/index.ts` (ex.: `ForecastBlockDto` sem `dt_txt`, sem
  `rain`/`snow`/`clouds`; `CurrentWeatherDto` sem `sys`, `clouds`).
- **Impacto:** campos não usados não precisam existir — só adicionar se os adapters ou
  gráficos precisarem. Revisar antes de implementar os adapters (fase 02).
- **Resolução (fase 02, §1):**
  - DTOs mantidos como **espelho fiel corrigido** da resposta real: conservados `icon`,
    `local_names`, `temp_min`/`temp_max` etc., mesmo que hoje não sejam consumidos;
  - **`pop` removido de `CurrentWeatherDto`** — `/data/2.5/weather` não o retorna
    (confirmado na doc da OpenWeather); `pop` existe apenas nos blocos de previsão
    (`ForecastBlockDto.pop` mantido);
  - campos não usados não adicionados: `dt_txt` (o `time` do modelo sai do unix `dt` via
    dayjs), `rain`/`snow`/`clouds`, `sys`, `wind.gust`;
  - **`CurrentWeather.precipitationPct` tornou-se opcional** no modelo
    (`src/models/CurrentWeather.ts`) — o clima atual não tem fonte para o valor; a UI
    (fase 06) esconde a métrica quando ausente. Consequência para o §3 deste checklist
    (adapter de clima atual): mapear `precipitationPct` somente quando presente.
- **Checkbox afetado:** `02-camada-servicos.md` §1.

## Item 5 — Defaults globais do `QueryClient` vs `staleTime` por consulta

- **Onde:** `src/main.tsx:9-16` (`staleTime: 0`, `retry: 1`) — enquanto as queries definem
  `staleTime` (~60s/5min).
- **Avaliação:** na **fase 03/07**, alinhar: manter default `staleTime: 0` (seguro) e
  `retry` por consulta, ou subir default com exceções. Evitar `refetchOnWindowFocus`
  surpreendente em avaliação/banca.
- **Resolução parcial (fase 03, §1 — `city-query`):** mantido o default global
  `staleTime: 0`/`retry: 1` do `main.tsx`; a consulta de cidades passa a definir `staleTime`
  de ~60s e um `retry` **por consulta** que só reexecuta erros transitórios
  (`network`/`timeout`/`server`, até 2 tentativas) — 4xx (401/429), `invalid-data` e abort
  não são repetidos. Pendente avaliar o default global na fase 07 (§4).
- **Resolução final (fase 07, §4 — `main.tsx`):**
  - `staleTime: 0` **mantido** — default conservador: a validade dos dados vem do
    `staleTime` por consulta (`city-query` ~60s, `weather-query` ~5min); query futura sem
    `staleTime` revalida a data (sem gratuidade de cache).
  - `retry: 1` **mantido** — rede de segurança global; as features já definem retry próprio
    (transitórios-only, máx. 2).
  - `refetchOnWindowFocus: false` **adicionado** — refetch determinístico: acontece apenas
    de forma explícita (nova busca, troca de cidade, `retry`), nunca por foco da janela;
    evita reexecuções surpreendentes em dev/banca/avaliação.
  - `<Suspense>` do gráfico lazy **continua no `WeatherDashboard`** (sem fallback global).
- **Checkbox afetado:** `03-camada-hooks.md` §1/§2 e `07-composicao-dashboard.md` §4.

## Item 6 — Smoke test de `App.test.tsx` valida o placeholder

- **Onde:** `tests/app/App.test.tsx` (busca pelo texto "Weather Dashboard").
- **Necessidade:** atualizar assim que `App` renderizar o dashboard real (fase 07/09) —
  até lá, mantém-se como validação do ambiente.
- **Checkbox afetado:** `07-composicao-dashboard.md` §3, `09-testes-por-camada.md` §9.

## Item 7 — `dist/` existe no repositório local (gitignored)

- **Observação:** `dist/` foi gerado e está no `.gitignore` — sem impacto; não commitar.

## Item 8 — `.prettierignore` ignora `docs/` e `prompts/`

- **Efeito:** os novos checklists em `docs/checklists/todos/` não são formatados pelo
  Prettier — intencional (documentos em markdown fora do escopo de formatação de código).
- **Decisão:** manter; não incluir `docs` no escopo de `format:check`.

## Item 9 — Divisão de estado/composição entre SearchBar/SearchResults/WeatherDashboard

- **Onde:** `components/search/*` colapsam `use-city-search` (stack §12); a cidade
  selecionada sobe ao `WeatherDashboard` (arquitetura §5.1). `SearchBar` guarda o termo
  (estado de UI, §7).
- **A ponderação:** quem renderiza `SearchResults` (o próprio `SearchBar` console com o
  dropdown, ou o `WeatherDashboard`)? Ambos válidos; escolher o de menor prop-drilling
  mantendo ADR-11.
- **Resolução (fase 05, §1):** **`SearchBar` colapsa `use-city-search`** (fluxo `§6`:
  "Usuário digita → SearchBar → use-city-search → … → SearchResults") e guarda o termo em
  dois estados de UI: `draft` (digitado) e `submittedTerm` (submetido, dispara a consulta).
  `SearchResults` é **apresentação pura** por props (`listboxId`, `status`, `cities`,
  `error`, `activeIndex`, `onSelect`, `onActivate`, `onRetry`) — contrato definido na fase
  05 §1, rendering na §2. `SearchResultItem` recebe a cidade + `id` (alvo do
  `aria-activedescendant`), `active`, `onSelect`/`onActivate`. **Ao selecionar**, o
  `SearchBar` limpa `draft`/`submittedTerm` e fecha o painel (decisão §2 "fechar/limpar"). A
  seleção sobe via `onSelect(city)` até `WeatherDashboard` (fase 07) — sem estado global
  (ADR-04/ADR-11). Clique dentro do painel (item/retry) não fecha o painel por blur:
  `onBlur` verifica `relatedTarget` no `panelRef`.
- **Checkbox afetado:** `05-feature-busca.md` §1; `07-composicao-dashboard.md` §1.

## Item 10 — estado de validação no início da execução dos checklists

- **Linha de base registrada (commit `046231c`):** `npm run lint` OK, `npm run typecheck`
  OK, `npm run test` 1/1 (smoke). Garanta que cada fase conserve esses verdes antes de
  avançar.

## Item 11 — domínio do mapeamento `condição → ícone` (lucide-react)

- **Onde:** `01-camada-utils.md` §2; `06-feature-clima.md` §6.
- **Decisão (fase 01):** diferido para a **fase 06**, como **componente de UI** único
  (ex.: `components/weather/`), e **não** em `utils/format`. Motivo: `utils/` é uma camada
  pura sem dependência de UI (§5.6) — lucide-react entrega componentes React de UI.
- **Aplicação:** em `CurrentWeatherCard`, `HourlyForecast` e `DailyForecast` (fase 06), com
  base em `WeatherCondition.id`/`main` — sem duplicar a lógica.
- **Status (fase 06 §1/§3):** mapeamento implementado como componente/layer de UI em
  `src/components/weather/condition-icon.ts` (`getConditionIcon`) + `ConditionIcon.tsx`
  (anexo-11 §5.6: `utils/` permanece puro). Aplicado em `CurrentWeatherCard` (§1). No §3 o
  mapeamento passou a aceitar `string` (`getConditionIconFromText`): o adapter entrega a
  **descrição** da API (`HourlyForecast.condition`, ex.: "Chuva leve"), então o matching por
  keywords cobre descrições pt-BR e categorias em inglês — aplicado em `HourlyForecast`
  (§3) e `DailyForecast` (§4). Aplicação concluída nos três widgets; sem duplicação de
  lógica (fase 06 §6).
- **Checkboxes afetados:** `01-camada-utils.md` §2 (item "condição → ícone", decidido/diferido)
  e `06-feature-clima.md` §6 (item permanece pendente até ser aplicado nos três widgets).

## Item 12 — estratégia de agregação do `groupHourlyByDay`

- **Onde:** `src/utils/selectors/index.ts` (fase 01, §3).
- **Ambiguidade:** o checklist pede `DailyForecast` derivado dos blocos de 3h, mas não define
  a regra de agregação de `humidityPct`/`precipitationPct`/`windSpeedKmh` nem qual bloco elege
  a `condition` representativa.
- **Decisão (fase 01):**
  - `humidityPct`, `precipitationPct` e `windSpeedKmh` = **média** do grupo (sem arredondar —
    clamp/arredondamento ficam nos formatadores de exibição);
  - `minC`/`maxC` = `Math.min`/`Math.max` de `temperatureC`;
  - `condition` = condição do bloco mais próximo do **meio-dia UTC** (distância mínima a
    `inicioDoDia + 12h`); empate → primeiro bloco do dia;
  - `date` = início do dia em UTC (`dayjsFromUnixSeconds(time).startOf('day').unix()`).
- **Checkbox afetado:** `01-camada-utils.md` §3.

## Item 13 — domínio do mapeamento `erro → ícone` (lucide-react)

- **Onde:** `01-camada-utils.md` §4; `08-refinamentos-ui-e-design.md` (estados de interface).
- **Decisão (fase 01):** a taxonomia de erros expõe apenas o mapa **erro → mensagem**
  (`getErrorMessage`); o mapa **erro → ícone** fica a cargo do componente
  `components/state/ErrorState` na **fase 08** (leitura da taxonomia por `kind`).
  Motivo: mesmo racional do item 11 — `utils/` é camada pura sem dependência de UI (§5.6)
  e `lucide-react` entrega componentes React de UI.
- **Checkboxes afetados:** `01-camada-utils.md` §4 (item "erro → ícone", decidido/diferido)
  e `08-refinamentos-ui-e-design.md`.

## Item 14 — `EmptyDataState` (§9.1) não integra a união `AppError`

- **Onde:** `docs/decisoes_arquiteturais.md` §9.1 (tabela lista `EmptyDataState`);
  `src/utils/errors/index.ts` (união `AppError` com 7 tipos, sem `EmptyDataState`).
- **Decisão (fase 01):** manter `EmptyDataState` **fora** de `AppError`. "Sucesso sem dados"
  não é um erro: é um **estado derivado** de `success` sem payload (tipos "empty" das fases
  03/07), tratado por `EmptyState`, não por `ErrorState`. A tabela §9.1 descreve a resposta
  da UI, não um membro da taxonomia tipada.
- **Checkbox afetado:** `01-camada-utils.md` §4; confirmar em `07/08-*`.

## Item 15 — responsividade interna do `MetricsGrid` (grade de `MetricTile`s)

- **Onde:** `docs/checklists/todos/06-feature-clima.md` §2 (texto sugere `grid-cols-2`/
  `sm:grid-cols-3`); ADR-08 e critério da fase 06 ("widgets fluidos, sem conhecimento de
  breakpoint").
- **Conflito:** o literal do §2 (`sm:grid-cols-3`…) faz o widget conhecer viewport via
  breakpoint, o que contraria ADR-08 (breakpoints só em `DashboardLayout` + estilos de UI).
- **Resolução (fase 06, §2):** adotada grade **fluida** `grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]`
  — a grade se adapta à largura do container (ocupando o espaço dado pelo grid) sem
  breakpoint classes no widget. `MetricsGrid` envolve as métricas num `Card`, como o
  `CurrentWeatherCard`. A decisão de _quantas colunas e qual ordem_ por breakpoint
  permanece exclusiva do `DashboardLayout` (fase 07).
- **Checkbox afetado:** `06-feature-clima.md` §2 (texto do bullet ajustado para refletir a decisão).

## Item 16 — formatadores de precipitação e visibilidade fora da fase 01

- **Onde:** `docs/checklists/todos/06-feature-clima.md` §2 (métricas de precipitação e
  visibilidade); `src/utils/format/index.ts` (fase 01 não previa esses formatadores).
- **Decisão (fase 06, §2):** adicionados `formatPrecipitation` (clamp 0–100, "%") e
  `formatVisibility` (km → "10 km") em `utils/format` — funções puras aditivas à camada já
  fechada, mantendo "dados formatados via `utils/format`" sem formatação inline nos
  componentes. A métrica de precipitação é condicional: o clima atual não expõe `pop`
  (item 4), então o tile só aparece quando `precipitationPct` está presente.
- **Checkbox afetado:** `06-feature-clima.md` §2.