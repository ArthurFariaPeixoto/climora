# Fase 07 — Composição do dashboard (MARCO: aplicação funcionando)

> Ao concluir esta fase o Dashboard opera de ponta a ponta: busca → seleção → clima →
> widgets + estados. É o **marco de "aplicação funcionando"**.
>
> **Referência:** stack §8, §12; arquitetura §5.1, §6, §10.3, ADR-08, §13 (lazy).

---

## 1. `src/app/WeatherDashboard.tsx`

**Hoje retorna `null`.** Implementar (arquitetura §5.1 — composição raiz):

- [ ] Estado elevado da **cidade selecionada** (`City | null`, `useState`) — elo entre as
      fases A e B do fluxo (§6).
- [ ] Consumir `use-weather` a partir da cidade selecionada.
- [ ] Compor os blocos:
  - [ ] busca (`SearchBar` + `SearchResults`) com `onSelect(city)` elevando a cidade;
  - [ ] estados da consulta de clima: `idle` (prompt inicial), `loading` (`LoadingState`/
        skeleton), `error` (`ErrorState` com retry), `empty` (`EmptyState`);
  - [ ] widgets `weather/*`: `CurrentWeatherCard`, `MetricsGrid`, `HourlyForecast`,
        `DailyForecast`;
  - [ ] `WeatherCharts` **lazy** com `React.lazy` + `<Suspense fallback>` (fase 06):
        importar o **default export** via
        `React.lazy(() => import('@/components/weather/WeatherCharts'))`;
  - [ ] Aplicar `Suspense` no nível certo (apenas gráfico em fallback, resto carrega
        normal) — o chunk separado do gráfico é verificado no item de `npm run build`
        (seção 2, "build gera `dist/` sem erros").
- [ ] ⚑ anexo-11 (item 9): definir a divisão de estado entre `SearchBar`/`SearchResults`
      (termo local) e `WeatherDashboard` (seleção) — sem prop-drilling excessivo e sem
      globalizar (ADR-11/ADR-04).
- [ ] Não conter lógica de negócio nem conhecer a API (só hooks de feature).
- [ ] Testes em `tests/app/WeatherDashboard.test.tsx` (composição + vínculo busca→seleção→
      clima; hooks mockados — fase 09).

## 2. `src/app/DashboardLayout.tsx`

**Hoje: `<div className="w-full">` apenas (TODO em `DashboardLayout.tsx:14`).** Implementar:

- [ ] Grade responsiva (ADR-08; arquitetura §12):
  - [ ] 1 coluna em mobile;
  - [ ] 2 colunas em tablet;
  - [ ] N colunas em desktop (`lg`/`xl`);
- [ ] Área de cabeçalho/header do dashboard (título/logo opcional — mantendo o catálogo
      da arquitetura, que não prevê Header; só se fizer sentido visual).
- [ ] Contêiner com largura máxima e padding consistente.
- [ ] Aceitar `children` e compor `WeatherDashboard` internamente ou delegar ao `App`
      (decisão de composição com o item 3).
- [ ] Testes em `tests/app/DashboardLayout.test.tsx` (render + classes de grid) — ou
      cobertura indireta via teste do App.

## 3. `src/app/App.tsx` — substituir placeholder

**Hoje renderiza o texto "Climora / Weather Dashboard" (`App.tsx:12-14`).**

- [ ] Trocar o placeholder por `DashboardLayout` + `WeatherDashboard`.
- [ ] Manter o `h1` "Climora" se o layout definitivo o incluir (senão mover para header).
- [ ] Atualizar o smoke test atual (`tests/app/App.test.tsx`), que ainda valida o texto
      placeholder.

## 4. `src/main.tsx` — ajustes finais de provider

**Já existe:** `QueryClientProvider` na raiz (`main.tsx:9-16`), defaults `staleTime: 0`,
`retry: 1`.

- [ ] Revisar defaults: com `staleTime` por consulta definido (60s/5min), avaliar se o
      default global deve mudar (ex.: `staleTime: 0` ok, ou alinhar; anexo-11 item 5).
- [ ] Configurar `refetchOnWindowFocus`/`retry` de forma previsível (evitar refetch
      indesejado em dev/tests).
- [ ] Aplicar `Suspense`/fallback global, se necessário, para o chunk lazy (ou deixar no
      `WeatherDashboard`).

---

## Critério de conclusão da fase 07 (marco)

- [ ] `npm run typecheck`, `npm run lint`, `npm run test` passam.
- [ ] `npm run build` gera `dist/` sem erros (incluindo chunk separado do gráfico).
- [ ] **Fluxo manual verificável** com `.env` preenchido: buscar cidade → selecionar →
      dashboard renderiza clima atual, métricas, previsões e gráfico; estado de erro ao
      falhar; retry funciona.
- [ ] Com MSW ativo (testes), o mesmo fluxo é exercitado sem rede real.
- [ ] Nenhum `TODO`/`null` restante em `src/app/` core da composição.