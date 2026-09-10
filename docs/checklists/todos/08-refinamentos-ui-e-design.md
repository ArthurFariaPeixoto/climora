# Fase 08 — Refinamentos de UI e design

> Polimento sobre a base funcional: variantes, tokens de design (@theme), acessibilidade e
> mensagens por tipo de erro. Responsividade é responsabilidade exclusiva da apresentação
> (ADR-08); `components/ui/*` e `state/*` são puros, sem estado externo.
>
> **Referência:** stack §11, §12; arquitetura §10.1, §12, §9.

---

## 1. `src/components/ui/` — genéricos reutilizáveis

**Card** (`Card.tsx`): variantes `default`/`highlight` (destaque dourado/suave no card
principal — aplicado no `CurrentWeatherCard`) e `padding` `default`/`none` (conteúdo
edge-to-edge), com `className` fundido. Consumo de tokens `rounded-card`/`shadow-card`.

**Button** (`Button.tsx`): hoje 1 variante (escuro).
- [x] Variantes: `primary` (céu/`accent`), `secondary` (borda/neutro), `ghost` (transparente),
      `danger` (vermelho).
- [x] Estados: `disabled` (`disabled:opacity-50`), foco visível (`focus-visible:outline-accent`),
      tamanhos (`sm`/`md`).
- [x] `type` default `button` (continua ok) e `aria-label` propagado para botões de ação apenas
      com ícone.

**MetricTile** (`MetricTile.tsx`): baseline ok.
- [x] Revisar espaçamento/tipografia com os tokens do `@theme` (`text-ink*`, `bg-accent`).
- [x] Variante `highlight` ("destaque") para a métrica principal — prop disponível, sem
      consumidor ainda (a métrica principal do dashboard é o card do clima, não a grade).

**Skeleton** (`Skeleton.tsx`): ok — dimensões/estilização via tokens (`bg-skeleton`).

## 2. `src/components/state/` — estados da interface

**LoadingState** (`LoadingState.tsx`):
- [x] Compor skeletons no layout dos widgets (alturas coerentes: card clima `h-28`, grade
      fluida de métricas com 3 tiles `h-20`, previsões `h-16`, gráfico `h-40` — ADR-08).
- [x] `role="status"`/`aria-label` para leitura de tela (`label?` com default).

**ErrorState** (`ErrorState.tsx`):
- [x] Integrar com a taxonomia: recebe `error: AppError` + `onRetry`; mensagem via
      `getErrorMessage` (canônica) anda centralizada no componente.
- [x] Ícone por tipo de erro (mapa `kind → lucide-react`; anexo-11 item 13 resolvido) e
      mensagem amigável.
- [x] Retry mostrado apenas quando aplicável: `onRetry` presente **e**
      `isRetryableAppError(error)` — 404/401/invalid-search/invalid-data sem retry
      (decisão de UX alinhada à taxonomia; lógica centralizada, sem duplicação nos callers).

**EmptyState** (`EmptyState.tsx`):
- [x] Ícone + mensagem configurável (`icon?: LucideIcon`, default `CloudOff`);
      `role="status"` mantido.
- [x] Usar em busca sem resultado e em widget sem previsão (já consumido por
      `SearchResults`, `WeatherDashboard`, `HourlyForecast`, `DailyForecast`, `WeatherCharts`).

## 3. Tokens de design — `src/index.css`

**Hoje:** tokens semânticos via `@theme` (criados na §1): céu/destaques `accent*`,
neutros `canvas`/`surface`/`line*`/`ink*`/`skeleton`, erro `danger*`, layout.

- [x] Paleta de cores (céu/destaques/neutros) via `@theme` (Tailwind v4) — definida na §1.
- [x] Tipografia (tamanhos/weights) e espaçamentos consistentes — escala default do Tailwind v4
      (já tokenizada: `--text-*`, `--font-weight-*`, `--spacing`) com **roles documentadas** no
      `index.css` (h1 `text-lg bold`, título de widget `text-lg semibold`, labels `text-sm medium`,
      micro `text-xs`, temperatura hero `text-4xl bold`).
- [x] (Opcional) tokens de layout para `Card`/`Button` — `--radius-card`/`--shadow-card`
      (Card) e `--radius-control` (`rounded-control` em Button/input/listbox).
- [x] Atualizar classes dos componentes `ui/`/`state/` para consumir os tokens (sem duplicar
      valores mágicos) — concluído em §1/§2 e **estendido ao resto da apresentação**: página/header
      (`bg-canvas`/`border-line`/`bg-surface`), listbox, input (`border-line-strong`),
      `SearchResultItem` (ativo `bg-accent-soft`), `CurrentWeatherCard` e previsões
      (`text-ink*`, precip `text-accent-strong` no lugar de `text-sky-*`). Hex restantes só no
      Recharts (SVG attr não resolve `var()`), espelhando `accent`/`accent-line`.
- [x] Revisar contraste de cores para acessibilidade (WCAG AA) — `--color-ink-muted` subiu para
      `#525252` (~6.9:1 até sobre `accent-soft`); `white/accent` ~7.0:1, `white/danger` ~4.8:1,
      `accent-strong/surface` ~5.9:1; `ink-soft` restrito a ícones decorativos `aria-hidden`
      (isento). Nenhum texto normal abaixo de 4.5:1.

## 4. Acessibilidade (revisão geral de UI)

- [x] Formulário de busca: `label`, `role="combobox"`, `aria-expanded`, `aria-controls`,
      `aria-activedescendant`, navegação por setas (reforço do que foi feito na fase 05).
- [x] Regiões de status: `role="status"` (loading/empty) e `role="alert"` (erro).
- [x] Foco visível consistente (focus ring) em todos os interativos — padrão
      `focus-visible:outline-accent` também aplicado ao input de busca (`SearchBar`) e ao
      botão `role="option"` (`SearchResultItem`), antes restrito ao `Button`; coberto por
      testes nos dois componentes.
- [x] Ícones decorativos: `aria-hidden` + texto acessível quando o contexto não for óbvio.
- [x] Botões/links com nome acessível (`aria-label`).

---

## Critério de conclusão da fase 08

- [x] `npm run typecheck` e `npm run lint` passam.
- [x] Testes de `ui`/`state` (e/ou de features) seguem passando (`npm run test`).
- [x] Nenhum `TODO` restante em `src/components/ui/` e `src/components/state/`.
- [x] Visual coerente (tokens) e navegação por teclado/leitor de tela verificada
      manualmente.