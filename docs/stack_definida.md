# Stack Definida — Dashboard de Monitoramento de Clima (Climora)

> **Status:** Aprovada (fase de stack).
> **Escopo:** Definição da stack tecnológica que implementa a arquitetura documentada em `docs/decisoes_arquiteturais.md`. É a **fonte de verdade tecnológica** do projeto e referência para as próximas etapas de implementação.
> **Regra seguida:** arquitetura primeiro, tecnologia depois. Nenhuma decisão arquitetural foi alterada; todas as escolhas abaixo partem da arquitetura existente.

---

## 1. Contexto

O Climora é um dashboard de monitoramento de clima, trabalho de pós-graduação, **exclusivamente frontend**, que consome diretamente uma API externa de clima (busca de cidades, clima atual, previsão por horário e por dia). Não existe backend próprio.

Esta etapa responde à pergunta: **"Quais tecnologias implementam melhor a arquitetura que já foi definida?"** — e não o contrário. A stack é **proporcional** ao escopo acadêmico: pequeno–médio, duas áreas de domínio, ~15 componentes, cobertura de testes por camada.

As alternativas foram avaliadas por: complexidade, impacto na arquitetura, manutenção, performance, DX, tamanho do bundle, testabilidade e adequação acadêmica.

---

## 2. Referência arquitetural

Fonte de verdade consultada integralmente:

- `docs/decisoes_arquiteturais.md` — arquitetura, ADRs, fluxos, estratégias (estado, integração, erros, testes, responsividade, performance, segurança).
- `docs/diagrams/arquitetura.md` — camadas e dependências (D-1).
- `docs/diagrams/fluxo_dados.md` — pipeline de dados (D-2).
- `docs/diagrams/componentes.md` — composição de componentes (D-3).
- `docs/diagrams/sequencia_busca_cidade.md` — interação principal (D-4).
- `docs/diagrams/estados_requisicao.md` — estados de requisição (D-5).

Nenhum desses documentos foi alterado nesta etapa.

---

## 3. Requisitos que influenciam a stack

| Requisito                                                       | Como influencia a stack                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Frontend-only, sem backend                                      | Build e deploy de artefato estático; API Key client-side (limitação documentada) |
| Consumo de API externa por chave (.env/.env.example/.gitignore) | Variáveis `VITE_*` do Vite; provedor com plano gratuito por API key              |
| Busca de cidade + clima atual + previsão por hora/dia           | API com geocodificação e previsão; contratos DTO tipados                         |
| Estados de loading/erro/vazio/concorrência explícitos           | Camada de data-fetching madura (TanStack Query) + taxonomia de erros             |
| Responsividade                                                  | Tailwind confinado à camada de apresentação (`DashboardLayout` + UI)             |
| Componentes reutilizáveis                                       | Componentes próprios (~15), catálogo definido pela arquitetura                   |
| Gráficos quando fizerem sentido                                 | Recharts isolado em `WeatherCharts`, lazy-loaded                                 |
| Testes por camada                                               | Vitest + React Testing Library + MSW, com fronteiras de mock por camada          |
| Lint e formatação obrigatórios                                  | ESLint 9 + Prettier                                                              |

---

## 4. Restrições arquiteturais

| Restrição                                                                                                    | Origem               | Impacto na stack                                              |
| ------------------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------- |
| Camada de data-fetching centralizada (consultas chaveadas, cache, dedup, invalidação, refetch, cancelamento) | §5.3a, D-5           | **TanStack Query** como data-fetching                         |
| Estado sem biblioteca global                                                                                 | §7, ADR-04           | **useState** local + elevado; nenhum Redux/Zustand            |
| Transporte único em `services/http` (baseURL, timeout, key, classificação de erros, abort)                   | §5.4, ADR-06, ADR-12 | **Axios** confinado a `services/`                             |
| UI nunca importa `services/`, DTOs nem data-fetching diretamente                                             | §5.2, ADR-11         | Hooks de feature como única ponte                             |
| Adaptação obrigatória DTO → modelo (funções puras)                                                           | ADR-03               | Adapters TypeScript puros + fixtures em `mocks/`              |
| Contrato de domínio (`models`) compartilhado                                                                 | §5.5                 | **TypeScript strict** — `models` viram interfaces             |
| Taxonomia de erros tipada                                                                                    | ADR-07, §9           | Discriminated unions em `utils/errors`                        |
| Responsividade exclusiva da apresentação                                                                     | ADR-08               | Tailwind restrito a componentes de UI e layout                |
| Testes sem API real; fronteira de mock na data-fetching                                                      | §11                  | Vitest + MSW + QueryClient com retry desativado               |
| Gráficos isolados e lazy-loadable                                                                            | §13                  | Recharts via `React.lazy`                                     |
| API Key conhecida apenas pela camada de dados                                                                | ADR-12               | `services/http` é o único lugar que lê a variável de ambiente |

---

## 5. Stack final

| Área                  | Escolha                                                      | Versão principal |
| --------------------- | ------------------------------------------------------------ | ---------------- |
| Framework             | React (SPA)                                                  | 19               |
| Build / dev server    | Vite                                                         | 7                |
| Linguagem             | TypeScript (strict)                                          | 5.9              |
| Data-fetching / cache | TanStack Query                                               | 5                |
| Cliente HTTP          | Axios                                                        | 1                |
| API de clima          | OpenWeather (Free Weather API access)                        | —                |
| Estilização           | Tailwind CSS                                                 | 4                |
| Componentes de UI     | Próprios (catálogo da arquitetura)                           | —                |
| Ícones                | lucide-react                                                 | —                |
| Gráficos              | Recharts (lazy-loaded)                                       | —                |
| Datas                 | dayjs + plugin `utc`                                         | —                |
| Testes                | Vitest + React Testing Library + user-event + jest-dom + MSW | —                |
| Lint / formatação     | ESLint (flat) + Prettier                                     | 9                |
| Package manager       | npm                                                          | —                |
| Deploy                | Build estático (`dist/`) em host estático                    | —                |

---

## 6. Framework / Build

**Escolha: React 19 + Vite 7 (SPA), sem roteador.**

**Comparação:**

| Critério    | React + Vite (escolhido)        | Next.js                               |
| ----------- | ------------------------------- | ------------------------------------- |
| SSR/SSG     | Não (não é requisito)           | Sim, mas desnecessário aqui           |
| Tipo de app | SPA de 1 página (dashboard)     | Exige decisão de roteamento/server    |
| Build       | `vite build` → estático simples | Server components/build mais complexo |
| Dev         | HMR rápido                      | HMR OK, mais infraestrutura           |
| Teste       | Vitest nativo (mesmo toolchain) | Configuração adicional                |
| Deploy      | Qualquer host estático          | Exige adaptador (Vercel/Node)         |

**Justificativa:** a arquitetura registrou explicitamente que "Next SSR/SSG não é requisito, mas não é bloqueado" (§20). O app tem uma única view (dashboard), sem rotas, autenticação, SEO ou fetch server-side. Vite entrega a menor complexidade coerente: dev rápido, build estático, e o **Vitest aproveita o mesmo toolchain** (coerência na curva de testes). Next.js adicionaria camada de execução server, roteamento e deploy não-estático sem retorno para o escopo.

---

## 7. Linguagem

**Escolha: TypeScript em modo strict.**

**Justificativa (não é "moda de mercado"):** a arquitetura é dirigida por **contratos**:

- `models/` é o contrato interno de domínio — mapeado 1:1 para `interface`/`type` (City, CurrentWeather, HourlyForecast, DailyForecast, WeatherRequest). A regra "modelos são a linguagem compartilhada entre camadas" é materializada por tipos.
- `services/dtos/` espelha o contrato externo (resposta da OpenWeather) — tipos anotam o que a API retorna e protegem os adapters.
- `services/adapters/` são funções puras DTO → modelo — a assinatura tipada força o mapeamento completo e testável.
- `utils/errors/` é uma taxonomia via união discriminada — a UI responde **por tipo** de erro (§9), o que exige tipagem forte.
- `utils/format`, `utils/selectors`, `utils/validation` — funções puras com contratos explícitos de entrada/saída.

JavaScript não protegeria os pontos em que a arquitetura mais depende de contratos (adapters, erros, modelos). O custo adicional (build de tipos, anotações) é pequeno e localizado — proporcional ao projeto.

**Observação de stack:** os diretórios da arquitetura foram nomeados sem extensão ("nomenclatura neutra", §4.2); com TypeScript, os arquivos passam a `.ts`/`.tsx`, e o espelho da estrutura é preservado.

---

## 8. Gerenciamento de estado

A arquitetura distingue quatro tipos de estado (§7). A stack escolhida respeita exatamente essa divisão:

| Tipo de estado                                       | Onde vive na stack                                                                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **UI** (termo de busca, dropdown, aba)               | `useState` local nos componentes (`components/search`, `components/ui`)                                                      |
| **Dados** (cidade selecionada; clima; previsões)     | Cidade elevada em `WeatherDashboard` (`useState`); clima/previsões no resultado da consulta traduzido pelos hooks de feature |
| **Requisição** (`idle/loading/success/error/empty`)  | **TanStack Query** (data-fetching em `hooks/data/`) + tradução nos hooks de feature                                          |
| **Derivado** (formatada, agrupada por dia, métricas) | Funções puras em `utils/format` e `utils/selectors`, nunca armazenado                                                        |

**TanStack Query é tratado como camada de data-fetching / server-state (cache), não como "estado global".** Mapeamento com a arquitetura:

| Exigência arquitetural (§5.3a, ADR-05/06/09)         | Recurso do TanStack Query                                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Consultas chaveadas                                  | `queryKey`: `['cities', term]` e `['weather', { lat, lon, scope }]`                                        |
| Cache em memória por chave com TTL                   | `staleTime` (cidades ~60s, clima ~5min) e `gcTime`                                                         |
| Deduplicação em voo                                  | Duas consultas iguais em voo compartilham a mesma promessa (nativo)                                        |
| Invalidação / refetch / retry                        | `invalidateQueries` por chave, `refetch`, `retry` configurável                                             |
| Atualização em segundo plano preservando dados       | `placeholderData: keepPreviousData` (ou dados atuais mantidos durante `isFetching`)                        |
| Descarte/cancelamento de obsoleta via sinal de abort | `signal` do `queryFn` repassado ao Axios; chave nova cancela/abandona a antiga                             |
| Estados uniformes expostos                           | `isPending / isSuccess / isError / data / fetchStatus`                                                     |
| `empty` explícito (success sem dados)                | Derivado nos hooks de feature: `isSuccess && !data.length` (cidades) ou ausência de dado (clima) → `empty` |

**Sem Redux, sem Zustand, sem Context API generalizada:** o dado flui por uma árvore rasa, unidirecional, e a arquitetura registrou (ADR-04, §17.4) que loja global seria custo sem retorno. Os hooks de feature (`use-city-search`, `use-weather`) continuam sendo **fachadas finas**: traduzem o estado da query para a taxonomia canônica e expõem apenas `models` + estados para a UI.

**Estrutura resultante em `hooks/`:**

```
hooks/
├── data/
│   ├── city-query        # useCitySearchQuery(term) — chave ['cities', term]
│   └── weather-query     # useWeatherQuery(city, scope) — chave ['weather', city+scope]
├── use-city-search.ts    # fachada: valida termo, traduz → idle/loading/success/empty/error + City[]
└── use-weather.ts        # fachada: conduz refetch/cancelamento → CurrentWeather + Forecasts + estados
```

---

## 9. Comunicação HTTP

**Escolha: Axios, confinado a `services/http`.**

A arquitetura é explícita e **agnóstica de transporte** quanto a _onde_ e _como_ o HTTP vive: "transporte único em `services/http`, com baseURL, timeout, injeção da API Key, classificação de erros de transporte e cancelamento por sinal" (§5.4, §20, ADR-06). O Axios atende integralmente essa especificação:

| Requisito do `services/http`   | Implementação com Axios                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base URL única                 | Instância `axios.create({ baseURL: VITE_WEATHER_API_BASE_URL })`                                                                                            |
| Injeção da API Key             | Request interceptor anexa `params.appid` (único lugar que lê a chave — ADR-12)                                                                              |
| Timeout                        | `timeout` da instância (ex.: 10s) → erro `ECONNABORTED`                                                                                                     |
| Cancelamento por sinal         | `signal` de abort repassado via config (ADR-06; abort → `ERR_CANCELED`)                                                                                     |
| Classificação de erros tipados | Centralizada em um classificador puro: `AxiosError.code` (rede/timeout/cancelamento) + `response.status` (401/404/429/5xx) → taxonomia §9 de `utils/errors` |

**Responsabilidades preservadas da arquitetura:**

- `services/http/` — cliente Axios, timeout, key, classificação de erros. Única camada que conhece o "transporte" e a chave.
- `services/endpoints/` — rotas e **funções puras** de construção de parâmetros (`buildCitySearchQuery(term)`, `buildWeatherQuery(city, scope)`). A estrutura da API vive aqui, não espalhada.
- `services/dtos/` — tipos que espelham a resposta da OpenWeather.
- `services/adapters/` — funções puras DTO → `models`.
- `services/repositories/` — fetchers `searchCities(term)` e `getWeather(city, scope)`: orquestram client + endpoint + adapter e retornam **apenas `models`**. São os iteradores das queries do TanStack Query (ADR-10).

**Nenhum componente, hook de feature ou utilitário importa o Axios.** A UI nunca conhece DTOs nem detalhes da API (§8 arquitetura). Em testes, o transporte é simulado via **MSW em nível de rede** (ver §16) — com Axios no browser/jsdom, o MSW intercepta o XHR; em Node, o adapter HTTP.

**Comparação (fetch vs Axios):**

| Critério                         | Axios (escolhido)                     | fetch nativo                               |
| -------------------------------- | ------------------------------------- | ------------------------------------------ |
| Erro tipado (código + status)    | `AxiosError` pronto                   | Requer wrapper manual completo             |
| Timeout                          | Config da instância                   | `AbortSignal.timeout` manual               |
| Interceptors (key, normalização) | Nativos                               | Requer camada própria                      |
| Cancelamento                     | `signal`/`AbortSignal`                | Nativo (equivalente)                       |
| Dependência extra                | ~15 kB                                | Nenhuma                                    |
| Adequação ao `services/http`     | Centraliza a classificame em 1 config | Mesma responsabilidade, mais código manual |

A escolha foi **confirmada explicitamente** na etapa de stack: o ganho de DX (erro tipado, interceptors, timeout) é real e o Axios fica isolado atrás da arquitetura — se um dia for trocado por fetch, apenas `services/http` muda.

---

## 10. API de clima

**Escolha: OpenWeather — Free Weather API access** (plano gratuito, sem cartão).

**Produtos utilizados** (todos incluídos no plano gratuito, 60 calls/min, 1.000.000/mês):

| Área funcional (§8.3)             | Endpoint                                                 | Uso                                             |
| --------------------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| Geocodificação / busca de cidades | `GET /geo/1.0/direct?q={termo}&limit=5&lang=pt_br`       | Termo → `City[]`                                |
| Clima atual                       | `GET /data/2.5/weather?lat&lon&units=metric&lang=pt_br`  | `CurrentWeather`                                |
| Previsão                          | `GET /data/2.5/forecast?lat&lon&units=metric&lang=pt_br` | Lista de 40 blocos de 3h (→ `HourlyForecast[]`) |

**Previsão diária:** o plano gratuito da OpenWeather entrega previsão **a cada 3 horas por 5 dias** (não há "daily" nativo no free). O `DailyForecast` é **derivado** agrupando os blocos de 3h por dia em `utils/selectors` — exatamente o papel que a arquitetura já atribuiu aos selectors ("agrupar previsão por dia", §5.6). **Não há conflito arquitetural**: a derivação é uma preocupação da camada de aplicação.

**Por que não outra API:**

| Alternativa                        | Motivo do descarte                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Open-Meteo**                     | Excelente e gratuita, mas **não exige API key** — o requisito é justamente exercitar `.env`/`.env.example`/`.gitignore` com chave |
| **One Call 3.0/4.0 (OpenWeather)** | É assinatura separada "pay-per-call" (1.000 calls/dia grátis) — postura paga, fora do perfil acadêmico                            |
| **WeatherAPI.com**                 | Plano grátis menor (autocomplete e previsões limitados), menos material acadêmico, documentação menos consolidada                 |
| **Tomorrow.io / AccuWeather**      | Escopo comercial, free tiers restritos e rotativos                                                                                |

**Adequação:** requer API key; primeiro endpoint (geocode) e clima/previsão no mesmo provedor; plano grátis generoso; `lang=pt_br` e `units=metric`; DTOs bem documentados (fáceis de tipar e criar fixtures); padrão de mercado com amplo material de referência.

**Limitação de segurança (documentada, §14 da arquitetura):** a chave trafega no navegador e é embutida no bundle. **Uma API key em aplicação frontend não é segredo absoluto após o build.** Não criamos backend/BFF/proxy para escondê-la — isso seria fora do escopo e criaria um servidor que a arquitetura explicitamente não possui. Mitigações aceitas: chave apenas via `VITE_*` (nunca versionada), concentrada em `services/http`, tratamento de 401 como erro de configuração, HTTPS, sem logging de payloads.

---

## 11. Estilização

**Escolha: Tailwind CSS v4** (via plugin `@tailwindcss/vite`, config CSS-first com `@theme`).

**Encaixe na arquitetura:** responsividade é **responsabilidade exclusiva da apresentação** (ADR-08). O Tailwind atende diretamente os três pontos:

- `app/DashboardLayout` → grade responsiva (1/2/N colunas) com utilities de breakpoint;
- `components/ui/*` e `components/state/*` → classes de tamanho consistentes, widgets fluidos;
- Tokens (cores, espaçamento, tipografia) centralizados em `@theme` no `index.css` → consistência visual sem "design system" pesado.

Sem CSS Modules ou CSS puro por arquivo: para um catálogo pequeno e muito reutilizado, utilities reduzem a superfície de estilo, mantêm o bundle pequeno (v4 gera apenas o CSS usado) e o "mundo visual" fica declarado na camada de UI, jamais importado por lógica/dados (§4 regra de dependência).

| Critério                      | Tailwind v4 (escolhido)   | CSS Modules / CSS puro | UI library (MUI/Chakra)            |
| ----------------------------- | ------------------------- | ---------------------- | ---------------------------------- |
| Responsividade                | Utilities de breakpoint   | Manual                 | ~mas traz peso                     |
| Consistência                  | Tokens em `@theme`        | Disciplina manual      | Pronta, porém presa ao tema da lib |
| Bundle                        | CSS gerado (apenas usado) | Conforme escrita       | ~grande + JS de componentes        |
| Acoplamento com a arquitetura | Restrito à apresentação   | Idem                   | Idem, mas conflita com §12         |

---

## 12. Componentes de UI

**Escolha: componentes próprios**, seguindo o catálogo da arquitetura (§10):

- `components/ui/` — `Card`, `MetricTile`, `Button`, `Skeleton` (puros, sem estado externo).
- `components/state/` — `LoadingState`, `ErrorState` (com retry), `EmptyState`.
- `components/search/` — `SearchBar`, `SearchResults`, `SearchResultItem`.
- `components/weather/` — `CurrentWeatherCard`, `MetricsGrid`, `HourlyForecast`, `DailyForecast`, `WeatherCharts`.
- `app/` — `App`, `DashboardLayout`, `WeatherDashboard`.

**Sem biblioteca de componentes.** O catálogo é deliberadamente pequeno (~15) e a arquitetura define regras fortes de pureza e responsabilidade — uma lib (MUI/Chakra/shadcn) adicionaria peso, token a sobrescrever e acoplamento que contradiz ADR-02 ("sem camadas artificiais") e ADR-11 (ponte única via hooks). Componentes próprios usam **HTML semântico e ARIA** (botão, campo de busca com `listbox`/`combobox`, regiões de status `role="status"`/`alert`) para garantir acessibilidade sem dependência.

**Estratégia:** híbrida no bom sentido arquitetural — `ui/` e `state/` são genéricos e puras; `search/` e `weather/` colapsam seus hooks de feature (única ponte UI ↔ lógica, ADR-11); composição em `WeatherDashboard`.

---

## 13. Ícones

**Escolha: lucide-react.**

- Tree-shakeable (ESM, importa só o ícone usado);
- Conjunto extenso e **estilo de traço consistente** (essencial para manter o visual coeso de dashboard);
- Integração direta como componentes React, compatível com React 19;
- Mapeamento condition→ícone e estado→ícone fica em funções puras/componentes de UI (arquitetura prevê `condition→ícone` no estado derivado, §7).

Descartadas: `react-icons` (bundle pesado, estilos heterogêneos), Font Awesome (peso + configuração), SVG inline manual (manutenção e inconsistência).

---

## 14. Gráficos

**Escolha: Recharts**, em `WeatherCharts`, **carregado em demanda**.

- **Necessidade real:** a visualização de temperatura por hora/dia e chance de precipitação tem sentido no dashboard (requisitos funcionais) e a arquitetura **já previu** `WeatherCharts` como bloco autocontido e lazy-loadable (§13).
- **Responsividade:** `ResponsiveContainer` se adapta ao espaço dado pelo grid (widgets fluidos, ADR-08).
- **DX/integração:** API declarativa compatível com React; customização por composição.
- **Bundle:** `React.lazy` + `Suspense` criam um chunk separado — o carregamento do gráfico **não** engorda o carregamento inicial (requisito §13 da arquitetura).
- **Acessibilidade:** título/labels acessíveis via props; nota: `ResponsiveContainer` exige mock de `ResizeObserver` em testes (setup do Vitest).

Descartadas: Chart.js (API imperativa/canvas, exige mais glue e lifecycle manual), biblioteca própria SVG (reimplementar eixos/linhas/responsividade sem retorno para o escopo).

---

## 15. Datas e horários

**Escolha: dayjs + plugin `utc`.**

- A OpenWeather entrega timestamps **unix em UTC**; `dayjs.utc(dt * 1000)` converte com clareza e formato determinístico.
- **Localização pt-BR** via `locale`: rótulos de hora ("14h"), dias da semana ("seg") e datas na previsão.
- ~2 kB, maduro e estável; **confinado a `utils/format`**, consumido por selectors/componentes de apresentação.
- Descartadas: `date-fns` (maior, árvore maior; pouco ganho aqui), Intl puro (suficiente, mas mais verboso para a conversão unix/UTC repetida nas previsões — decisão explícita da etapa de stack).

---

## 16. Testes

**Escolha: Vitest + React Testing Library + user-event + jest-dom + MSW.**

**Por que Vitest (e não Jest):** é o runner nativo do Vite — mesmo toolchain, zero config extra, ESM/TS nativo, rápido. Jest exigiria configuração separada, transform de TS/JSX e ecossistema CJS.

**Mapa de testes por camada (§11.1 da arquitetura) → ferramenta:**

| Camada                                           | O que testar                                                                        | Como isolar o mundo real                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `utils/` (format, selectors, validation, errors) | Regras puras (unidades, agrupamento por dia, mensagens, taxonomia)                  | **Sem mock** — funções puras                                   |
| `services/adapters`                              | DTO → modelo (campos, unidades, casos corrompidos)                                  | Dados de `mocks/` (fixtures)                                   |
| `services/http`                                  | Classificação de erros (rede/timeout/status), baseURL, key injetada, timeout, abort | **MSW** (nível de rede) + fixtures                             |
| `services/repositories`                          | Orquestração client→endpoint→adapter, normalização, erros propagados                | **MSW** (transporte, §11.1)                                    |
| `hooks/data` (queries)                           | Chave, cache/hit-miss, dedup em voo, invalidação, refetch, cancelamento             | `QueryClient` isolado (`retry: false`) + repositórios mockados |
| `hooks/` (use-city-search, use-weather)          | Tradução idle/loading/success/error/empty, argumentos da consulta                   | Camada de data-fetching controlada (repositórios mockados)     |
| `components/ui`, `components/state`              | Renderização por props, variantes, mensagens por tipo de erro                       | Props diretas                                                  |
| `components/search`, `components/weather`        | Estados (loading/error/empty/success), interação (digitar, selecionar, retry)       | **Hooks mockados** (`vi.mock`) + fixtures                      |
| `app/WeatherDashboard`                           | Composição, vínculo busca → seleção → clima                                         | Hooks mockados                                                 |

**MSW** cobre a fronteira de transporte exigida para `services/http` e `repositories` (handlers simulando os endpoints da OpenWeather ficam em `mocks/`, junto das fixtures e da "camada de data-fetching de teste" — §11.2). Nenhum teste depende de API real (salvo um eventual smoke **opcional e explicitamente marcado**).

**Fronteira preferida de mock preservada (§11.2):** UI → hooks → data-fetching simulada (`QueryClient` + repositórios mockados) → sem rede. Priorizamos **testes de comportamento e integração**, não visuais.

**Configuração:** `vitest` no `vite.config.ts` (`environment: 'jsdom'`, `setupFiles`, mock de `ResizeObserver`), `@testing-library/jest-dom` via setup.

---

## 17. Lint e formatação

**Obrigatório pela etapa. Escolha:**

- **ESLint 9** (flat config, `eslint.config.js`): `typescript-eslint` (recommended), `eslint-plugin-react-hooks` (regras de hooks), `eslint-plugin-react-refresh` (fast refresh correto).
- **Prettier** integrado via `eslint-config-prettier` (desliga regras de estilo conflitantes do ESLint).

Scripts: `npm run lint` (eslint .), `npm run format` (prettier --write .), `npm run typecheck` (`tsc --noEmit`).

---

## 18. Variáveis de ambiente

**Estratégia:**

| Item           | Conteúdo                                                                                                | Versionado?               |
| -------------- | ------------------------------------------------------------------------------------------------------- | ------------------------- |
| `.env`         | valores reais (chave)                                                                                   | **Não** (no `.gitignore`) |
| `.env.local`   | valores locais específicos da máquina                                                                   | **Não**                   |
| `.env.example` | `VITE_WEATHER_API_KEY=cole-sua-chave-aqui` e `VITE_WEATHER_API_BASE_URL=https://api.openweathermap.org` | **Sim** (referência)      |
| `.gitignore`   | `.env`, `.env.local`, `.env.*.local` (+ `node_modules`, `dist`, `coverage`)                             | **Sim**                   |

**Variáveis:**

```text
VITE_WEATHER_API_KEY=          # chave da OpenWeather (obrigatória)
VITE_WEATHER_API_BASE_URL=     # default: https://api.openweathermap.org (obrigatória)
```

- O Vite expõe apenas variáveis com prefixo `VITE_` via `import.meta.env`, substituídas **em tempo de build**.
- A leitura acontece **somente em `services/http`** (ADR-12) — nada em UI/hooks/models conhece a chave.
- **Aviso explícito:** variáveis `VITE_*` são embutidas no bundle e **não tornam a API key secreta após o build** — a gestão via `.env` tem finalidade de organização e prevenção de versionamento acidental, não de segurança (ver §24).
- Se a chave estiver ausente no build, `services/http` falha cedo com erro de configuração (tratado como `UnauthorizedError`/config na UI, §9).

---

## 19. Build e deploy

| Ação            | Comando                                                 |
| --------------- | ------------------------------------------------------- |
| Instalar        | `npm install`                                           |
| Desenvolvimento | `npm run dev` (Vite dev server, porta 5173)             |
| Typecheck       | `npm run typecheck`                                     |
| Testes          | `npm run test` (Vitest watch) / `npm run test:run` (CI) |
| Lint            | `npm run lint`                                          |
| Build           | `npm run build` (typecheck + `vite build` → `dist/`)    |
| Preview local   | `npm run preview`                                       |

**Requisitos:** Node.js 20.19+ ou 22.12+ (Vite 7), npm.

**Deploy:** artefato **estático** (`dist/`). Qualquer host estático serve: Vercel, Netlify, GitHub Pages, Cloudflare Pages. Simplicidade máxima para avaliação: drag-and-drop do `dist/` ou importação do repositório. HTTPS é exigido pelo navegador para a chamada à API (recomendado por padrão em todos os hosts citados).

---

## 20. Dependências

### Produção

| Pacote                       | Responsabilidade arquitetural                 | Por que                                                                         |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| `react`, `react-dom`         | Camada de apresentação (UI)                   | Renderização; base da camada de componentes                                     |
| `@tanstack/react-query`      | Camada de data-fetching (§5.3a, ADR-05/06/09) | Consultas chaveadas, cache, dedup, invalidação, refetch, cancelamento           |
| `axios`                      | Transporte em `services/http` (ADR-12)        | Instância única com baseURL/timeout/key; `AxiosError` tipado; `signal` de abort |
| `dayjs` + `dayjs/plugin/utc` | Datas em `utils/format`                       | Conversão unix/UTC e locale pt-BR das previsões                                 |
| `lucide-react`               | Ícones da UI                                  | Tree-shakeable, consistente, leve                                               |
| `recharts`                   | `WeatherCharts` (gráficos, lazy-loaded)       | Gráficos declarativos responsivos, isolados em chunk                            |

### Desenvolvimento

| Pacote                             | Responsabilidade                | Por que                                                   |
| ---------------------------------- | ------------------------------- | --------------------------------------------------------- |
| `vite`                             | Build/dev server                | Toolchain escolhido (§6)                                  |
| `@vitejs/plugin-react`             | Transform/React Refresh no Vite | Integração React ↔ Vite                                   |
| `typescript`                       | Linguagem §7                    | Tipagem strict dos contratos                              |
| `@types/react`, `@types/react-dom` | Tipos do React                  | Necessários com TS                                        |
| `tailwindcss`, `@tailwindcss/vite` | Estilização §11                 | Utility-first v4, CSS-first, plugin nativo                |
| `vitest`                           | Runner de testes §16            | Nativo do Vite                                            |
| `jsdom`                            | Ambiente DOM dos testes         | Renderização de componentes                               |
| `@testing-library/react`           | Teste de componentes            | Render/interação/estados por comportamento                |
| `@testing-library/jest-dom`        | Matchers de DOM                 | Assertions legíveis (presença, roles, classes)            |
| `@testing-library/user-event`      | Interação realista              | Digitar, selecionar, clicar (acessibilidade)              |
| `msw`                              | Mock de rede (§16)              | Intercepta transporte p/ `services/http` e `repositories` |
| `eslint`                           | Lint §17                        | Obrigatório                                               |
| `typescript-eslint`                | Regras TS no ESLint             | Tipagem × lint integrado                                  |
| `eslint-plugin-react-hooks`        | Regras de hooks                 | Correção dos hooks (ADR-11)                               |
| `eslint-plugin-react-refresh`      | Fast Refresh                    | Qualidade de DX                                           |
| `eslint-config-prettier`           | Conciliação Prettier            | Evita conflito de regras                                  |
| `prettier`                         | Formatação §17                  | Obrigatório                                               |

Não há dependência sem responsabilidade: nenhuma lib de estado global (Redux/Zustand), nenhuma UI library, nenhum roteador, sem biblioteca extra de validação de runtime (a tipagem estática + validadores simples em `utils/validation` bastam ao escopo).

---

## 21. Estrutura inicial do projeto

Espelho direto da estrutura-alvo da arquitetura (§4.2), acrescido dos arquivos raiz do toolchain:

```
climora/
├── index.html
├── package.json
├── vite.config.ts              # plugins (react, tailwind) + config vitest
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── eslint.config.js            # ESLint 9 flat config
├── .prettierrc, .prettierignore
├── .env.example                # VITE_WEATHER_API_KEY / VITE_WEATHER_API_BASE_URL
├── .gitignore                  # node_modules, dist, coverage, .env*, ...
├── src/
│   ├── main.tsx                # entrada: providers (QueryClient) + <App/>
│   ├── index.css               # @import "tailwindcss" + tokens @theme
│   ├── app/                    # composição raiz (página/dashboard)
│   │   ├── App.tsx
│   │   ├── DashboardLayout.tsx # grade responsiva (breakpoints)
│   │   └── WeatherDashboard.tsx# estado elevado + composição de widgets
│   ├── components/
│   │   ├── ui/                 # Card, MetricTile, Button, Skeleton
│   │   ├── state/              # LoadingState, ErrorState, EmptyState
│   │   ├── search/             # SearchBar, SearchResults, SearchResultItem
│   │   └── weather/            # CurrentWeatherCard, MetricsGrid, HourlyForecast, DailyForecast, WeatherCharts
│   ├── hooks/
│   │   ├── data/               # city-query.ts, weather-query.ts (TanStack Query)
│   │   ├── use-city-search.ts
│   │   └── use-weather.ts
│   ├── services/
│   │   ├── http/               # cliente axios, interceptor de key, classificador de erros
│   │   ├── dtos/               # contratos de resposta da OpenWeather
│   │   ├── endpoints/          # rotas + construtores de parâmetros (funções puras)
│   │   ├── adapters/           # DTO → modelo (funções puras)
│   │   └── repositories/       # searchCities, getWeather (fetchers das queries)
│   ├── models/                 # City, CurrentWeather, HourlyForecast, DailyForecast, WeatherRequest
│   ├── utils/
│   │   ├── format/             # temperatura, vento, data/hora, unidades
│   │   ├── selectors/          # agrupar previsão por dia, métricas derivadas
│   │   ├── errors/             # taxonomia de erros (união discriminada) + mensagens
│   │   └── validation/         # validação de busca
│   └── mocks/                  # fixtures de DTOs/modelos + handlers MSW (só testes)
│       └── handlers/           # mocks de rede da OpenWeather
└── docs/
```

**Responsabilidade de cada diretório principal:**

- `app/` — composição raiz: `App` entra e renderiza `DashboardLayout`; `DashboardLayout` decide a grade responsiva; `WeatherDashboard` segura a cidade selecionada e distribui dados/estados aos widgets.
- `components/` — apresentação pura. `ui/` e `state/` são genéricos sem estado externo; `search/` e `weather/` colapsam os hooks de feature (única ponte UI↔lógica); nenhum importa `services/`.
- `hooks/` — lógica de aplicação: `data/` é a camada de data-fetching (queries chaveadas); `use-city-search` e `use-weather` são fachadas que traduzem consulta → estados + `models` (nunca DTOs).
- `services/` — acesso a dados: única camada que conhece a OpenWeather (cliente, DTOs, endpoints, adapters, repositórios).
- `models/` — contrato interno de domínio, sem dependência de ninguém.
- `utils/` — funções puras (formatar, derivar, classificar erros, validar), testáveis sem mock.
- `mocks/` — fixtures e mock de rede, **apenas testes**, nunca produção.
- `main.tsx` — infraestrutura de runtime: `QueryClientProvider` (camada de data-fetching) é posicionado na raiz fora da lógica de negócio; os componentes continuam sem conhecer a camada.

---

## 22. Justificativas

| Decisão                  | Justificativa-resumo                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| React + Vite (SPA)       | Frontend-only, 1 view; build estático simples; Vitest no mesmo toolchain; Next desnecessário (§6)                        |
| TypeScript strict        | Arquitetura dirigida por contratos (`models`, DTOs, adapters, erros) — TS implementa o contrato (§7)                     |
| TanStack Query           | Implementa 1:1 a camada de data-fetching (chave/cache/dedup/invalidação/estados/abort) sem código próprio (ADR-05/06/09) |
| Sem estado global        | Fluxo unidirecional, árvore rasa — elevação local basta (ADR-04)                                                         |
| Axios em `services/http` | Transporte único e isolado; erro tipado, timeout e interceptors reduzem código da camada (§9)                            |
| OpenWeather free         | Requer API key (exercita `.env`), geocodificação + clima/previsão no mesmo provedor, plano grátis robusto (§10)          |
| Tailwind v4              | Responsividade e consistência confinadas à apresentação (ADR-08), bundle mínimo, DX alta (§11)                           |
| Componentes próprios     | Catálogo pequeno e definido; sem peso/acoplamento de UI library (ADR-02/11)                                              |
| lucide-react             | Ícones leves, consistentes e tree-shakeable (§13)                                                                        |
| Recharts (lazy)          | Gráficos responsivos com necessidade real; chunk isolado honra §13 da arquitetura (§14)                                  |
| dayjs + utc              | Timestamps unix/UTC da API + locale pt-BR, confinado a `utils/format` (§15)                                              |
| Vitest + RTL + MSW       | Mesmo toolchain do build; fronteiras de mock por camada (§11) sem chamadas reais (§16)                                   |

---

## 23. Trade-offs

| Decisão                                   | Ganho                                    | Custo/troca conhecida                                                       |
| ----------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| TanStack Query                            | Cache/dedup/estados/concorrência prontos | Dependência de infraestrutura madura; chave/TTL vivem na definição da query |
| TypeScript                                | Contratos garantidos em models/adapters  | Cerimônia de tipos e build extra — proporcional ao escopo                   |
| Axios                                     | DX (erro tipado, interceptors, timeout)  | ~15 kB e um conceito a mais; isolado em `services/http`                     |
| Tailwind                                  | Responsividade e consistência rápidas    | Classes utilities acopladas ao JSX (restrito à UI)                          |
| Recharts lazy                             | Gráfico rico sem custo no load inicial   | Chunk extra e mock de `ResizeObserver` em testes                            |
| API key no client                         | Sem backend, deploy trivial              | Chave extraível do bundle (aceita e documentada, §14/§24)                   |
| dayjs                                     | Datas determinísticas (unix/UTC, pt-BR)  | Uma dependência a mais, pequena e confinada                                 |
| Previsão diária derivada dos blocos de 3h | Sem produto pago (One Call)              | Dados diários agregados pela aplicação (max/min por grupo)                  |

Nenhum trade-off conflita com decisões arquiteturais — todos são "custo baixo e local" em troca de testabilidade e isolamento.

---

## 24. Riscos e limitações

- **API key exposta no bundle:** variáveis `VITE_*` são visíveis a qualquer pessoa com acesso ao build. Limitação **aceita** pela arquitetura (§14); mitigada por organização (`.env` não versionado), chave centralizada em `services/http`, tratamento de 401 como configuração, HTTPS, e registro explícito para a banca.
- **Limites da OpenWeather free (60 calls/min):** mitigado pela natureza do uso (poucas requisições por natureza, §13) e pelo **cache do TanStack Query** (mesma cidade não gera nova chamada dentro do `staleTime`).
- **Previsão free sem "daily" nativo:** o `DailyForecast` é derivado por agregação dos blocos de 3h — reduz a riqueza de alguns campos (ex.: sem `sunrise/sunset` por dia). Aceitável para o escopo; evolução possível com o plano de estudantes (16 dias/diário).
- **Recharts e `ResponsiveContainer`:** exige polyfill/mock de `ResizeObserver` nos testes (previsto no setup) e pode emitir warnings em ambientes sem layout.
- **Dependência de disponibilidade da API externa:** contemplada pela taxonomia de erros (`NetworkError`, `TimeoutError`, `ServerError`) e pelo `ErrorState` com retry.
- **Conhecimento de Axios + TanStack Query:** leve curva de familiarização; compensada por serem padrões de mercado com documentação ampla (princípio 13).

---

## 25. Próximos passos

1. **Scaffold do projeto:** `npm create vite@latest` (react-ts) + instalação das dependências da §20.
2. **Configuração de base:** Tailwind v4 (`@tailwindcss/vite`), ESLint flat + Prettier, `vitest` + setup (`jsdom`, jest-dom, mock de `ResizeObserver`), `.env.example`/`.gitignore`.
3. **Domínio e contratos:** `models/` (interfaces) + `utils/errors/` (taxonomia) + `mocks/` (fixtures iniciais).
4. **Serviços:** `services/dtos` (contratos OpenWeather) → `endpoints` → `adapters` → `http` (axios + key + classificador) → `repositories`.
5. **Data-fetching:** `hooks/data/city-query` e `weather-query` (chaves, `staleTime`, fetchers).
6. **Hooks de feature:** `use-city-search` e `use-weather` (tradução para `idle/loading/success/empty/error`).
7. **UI:** `components/ui` + `state` → `search` → `weather` (widgets) → `DashboardLayout` → `WeatherDashboard`.
8. **Gráficos:** `WeatherCharts` com Recharts, lazy-loaded.
9. **Testes** por camada (na ordem utils → adapters → http/repositories → queries → hooks → componentes → composição).
10. **Deploy** do `dist/` em host estático (Vercel/Netlify/GitHub Pages).

---

_Fim do documento. Este arquivo é a fonte de verdade tecnológica do projeto; qualquer mudança de stack futura deve atualizá-lo e ser validada contra `docs/decisoes_arquiteturais.md`._
