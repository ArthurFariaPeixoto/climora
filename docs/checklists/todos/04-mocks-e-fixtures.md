# Fase 04 — Mocks e fixtures (rede simulada para testes)

> `src/mocks/` é usado **apenas em testes**, nunca em produção (arquitetura §5.7). A
> fronteira preferida de mock é a camada de data-fetching; `http`/`repositories` são testados
> em nível de rede via MSW (stack §16).
>
> **Referência:** stack §16, §21; arquitetura §5.7, §11.1, §11.2.

---

## 1. Fixtures de DTOs e modelos

> Ainda **não existem** (`src/mocks` só tem `handlers/` e `server.ts`). Criar data de exemplo
> por estado de sucesso e por cenário de erro.

- [x] Criar pasta `src/mocks/fixtures/` (DTOs, modelos e cenários em arquivos
      separados + barrel em `index.ts`).
- [x] Fixtures de **DTO** (espelhando a OpenWeather):
  - [x] `GeocodingLocationDto` — lista multi-cidade (com/sem `state`, com/sem `local_names`);
  - [x] `CurrentWeatherDto` — payload válido completo;
  - [x] `ForecastDto` com blocos de 3h — quantidade suficiente para **agrupar ≥ 2 dias**
        (40 blocos / 5 dias);
  - [x] payloads "corrompidos" (campos ausentes/`null`/tipos errados) para adapters.
- [x] Fixtures de **modelo** (`City[]`, `CurrentWeather`, `HourlyForecast[]`,
      `DailyForecast[]`) para testes de hooks/componentes (estado derivado pronto).
- [x] Constantes de cenário: cidade com resultados, cidade sem resultado, cidade que
      retorna 404/429/500.

## 2. Handlers MSW — `src/mocks/handlers/index.ts`

**Hoje:** `handlers: HttpHandler[] = []` (vazio). Implementar:

- [x] Handler de `GET *geo/1.0/direct*` → responde lista de cidades conforme o `q` (match
      com fixtures).
- [x] Handler de `GET *data/2.5/weather*` → responde `CurrentWeatherDto`.
- [x] Handler de `GET *data/2.5/forecast*` → responde `ForecastDto`.
- [x] Handlers de erro por cenário:
  - [x] `404` (cidade inexistente), `429` (limite), `500` (indisponível);
  - [x] (avaliar) simulação de network error/timeout para `classifyHttpError`.
        **Avaliado:** `HttpResponse.error()` simula `ERR_NETWORK` → `network` (coberto em
        testes de repositório). Timeout **não** é simulado em rede — o timeout do
        `apiClient` é 10s e atrasaria/flakizaria os testes; a classificação
        `ECONNABORTED`/`ETIMEDOUT` é coberta por unit em `tests/services/http/errors.test.ts`.
- [x] Handlers parametrizáveis para testes (segunda estratégia): exportar handlers por
      cenário e permitir `server.use(...)` por teste (stack §16).
- [x] Verificar que `tests/setup.ts` já inicia/reseta/encerra o server (msm — está ok).

## 3. Camada de data-fetching de teste (conceitual)

> A arquitetura §11.2 prevê uma "camada de data-fetching de teste" (provedor controlado em
> memória) para induzir estados em hooks/componentes.

- [x] Definir helper(s) para testes de hooks: `QueryClient` isolado com `retry: false` +
      repositórios/queries mockados (padrão do mapa §16). **Implementado:** `src/mocks/testing/`
      com `createTestQueryClient`/`createQueryClientWrapper` (arquitetura §5.7/§11.2 — a camada
      de data-fetching de teste fica em `mocks/`); os repositórios seguem mockados por arquivo
      (`vi.mock` hoisted).
- [x] Definir helper para induzir estados nas queries (idle/loading/success/empty/error)
      nos testes de hooks de feature. **Implementado:** `deferred<T>()` em
      `src/mocks/testing/` p/ segurar `loading` (transição `loading → success/error` via
      `act`); `success`/`empty`/`error` via `mockResolvedValueOnce`/`mockRejectedValueOnce`
      com fixtures; `idle` pelos gating de termo vazio/`null`.
- [x] Garantir `staleTime/gcTime` controlados em testes (sem interferência de cache):
      `QueryClient` fresco por teste com `gcTime: 0` e `retry: false` —
      `createTestQueryClient` aceita overrides p/ testes de query (fase 09).
- [x] Não usar API real em hipótese alguma (única exceção: smoke explícito de fase 10,
      se desejado). Nenhuma mudança — repositórios mockados nos hooks + MSW na integração.

## 4. Validação da infraestrutura de mocks

- [x] `ResizeObserver` mockado no setup (já está em `tests/setup.ts:7-13`) — confirmar que
      segue valendo após testes de `WeatherCharts`. **Confirmado:** `ResizeObserverMock` em
      `globalThis` (linhas 7–13, observado a partir da fase 04); `WeatherCharts` (fase 06/07)
      consumirá o mesmo mock — sem mudanças necessárias.
- [x] `onUnhandledRequest: 'error'` (já configurado) — garante que nenhuma chamada não
      mockada passa despercebida. **Confirmado:** `tests/setup.ts:16`; suíte verde comprova
      que nenhuma chamada real escapou.
- [x] Rodar `npm run test` após criar fixtures/handlers — smoke test segue passando.
      **Rodado:** 14 arquivos / 180 testes verdes (20/02 na validação da fase; smoke
      `tests/app/App.test.tsx` incluso).

---

## Critério de conclusão da fase 04

- [x] `npm run typecheck` e `npm run lint` passam. **Rodado:** verdes na validação da fase
      (14/09).
- [x] Os testes das fases 02–03 (adapters, http, repositories, queries/hooks) conseguem
      rodar **sem rede real** usando estas fixtures/handlers. **Rodado:** suíte completa
      (180 testes) verde sob MSW com `onUnhandledRequest: 'error'` — nenhuma chamada à API
      real.