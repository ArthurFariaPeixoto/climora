# Fase 08 — Refinamentos de UI e design

> Polimento sobre a base funcional: variantes, tokens de design (@theme), acessibilidade e
> mensagens por tipo de erro. Responsividade é responsabilidade exclusiva da apresentação
> (ADR-08); `components/ui/*` e `state/*` são puros, sem estado externo.
>
> **Referência:** stack §11, §12; arquitetura §10.1, §12, §9.

---

## 1. `src/components/ui/` — genéricos reutilizáveis

**Card** (`Card.tsx` — ok/oito): avaliar se precisa de variante (sem padding, destaque).

**Button** (`Button.tsx`): hoje 1 variante (escuro).
- [ ] Variantes: `primary`, `secondary`, `ghost`, `danger` (ou minimal).
- [ ] Estados: `disabled`, foco visível (`focus-visible`), tamanhos (sm/md).
- [ ] `type` default `button` (já ok) e `aria` para botões de ação apenas com ícone.

**MetricTile** (`MetricTile.tsx`): baseline ok.
- [ ] Revisar espaçamento/tipografia com os tokens do `@theme`.
- [ ] Variante "destaque" para a métrica principal, se fizer sentido.

**Skeleton** (`Skeleton.tsx`): ok — apenas ajustar dimensões via tokens.

## 2. `src/components/state/` — estados da interface

**LoadingState** (`LoadingState.tsx`, TODO em `:6`):
- [ ] Compor skeletons no layout dos widgets (alturas coerentes: card clima, métricas,
      previsões, gráfico).
- [ ] `role="status"`/`aria-label` para leitura de tela.

**ErrorState** (`ErrorState.tsx`):
- [ ] Integrar com a taxonomia: receber `error: AppError` (ou mensagem pronta) +
      `onRetry`.
- [ ] Ícone por tipo de erro (mapa da fase 01) e mensagem amigável.
- [ ] Mostrar retry apenas quando aplicável (404 sem retry? decisão de UX).

**EmptyState** (`EmptyState.tsx`):
- [ ] Ícone + mensagem configurável; `role="status"`.
- [ ] Usar em busca sem resultado e em widget sem previsão.

## 3. Tokens de design — `src/index.css`

**Hoje:** só `--font-sans` no `@theme` (TODO implícito "tokens reais quando o design final").

- [ ] Paleta de cores (céu/destaques/neutros) via `@theme` (Tailwind v4).
- [ ] Tipografia (tamanhos/weights) e espaçamentos consistentes.
- [ ] (Opcional) tokens de layout (radius, sombras) para `Card`/`Button`.
- [ ] Atualizar classes dos componentes `ui/`/`state/` para consumir os tokens (sem
      duplicar valores mágicos).
- [ ] Revisar contraste de cores para acessibilidade (WCAG AA).

## 4. Acessibilidade (revisão geral de UI)

- [ ] Formulário de busca: `label`, `role="combobox"`, `aria-expanded`, `aria-controls`,
      `aria-activedescendant`, navegação por setas (reforço do que foi feito na fase 05).
- [ ] Regiões de status: `role="status"` (loading/empty) e `role="alert"` (erro).
- [ ] Foco visível consistente (focus ring) em todos os interativos.
- [ ] Ícones decorativos: `aria-hidden` + texto acessível quando o contexto não for óbvio.
- [ ] Botões/links com nome acessível (`aria-label`).

---

## Critério de conclusão da fase 08

- [ ] `npm run typecheck` e `npm run lint` passam.
- [ ] Testes de `ui`/`state` (e/ou de features) seguem passando (`npm run test`).
- [ ] Nenhum `TODO` restante em `src/components/ui/` e `src/components/state/`.
- [ ] Visual coerente (tokens) e navegação por teclado/leitor de tela verificada
      manualmente.