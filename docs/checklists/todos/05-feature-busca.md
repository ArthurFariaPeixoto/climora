# Fase 05 — Feature: busca de cidades

> `components/search/*` colapsa o hook `use-city-search` (ADR-11) — é a única ponte entre a
> UI e a lógica da busca. Componentes são apresentação pura: recebem `models` + estados e
> callbacks.
>
> **Referência:** stack §12; arquitetura §5.2, §6 (Fase A), §7, §10.2, §10.3.

---

## 1. `src/components/search/SearchBar.tsx`

**Hoje retorna `null`.** Implementar:

- [ ] Campo de input com `label` acessível (ou `aria-label`).
- [ ] Estado local do termo digitado (`useState`) — estado de UI (§7).
- [ ] Submissão via formulário (`onSubmit`) que dispara a busca por `use-city-search`.
- [ ] Combobox/listbox com ARIA:
  - [ ] `role="combobox"` no input + `aria-expanded`/`aria-controls`;
  - [ ] `aria-activedescendant` ao navegar pelos resultados;
  - [ ] navegação por setas ↑/↓ + Enter/Tab, Escape fecha.
- [ ] Validação do termo na UI (mensagem de `InvalidSearchError` quando aplicável).
- [ ] Estados: `idle` (placeholder), `loading` (busca em andamento), erro (mensagem).
- [ ] Compõe `SearchResults` (ou delega ao pai — decidir contraparte com a fase 07;
      ver anexo-11 item 9 — fluxo de seleção até `WeatherDashboard`).
- [ ] Callback `onSelect(city: City)` para a seleção subir até `WeatherDashboard`.
- [ ] Testes em `tests/components/search/SearchBar.test.tsx` (digitar, submeter, setas,
      escolher item, estado de erro/loading — hooks mockados, fase 09).

## 2. `src/components/search/SearchResults.tsx`

**Hoje retorna `null`.** Implementar:

- [ ] Consumir o resultado de `use-city-search` (por props ou colapsando o hook, conforme
      decisão de composição — anexo-11 item 9).
- [ ] Renderizar:
  - [ ] `loading` → `LoadingState`/skeleton;
  - [ ] `error` → `ErrorState` (com retry quando aplicável);
  - [ ] `empty` → `EmptyState` ("Nenhuma cidade encontrada");
  - [ ] `success` → lista de `SearchResultItem`;
- [ ] `role="listbox"` na lista; itens com `role="option"` e `aria-selected`.
- [ ] Limites visuais: lista com max-height/scroll quando muitos resultados.
- [ ] Fechar/limpar resultados ao selecionar (decisão com SearchBar).
- [ ] Testes em `tests/components/search/SearchResults.test.tsx` (4 estados + interação).

## 3. `src/components/search/SearchResultItem.tsx`

**Hoje retorna `null` (props já tipadas: `city`, `onSelect`).** Implementar:

- [ ] Botão acessível (`role="option"` + `aria-selected`) com o conteúdo da cidade.
- [ ] Exibir `name`, `state?`, `country` (campos do modelo `City` — nunca DTO).
- [ ] Acionamento por clique e por teclado (Enter/Space — botão nativo cobre isso).
- [ ] Destaque visual ao está selecionada/active (cursor + `active`).
- [ ] Testes em `tests/components/search/SearchResultItem.test.tsx` (render + `onSelect`
      chamado).

---

## Critério de conclusão da fase 05

- [ ] `npm run typecheck` e `npm run lint` passam.
- [ ] Testes da feature criados e passando (`npm run test`).
- [ ] Nenhum `null`/`Not implemented` restante em `src/components/search/`.
- [ ] Nenhum import de `services/` ou DTOs nos componentes (regra §5.2).