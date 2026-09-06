# AGENTS.md

Dashboard de clima (frontend-only, API OpenWeather) — trabalho de pós-graduação. Docs e comentários em pt-BR.

## Ao finalizar QUALQUER atividade — OBRIGATÓRIO

1. Revise `docs/checklists/todos/*` e marque `- [x]` cada item concluído (não conclua checkboxes sem verificação real).
2. Atualize `README.md` e este arquivo com o que mudou (novos scripts, comportamento, decisões).
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
- Estado atual: bootstrap (fase 00) concluído; fases 01–11 pendentes — código de features ainda lança `Not implemented`/tem TODO.

## Comandos

- `npm run dev` · `npm run build` (typecheck + build em `dist/`)
- `npm run typecheck` · `npm run lint` · `npm run format`
- `npm run test` (uma vez) · `npm run test:watch`
- Ambiente: Node 20.19+/22.12+, npm; `.npmrc` tem `legacy-peer-deps=true` (bug do arborist — não remover).
- `.env` local a partir de `.env.example`; nunca commitar. Testes usam MSW com `onUnhandledRequest: 'error'` (toda chamada precisa de handler) e `ResizeObserver` mockado em `tests/setup.ts`.