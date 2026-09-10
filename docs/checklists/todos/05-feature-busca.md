# Fase 05 — Feature: busca de cidades

> `components/search/*` colapsa o hook `use-city-search` (ADR-11) — é a única ponte entre a
> UI e a lógica da busca. Componentes são apresentação pura: recebem `models` + estados e
> callbacks.
>
> **Referência:** stack §12; arquitetura §5.2, §6 (Fase A), §7, §10.2, §10.3.

---

## 1. `src/components/search/SearchBar.tsx`

**Implementado (anexo-11 item 9: `SearchBar` colapsa `use-city-search`; `SearchResults`
é apresentação pura por props — continua `null`, preenchido na §2).**

- [x] Campo de input com `label` acessível (`htmlFor`/`inputId` via `useId`).
- [x] Estado local do termo digitado (`useState`) — estado de UI (§7): `draft` (digitado)
      e `submittedTerm` (dispara a consulta ao submeter).
- [x] Submissão via formulário (`onSubmit`) que dispara a busca por `use-city-search`.
- [x] Combobox/listbox com ARIA:
  - [x] `role="combobox"` no input + `aria-expanded`/`aria-controls` (só quando aberto);
  - [x] `aria-activedescendant` ao navegar pelos resultados;
  - [x] navegação por setas ↑/↓ (com wrap) + Enter (seleciona/submete) + Tab (blur fecha),
        Escape fecha e limpa o destaque.
- [x] Validação do termo na UI (mensagem de `InvalidSearchError` via hook em
      `role="alert"`).
- [x] Estados: `idle` (placeholder), `loading` (`role="status"` + `aria-busy`), erro
      (mensagem).
- [x] Compõe `SearchResults` (contrato de props definido na §2; busca colapsada aqui —
      anexo-11 item 9; fluxo de seleção até `WeatherDashboard` na fase 07).
- [x] Callback `onSelect(city: City)` para a seleção subir até `WeatherDashboard`.
- [x] Testes em `tests/components/search/SearchBar.test.tsx` (digitar, submeter, setas,
      escolher item, estado de erro/loading; `use-city-search` mockada — fase 09). Obs.: o
      `cleanup` explícito do RTL foi adicionado em `tests/setup.ts` (Vitest tem
      `globals: false` e não registra o auto-cleanup).

## 2. `src/components/search/SearchResults.tsx`

**Implementado.** Consome o resultado por props (busca colapsada apenas em `SearchBar` —
anexo-11 item 9);

- [x] Renderizar:
  - [x] `loading` → `LoadingState` dentro de `role="status"` (`aria-label="Buscando cidades"`);
  - [x] `error` → `ErrorState` (com retry `onRetry` apenas p/ erros transitórios —
        `isRetryableAppError`; `InvalidSearchError`/4xx sem botão);
  - [x] `empty` → `EmptyState` ("Nenhuma cidade encontrada");
  - [x] `success` → lista de `SearchResultItem`;
- [x] `role="listbox"` na lista; itens com `role="option"` e `aria-selected` (refletindo o
      `activeIndex` das setas).
- [x] Limites visuais: lista com `max-h-72` + `overflow-y-auto` quando muitos resultados.
- [x] Fechar/limpar resultados ao selecionar (decisão com SearchBar): `SearchBar` limpa
      `draft`/`submittedTerm` e fecha o painel em `handleSelect`.
- [x] Testes em `tests/components/search/SearchResults.test.tsx` (4 estados + interação:
      clique seleciona, hover ativa, retry só quando transitório).

## 3. `src/components/search/SearchResultItem.tsx`

**Implementado (junto da §2, pois a lista depende dele).**

- [x] Botão acessível (`role="option"` + `aria-selected`) com o conteúdo da cidade.
- [x] Exibir `name`, `state?`, `country` (campos do modelo `City` — nunca DTO).
- [x] Acionamento por clique e por teclado (Enter/Space — botão nativo cobre isso).
- [x] Destaque visual ao está selecionada/active (cursor `hover:bg-neutral-50` +
      `bg-neutral-100` quando ativa).
- [x] Testes em `tests/components/search/SearchResultItem.test.tsx` (render com/sem `state`,
      `aria-selected`, `onSelect` e `onActivate` chamados).

---

## Critério de conclusão da fase 05

**Fase concluída — 17 arquivos / 208 testes verdes (etapa 2):**

- [x] `npm run typecheck` e `npm run lint` passam.
- [x] Testes da feature criados e passando (`npm run test`).
- [x] Nenhum `null`/`Not implemented` restante em `src/components/search/` (os dois
      `return null` são intencionais: `idle` renderiza nada; guard `error === null`).
- [x] Nenhum import de `services/` ou DTOs nos componentes (regra §5.2).