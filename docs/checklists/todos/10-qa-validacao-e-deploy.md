# Fase 10 — QA final, validação e deploy

> Checagem final de qualidade, performance e publicação. Ao concluir, o projeto está
> **entregável** para avaliação.
>
> **Referência:** stack §13, §17, §19, §24; arquitetura §13, §14, §16, §21 (validação).

---

## 1. Performance (arquitetura §13)

- [ ] **Gráficos lazy:** confirmar chunk separado no `dist/` (pesquise por
      `WeatherCharts`/nome do chunk) — sem Recharts no bundle inicial.
- [ ] **Cache/dedup:** validar `staleTime` por consulta (cidades 60s, clima 5min) e que
      consultar a mesma cidade duas vezes não refaz requisição.
- [ ] **Concorrência/abort:** trocar de cidade rápido não exibe "resposta antiga"
      (ADR-06); request em voo é cancelado/descartado.
- [ ] **Retry:** configurado para não martelar 4xx; `retry` padrão coerente.
- [ ] **Bundle geral:** `npm run build` + (opcional) `vite build --report`; revisar tamanhos.

## 2. Acessibilidade (final)

- [ ] Navegação por teclado no fluxo busca → seleção → widgets.
- [ ] Leitor de tela: roles/aria de combobox, alertas, status; foco visível.
- [ ] Contraste e tamanhos mínimos; `lang="pt-BR"` já presente no `index.html`.

## 3. Erros e estados (arquitetura §9)

- [ ] Tratar `401` como configuração (mensagem clara, não caso de negócio).
- [ ] `429`/`5xx` → mensagem de indisponibilidade + retry.
- [ ] `NotFoundError` (cidade) → `EmptyState` adequado.
- [ ] Nenhum `AxiosError`/DTO cru vaza para a UI (revisar com a taxonomia ativa).

## 4. Segurança (arquitetura §14)

- [ ] `.env` fora do repositório (`.gitignore` já cobre); `VITE_*` lidas só em
      `services/http` (ADR-12).
- [ ] Nenhum log de payloads com chave.
- [ ] Limitação da API key no client `já documentada` (stack §24) — verificar se o README
      final menciona.

## 5. Validação definitiva

- [ ] `npm run lint` sem erros.
- [ ] `npm run typecheck` sem erros.
- [ ] `npm run test` — suíte completa verde (fase 09).
- [ ] `npm run build` — `dist/` gerado sem erros.
- [ ] `npm run preview` — dashboard abre; fluxo manual completo OK.
- [ ] (Opcional) smoke com **API real** explicitamente marcado e separado da suíte padrão.
- [ ] `npm run format:check` sem diffs (ou `npm run format` e commitar).

## 6. Documentação final

- [ ] Atualizar `README.md`: funcionalidades reais, pré-requisitos, `.env`, scripts, nota
      sobre a API key (substituir trechos "placeholder").
- [ ] Checar `docs/stack_definida.md` §25 (próximos passos) — marcar etapas concluídas ou
      acrescentar status.
- [ ] Conferir se `docs/decisoes_arquiteturais.md` continua fiel à implementação (se houver
      divergência real, registrar/ajustar com justificativa — não alterar silenciosamente).
- [ ] Arquivos `docs/checklists/todos/*` — ao final, riscar/atualizar checkboxes conforme o
      estado real (ou arquivar como histórico).

## 7. Deploy (stack §19)

- [ ] Hospedar `dist/` em host estático (Vercel, Netlify, GitHub Pages, Cloudflare Pages).
- [ ] HTTPS ativo (exigência para `navigator.geolocation`/chamadas seguras).
- [ ] Configurar variáveis no host: `VITE_WEATHER_API_KEY`, `VITE_WEATHER_API_BASE_URL`.
- [ ] Validar a instância publicada: busca, seleção, clima, previsões e gráfico.

---

## Critério de conclusão da fase 10 (ENTREGA)

- [ ] Todos os comandos de QA verdes.
- [ ] Fluxo manual 100% funcional em produção.
- [ ] Documentação atualizada; limitação de segurança registrada.
- [ ] Projeto publicado (ou com instruções claras de publicação no README).
- [ ] Checklist de validação da arquitetura (§21 de `decisoes_arquiteturais.md`) atendido.