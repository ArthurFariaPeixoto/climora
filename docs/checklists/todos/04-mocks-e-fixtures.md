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

- [ ] Criar pasta `src/mocks/fixtures/` (ou arquivo único `fixtures.ts` — decida conforme
      o uso).
- [ ] Fixtures de **DTO** (espelhando a OpenWeather):
  - [ ] `GeocodingLocationDto` — lista multi-cidade (com/sem `state`, com/sem `local_names`);
  - [ ] `CurrentWeatherDto` — payload válido completo;
  - [ ] `ForecastDto` com blocos de 3h — quantidade suficiente para **agrupar ≥ 2 dias**
        (40 blocos / 5 dias);
  - [ ] payloads "corrompidos" (campos ausentes/`null`/tipos errados) para adapters.
- [ ] Fixtures de **modelo** (`City[]`, `CurrentWeather`, `HourlyForecast[]`,
      `DailyForecast[]`) para testes de hooks/componentes (estado derivado pronto).
- [ ] Constantes de cenário: cidade com resultados, cidade sem resultado, cidade que
      retorna 404/429/500.

## 2. Handlers MSW — `src/mocks/handlers/index.ts`

**Hoje:** `handlers: HttpHandler[] = []` (vazio). Implementar:

- [ ] Handler de `GET *geo/1.0/direct*` → responde lista de cidades conforme o `q` (match
      com fixtures).
- [ ] Handler de `GET *data/2.5/weather*` → responde `CurrentWeatherDto`.
- [ ] Handler de `GET *data/2.5/forecast*` → responde `ForecastDto`.
- [ ] Handlers de erro por cenário:
  - [ ] `404` (cidade inexistente), `429` (limite), `500` (indisponível);
  - [ ] (avaliar) simulação de network error/timeout para `classifyHttpError`.
- [ ] Handlers parametrizáveis para testes (segunda estratégia): exportar handlers por
      cenário e permitir `server.use(...)` por teste (stack §16).
- [ ] Verificar que `tests/setup.ts` já inicia/reseta/encerra o server (msm — está ok).

## 3. Camada de data-fetching de teste (conceitual)

> A arquitetura §11.2 prevê uma "camada de data-fetching de teste" (provedor controlado em
> memória) para induzir estados em hooks/componentes.

- [ ] Definir helper(s) para testes de hooks: `QueryClient` isolado com `retry: false` +
      repositórios/queries mockados (padrão do mapa §16).
- [ ] Definir helper para induzir estados nas queries (idle/loading/success/empty/error)
      nos testes de hooks de feature.
- [ ] Garantir `staleTime/gcTime` controlados em testes (sem interferência de cache).
- [ ] Não usar API real em hipótese alguma (única exceção: smoke explícito de fase 10,
      se desejado).

## 4. Validação da infraestrutura de mocks

- [ ] `ResizeObserver` mockado no setup (já está em `tests/setup.ts:7-13`) — confirmar que
      segue valendo após testes de `WeatherCharts`.
- [ ] `onUnhandledRequest: 'error'` (já configurado) — garante que nenhuma chamada não
      mockada passa despercebida.
- [ ] Rodar `npm run test` após criar fixtures/handlers — smoke test segue passando.

---

## Critério de conclusão da fase 04

- [ ] `npm run typecheck` e `npm run lint` passam.
- [ ] Os testes das fases 02–03 (adapters, http, repositories, queries/hooks) conseguem
      rodar **sem rede real** usando estas fixtures/handlers.