# Fase 01 — Camada `utils/` (funções puras)

> Funções sem efeitos colaterais e sem dependência de UI/rede. São a maior densidade de
> testes unitários (arquitetura §5.6, §11.1). Nenhuma depende de outra camada.
>
> **Referência:** stack §7, §15; arquitetura §5.6, §9.

---

## 1. `src/utils/validation/index.ts` — validação de busca

Define as regras de termo de busca (vazio, muito curto, caracteres inválidos).

- [x] `validateSearchTerm` lança `Not implemented` (`index.ts:7-8`) — implementar as regras:
  - [x] termo vazio/em branco → mensagem de erro;
  - [x] termo muito curto (definir tamanho mínimo) → mensagem de erro;
  - [x] caracteres inválidos (apenas letras, espaços e acentos? definir) → mensagem de erro;
  - [x] termo válido → retorno "ok" (sem erro).
- [x] ⚑ anexo-11 (item 2): definir o tipo de retorno — discriminated union `{ valid: true } | { valid: false; reason: InvalidSearchError }`.
- [x] Função permanece pura (sem acesso a DOM/estado).
- [x] Criar testes em `tests/utils/validation.test.ts` (regras acima; ver fase 09).

## 2. `src/utils/format/index.ts` — formatadores de exibição

> Referência: arquitetura §5.6, §7 (estado derivado); stack §15 (dayjs).

- [ ] `formatTemperature` lança `Not implemented` (`index.ts:7-8`) — implementar `°C`
      (ex.: `"22°C"`) com arredondamento.
- [ ] Criar formatador de vento: velocidade (km/h) e **direção em texto** (N, NE, …)
      a partir de `Wind.degree` (arquitetura §5.6, §7).
- [ ] Criar formatador de umidade (ex.: `"65%"`) e pressão (ex.: `"1013 hPa"`).
- [ ] Criar formatadores de data/hora via **`src/utils/format/dayjs.ts`** (única fonte):
  - [ ] hora curta pt-BR (ex.: `"14h"`) para `HourlyForecast.time`;
  - [ ] dia da semana pt-BR (ex.: `"seg"`) para `DailyForecast.date`;
  - [ ] data/hora da observação (`CurrentWeather.observedAt`);
  - [ ] conversão **unix/UTC** obrigatória (`dayjsUtc.unix(...)`), nunca hora local do ambiente.
- [ ] Decidir e implementar o mapeamento `condição → ícone` (lucide-react) em função pura OU
      no componente de UI (stack §13; decidir local — ver fase 06). Não duplicar em ambos.
- [ ] Todas as funções permanecem puras e usam apenas `models` como entrada.
- [ ] Criar testes em `tests/utils/format.test.ts` (temperatura, vento/direção, umidade, horas,
      dias, timestamps UTC).

## 3. `src/utils/selectors/index.ts` — derivação para exibição

> Referência: arquitetura §5.6; stack §10 (previsão diária derivada dos blocos de 3h).

- [ ] `groupHourlyByDay` lança `Not implemented` (`index.ts:10-11`) — implementar agregação
      dos blocos de 3h por dia:
  - [ ] agrupar por dia (UTC) usando dayjs;
  - [ ] derivar `DailyForecast`: `minC`/`maxC`, `humidityPct`, `precipitationPct`,
        `windSpeedKmh` e `condition` representativa do grupo;
  - [ ] preservar `date` = início do dia (UTC);
  - [ ] retornar lista ordenada por data.
- [ ] (Opcional, se o dashboard precisar) outras métricas derivadas — ex.: média diária,
      máximos, agregação para gráficos (arquitetura §5.6).
- [ ] Funções puras, entrada `HourlyForecast[]` → saída `DailyForecast[]`.
- [ ] Criar testes em `tests/utils/selectors.test.ts` (agrupamento, limites de dia/UTC,
      ordenação, blocos vazios).

## 4. `src/utils/errors/index.ts` — taxonomia e mapa erro → mensagem/ícone

> Referência: arquitetura §9 (taxonomia + mapa em `utils/errors`); stack §8.

**Já existe (`index.ts:11-53`):** interfaces `InvalidSearchError`, `NetworkError`,
`TimeoutError`, `NotFoundError`, `UnauthorizedError`, `ServerError`, `InvalidDataError`
e a união `AppError`.

Pendente (TODO em `index.ts:7-8`):

- [ ] Criar função/mapa `erro → mensagem amigável` para cada tipo da taxonomia
      (ex.: `getErrorMessage(error: AppError): string`).
- [ ] Criar `erro → ícone` (lucide-react) ou deixar o ícone a cargo de `ErrorState`
      (fase 08) — definir e não duplicar.
- [ ] Exportar tipos e funções via barrel se necessário (`utils/errors/index.ts` já é o
      ponto único).
- [ ] Garantir que mensagens sejam apresentáveis ("Cidade não encontrada", "Sem conexão
      com a internet", "Serviço indisponível, tente novamente", "Dados incompletos"…).
- [ ] Criar testes em `tests/utils/errors.test.ts` (mensagem por tipo).

---

## Critério de conclusão da fase 01

- [ ] `npm run typecheck` e `npm run lint` passam.
- [ ] Testes de `utils/*` criados e passando (`npm run test`).
- [ ] Nenhum `TODO`/`Not implemented` restante em `src/utils/` (exceto o mapeamento de
      ícone se diferido para a fase 06/08 — registrar na decisão).