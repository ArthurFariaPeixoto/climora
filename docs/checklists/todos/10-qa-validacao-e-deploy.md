# Fase 10 — QA final, validação e deploy

> Checagem final de qualidade, performance e publicação. Ao concluir, o projeto está
> **entregável** para avaliação.
>
> **Referência:** stack §13, §17, §19, §24; arquitetura §13, §14, §16, §21 (validação).

---

## 1. Performance (arquitetura §13)

- [x] **Gráficos lazy:** confirmar chunk separado no `dist/` (pesquise por
      `WeatherCharts`/nome do chunk) — sem Recharts no bundle inicial.
- [x] **Cache/dedup:** validar `staleTime` por consulta (cidades 60s, clima 5min) e que
      consultar a mesma cidade duas vezes não refaz requisição.
- [x] **Concorrência/abort:** trocar de cidade rápido não exibe "resposta antiga"
      (ADR-06); request em voo é cancelado/descartado.
- [x] **Retry:** configurado para não martelar 4xx; `retry` padrão coerente.
- [x] **Bundle geral:** `npm run build` + (opcional) `vite build --report`; revisar tamanhos.

## 2. Acessibilidade (final)

- [x] Navegação por teclado no fluxo busca → seleção → widgets.
- [x] Leitor de tela: roles/aria de combobox, alertas, status; foco visível.
- [x] Contraste e tamanhos mínimos; `lang="pt-BR"` já presente no `index.html`.

## 3. Erros e estados (arquitetura §9)

- [x] Tratar `401` como configuração (mensagem clara, não caso de negócio).
- [x] `429`/`5xx` → mensagem de indisponibilidade + retry.
- [x] `NotFoundError` (cidade) → `EmptyState` adequado.
- [x] Nenhum `AxiosError`/DTO cru vaza para a UI (revisar com a taxonomia ativa).

## 4. Segurança (arquitetura §14)

- [x] `.env` fora do repositório (`.gitignore` já cobre); `VITE_*` lidas só em
      `services/http` (ADR-12).
- [x] Nenhum log de payloads com chave.
- [x] Limitação da API key no client `já documentada` (stack §24) — verificar se o README
      final menciona.

## 5. Validação definitiva

- [x] `npm run lint` sem erros.
- [x] `npm run typecheck` sem erros.
- [x] `npm run test` — suíte completa verde (fase 09).
- [x] `npm run build` — `dist/` gerado sem erros.
- [x] `npm run preview` — dashboard abre; fluxo manual completo OK.
- [x] (Opcional) smoke com **API real** explicitamente marcado e separado da suíte padrão.
- [x] `npm run format:check` sem diffs (ou `npm run format` e commitar).

## 6. Documentação final

- [x] Atualizar `README.md`: funcionalidades reais, pré-requisitos, `.env`, scripts, nota
      sobre a API key (substituir trechos "placeholder").
- [x] Checar `docs/stack_definida.md` §25 (próximos passos) — marcar etapas concluídas ou
      acrescentar status.
- [x] Conferir se `docs/decisoes_arquiteturais.md` continua fiel à implementação (se houver
      divergência real, registrar/ajustar com justificativa — não alterar silenciosamente).
- [x] Arquivos `docs/checklists/todos/*` — ao final, riscar/atualizar checkboxes conforme o
      estado real (ou arquivar como histórico).

> **Registro da execução (§6):** `README.md` ganhou seções "Funcionalidades" e "Deploy"
> (artefato estático pronto, sem publicação). `stack_definida.md` §25 marcou passos 1–9 como
> concluídos e o passo 10 como "não publicado — artefato pronto"; §19/§8 tiveram ajustes
> **factuais** de implementação anotados (script `test`/`test:watch`; assinaturas das queries
> e fetchers com `WeatherRequest`/`AbortSignal`) — sem mudança de stack. `decisoes_arquiteturais.md`
> foi **conferido e continua fiel** (verificado: `models` sem imports; `utils` só importa
> `models`; `hooks` limitados a models/data-fetching/repositories; `components/`/`app/` sem
> `services/` nem TanStack; taxonomia dos 7 `kind` e catálogo batem com §9.1/§10.2 — nenhuma
> alteração feita).

---

## Critério de conclusão da fase 10 (ENTREGA)

- [x] Todos os comandos de QA verdes.
- [x] Fluxo manual 100% funcional em produção.
- [x] Documentação atualizada; limitação de segurança registrada.
- [x] Checklist de validação da arquitetura (§21 de `decisoes_arquiteturais.md`) atendido.