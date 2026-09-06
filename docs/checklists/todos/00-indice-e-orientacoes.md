# Índice e Orientações — Checklists de TODOs do Climora

> **Objetivo:** destrinchar **tudo o que falta implementar** no Climora para que a
> aplicação saia do estado atual (bootstrap) para um dashboard funcional, testado,
> lintado, buildável e publicável.
>
> **Fonte de verdade consultada:** `docs/decisoes_arquiteturais.md` (arquitetura) e
> `docs/stack_definida.md` (stack). Cada checkbox referencia a seção da documentação e o
> arquivo de código correspondente.

---

## 0. Estado atual do projeto

### Concluído (bootstrap — commit `046231c`)

- Vite 7 + React 19 + TypeScript 5.9 (strict) configurados (`vite.config.ts`, `tsconfig*`).
- Tailwind v4 via `@tailwindcss/vite`; `src/index.css` com `@theme` inicial.
- ESLint 9 (flat) + Prettier; scripts `lint`, `format`, `typecheck`.
- Vitest + React Testing Library + jest-dom + user-event + MSW configurados
  (`tests/setup.ts`, `src/mocks/server.ts`).
- Axios instance com `baseURL`, `timeout` e interceptor de chave (`src/services/http/api-client.ts`).
- TanStack Query com `QueryClientProvider` na raiz (`src/main.tsx`).
- dayjs + plugin `utc` + locale pt-BR (`src/utils/format/dayjs.ts`).
- Contratos de domínio completos: `src/models/*` (City, CurrentWeather, HourlyForecast,
  DailyForecast, WeatherRequest).
- DTOs da OpenWeather esboçados (`src/services/dtos/index.ts`).
- Taxonomia de erros tipada (`src/utils/errors/index.ts`) — apenas os tipos, sem mapa de mensagens.
- Componentes base: `components/ui/*` (Card, Button, MetricTile, Skeleton) e
  `components/state/*` (LoadingState, ErrorState, EmptyState) — versões funcionais mínimas.
- Smoke test (`tests/app/App.test.tsx`), lint e typecheck passando.

### Pendente (todo o restante)

Todo o código de **features** é boilerplate: funções lançam `Not implemented`, componentes
retornam `null` e há marcadores `TODO` espalhados (ver anexo `11-inconsistencias-e-decisoes.md`).

---

## 1. Ordem de execução recomendada

A ordem foi definida pela **dependência entre camadas**. Ao concluir cada fase você tem um
estado compilável e testável; ao concluir a fase 07 o **dashboard está funcionando de ponta a ponta**.

| Fase | Arquivo | Entrega ao concluir |
| ---- | ------- | ------------------- |
| 00 | `00-indice-e-orientacoes.md` (este) | Mapa mental do trabalho restante |
| 01 | `01-camada-utils.md` | Funções puras (validação, formatação, seletores, erros) |
| 02 | `02-camada-servicos.md` | Acesso a dados real (endpoints → adapters → http → repositories) |
| 03 | `03-camada-hooks.md` | Lógica de aplicação (queries + hooks de feature) |
| 04 | `04-mocks-e-fixtures.md` | Rede simulada (handlers MSW + fixtures) para testes |
| 05 | `05-feature-busca.md` | Busca de cidades funcional (SearchBar + resultados) |
| 06 | `06-feature-clima.md` | Widgets do clima (atual, métricas, previsões, gráficos lazy) |
| **07** | `07-composicao-dashboard.md` | **Marco: aplicação funcionando** (dashboard montado) |
| 08 | `08-refinamentos-ui-e-design.md` | Polimento visual, variantes, tokens, acessibilidade |
| 09 | `09-testes-por-camada.md` | Suíte de testes completa por camada |
| 10 | `10-qa-validacao-e-deploy.md` | QA final (lint/typecheck/build/test), README e deploy |
| 11 | `11-inconsistencias-e-decisoes.md` | Anexo: inconsistências registradas (resolver inline nas fases 01–03) |

> **Regra de ouro:** cada fase é concluída quando todos os checkboxes estão marcados E os
> dois gatilhos de validação abaixo passam. Só então avance para a próxima.

---

## 2. Validação obrigatória entre fases

Após cada fase, executar e exigir resultado limpo:

```bash
npm run typecheck
npm run lint
npm run test
```

Ao final de 07 (e sempre após mudanças estruturais):

```bash
npm run build
```

---

## 3. Convenções dos checklists

- `- [ ]` = pendente; `- [x]` = concluído.
- Cada item aponta para o **arquivo de código** e a **seção da documentação** correlata.
- Itens com `⚑ anexo-11` possuem uma decisão pendente registrada em
  `11-inconsistencias-e-decisoes.md` — leia o item do anexo antes de executar.
- Itens acompanhados de `npm run <comando>` exigem execução real para serem considerados concluídos.