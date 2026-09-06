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
- **Resolução:** na **fase 03**, escolher o ponto único de derivação:
  - (a) remover `daily` de `WeatherBundle` e derivá-lo no hook `use-weather`; ou
  - (b) derivar no `queryFn` e manter `daily` no bundle.
  Norma sugerida: (a) — mantém a query enxuta e os selectors como fonte de derivação (§5.6).
- **Checkbox afetado:** `03-camada-hooks.md` §2 e §4.

## Item 2 — `validateSearchTerm` retorna `string | null` em vez de usar a taxonomia

- **Onde:** `src/utils/validation/index.ts:7`.
- **Conflito:** a arquitetura §9 prevê `InvalidSearchError` para busca inválida; o retorno
  genérico de string perde o "tipo" para a UI responder por estado.
- **Resolução:** na **fase 01**, padronizar o retorno (ex.: `{ valid: true }` /
  `{ valid: false, reason: InvalidSearchError }`) ou manter `string | null` e construir o
  `InvalidSearchError` no hook. Escolher **um** contrato e documentar no teste.
- **Checkbox afetado:** `01-camada-utils.md` §1.

## Item 3 — `api-client.ts` lança erro no load do módulo sem chave

- **Onde:** `src/services/http/api-client.ts:19-23`.
- **Comportamento atual:** sem `VITE_WEATHER_API_KEY`, o próprio import do módulo quebra a
  aplicação ("fail early", coerente com stack §18).
- **Avaliação:** na **fase 02**, confirmar se o fail-early é mantido (recomendado) ou se a
  ausência de chave vira `UnauthorizedError` tratado na UI. Se mantido, garantir mensagem
  clara no `.env.example`/README.
- **Checkbox afetado:** `02-camada-servicos.md` §5.

## Item 4 — Contrato DTO pode estar incompleto vs resposta real da OpenWeather

- **Onde:** `src/services/dtos/index.ts` (ex.: `ForecastBlockDto` sem `dt_txt`, sem
  `rain`/`snow`/`clouds`; `CurrentWeatherDto` sem `sys`, `clouds`).
- **Impacto:** campos não usados não precisam existir — só adicionar se os adapters ou
  gráficos precisarem. Revisar antes de implementar os adapters (fase 02).
- **Checkbox afetado:** `02-camada-servicos.md` §1.

## Item 5 — Defaults globais do `QueryClient` vs `staleTime` por consulta

- **Onde:** `src/main.tsx:9-16` (`staleTime: 0`, `retry: 1`) — enquanto as queries definem
  `staleTime` (~60s/5min).
- **Avaliação:** na **fase 03/07**, alinhar: manter default `staleTime: 0` (seguro) e
  `retry` por consulta, ou subir default com exceções. Evitar `refetchOnWindowFocus`
  surpreendente em avaliação/banca.
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
- **Resolução:** na **fase 05/07**, definir e testar o contrato (`onSelect` + estado do
  termo) — sem estado global.
- **Checkbox afetado:** `05-feature-busca.md` §1; `07-composicao-dashboard.md` §1.

## Item 10 — estado de validação no início da execução dos checklists

- **Linha de base registrada (commit `046231c`):** `npm run lint` OK, `npm run typecheck`
  OK, `npm run test` 1/1 (smoke). Garanta que cada fase conserve esses verdes antes de
  avançar.