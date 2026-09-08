# Fase 02 — Camada `services/` (acesso a dados)

> Única camada que conhece a API externa (OpenWeather). Ordem interna: dtos → endpoints →
> adapters → http (erros) → repositories. A UI **nunca** importa serviços diretamente
> (arquitetura §5.2, ADR-11).
>
> **Referência:** stack §9, §10; arquitetura §5.4, §8, §9; ADR-03, ADR-12.

---

## 1. `src/services/dtos/index.ts` — contratos da OpenWeather

> Já existe: `GeocodingLocationDto`, `CurrentWeatherDto`, `ForecastDto`,
> `ForecastBlockDto`, `WeatherConditionDto`, `WindDto`.

- [x] ⚑ anexo-11 (item 4): revisar o contrato contra a **resposta real** da OpenWeather
      (campos usados pelos adapters: `dt_txt` p/ blocos, `rain`/`snow`/`clouds` se usados,
      `sys.country` se necessário etc.).
- [x] Ajustar tipos conforme a revisão (nomes e unidades metric — a API entrega `metric`).
- [x] Documentar, em comentário, o endpoint de origem de cada DTO (`/geo/1.0/direct`,
      `/data/2.5/weather`, `/data/2.5/forecast`).

## 2. `src/services/endpoints/endpoints.ts` — rotas e parâmetros

**Já existe:** constantes de path + `buildCitySearchQuery(term)` (limit 5, lang `pt_br`).

- [x] `buildWeatherQuery` ignora o parâmetro `_scope` (`endpoints.ts:48-57`) — implementar
      a derivação do escopo (TODO `endpoints.ts:44-46`):
  - [x] `scope === 'current'` → só clima atual (`CURRENT_WEATHER_PATH`);
  - [x] `scope === 'current+forecast'` → clima atual + previsão (`FORECAST_PATH`);
  - [x] expor função que devolve o *path* (ou parâmetro) conforme o escopo.
- [x] (Opcional) parametrizar `limit`/`lang` via constantes quando houver configuração
      (TODO `endpoints.ts:24-25`).
- [x] Manter funções puras (sem acesso ao Axios).
- [x] Criar testes em `tests/services/endpoints.test.ts` (parâmetros exatos por escopo).

## 3. `src/services/adapters/` — DTO → modelo (ADR-03)

**`city.adapter.ts`:**
- [x] `mapCityDtoToModel` lança (`city.adapter.ts:12-14`) — mapear `GeocodingLocationDto`
      → `City` (`name`, `country`, `state?`, `lat`, `lon`; tratar `local_names` se aplicável).
      `local_names` não consumido (`name` já localizado via `lang=pt_br`); validação
      runtime de `name`/`country`/`lat`/`lon` → `InvalidDataError`.

**`weather.adapter.ts`:**
- [x] `mapCurrentWeatherDtoToModel` lança (`weather.adapter.ts:11-15`):
  - [x] `temperatureC`, `feelsLikeC`, `minC`, `maxC`, `humidityPct`, `pressureHpa` diretos;
  - [x] `visibilityKm` (m → km);
  - [x] `precipitationPct` (`pop`), `wind.speedKmh` (m/s → km/h), `wind.degree`;
      (`precipitationPct` **omitido** no clima atual — endpoint não expõe `pop`, anexo-11 §4);
  - [x] `condition` (id, description, main);
  - [x] `observedAt` (timestamp unix);
  - [x] dados corrompidos/incompletos → `InvalidDataError` (arquitetura §9).
- [x] `mapForecastBlockDtoToHourlyModel` lança (`weather.adapter.ts:17-20`):
  - [x] `time` (unix), `temperatureC`, `feelsLikeC`, `humidityPct`, `precipitationPct`
        (`pop` → %), `windSpeedKmh` (m/s → km/h), `condition` (description);
  - [x] dados corrompidos → `InvalidDataError`.
- [x] Validar entradas (arrays vazios de `weather`, campos ausentes) e decidir fallback —
      decisão: **sem fallback**, dado corrompido lança `InvalidDataError`.
- [x] Funções puras, sem Axios/DOM.
- [x] Criar testes em `tests/services/adapters/*.test.ts` usando fixtures (fase 04) —
      feliz + corrompido. (Fixtures **inline** nos testes; migrar para `src/mocks/`
      quando a fase 04 criar as fixtures.)

## 4. `src/services/http/errors.ts` — classificador de erros de transporte

**`classifyHttpError` é identidade (`errors.ts:10-11`) — reimplementar** (stack §9):

- [x] Sem `AxiosError` → manter/marcar como erro desconhecido (ou `InvalidDataError`? definir).
      Decisão: **manter (passthrough)** — o erro original é repassado inalterado; preserva
      `InvalidDataError` dos adapters e não rotula erro desconhecido.
- [x] `error.code === 'ECONNABORTED'`/timeout → `TimeoutError` (também `ETIMEDOUT`).
- [x] `error.code` de rede (ex.: `ERR_NETWORK`) → `NetworkError`.
- [x] `error.code === 'ERR_CANCELED'` → cancelamento por abort: **não deve virar erro de UI**
      (repassar/silenciar — é concorrência, ADR-06). Contrato: retorna `null`; o chamador
      repassa o erro original de forma silenciosa.
- [x] `response.status`:
  - [x] `401` → `UnauthorizedError` (erro de configuração, não caso de negócio);
  - [x] `404` → `NotFoundError` (cidade inexistente);
  - [x] `429` → `ServerError` (limite de taxa; sem lógica de retry aqui — fica no cache/query);
  - [x] `5xx` → `ServerError`;
  - [x] outros → fallback tipado. Decisão: `ServerError` (status fora dos mapeados e
        `AxiosError` sem `response`).
- [x] Função pura e testável (mock de `AxiosError` via duck-typing `isAxiosError`).
- [x] Criar testes em `tests/services/http/errors.test.ts`.

## 5. `src/services/http/api-client.ts` — cliente Axios (concluir TODOs)

**Já existe:** instância com `baseURL` (`.env`), `timeout 10s`, interceptor de `appid`,
validação de chave no load (lança se `VITE_WEATHER_API_KEY` ausente).

- [x] Remover o TODO em `api-client.ts:25` (abort) — definir: o sinal de abort é repassado
      **nos repositórios** via config do Axios (`signal`), não no interceptor; documentar.
- [x] Integrar o classificador: interceptor de **resposta** (ou tratamento nos repositórios)
      para que erros propagados sejam sempre `AppError` (TODO `api-client.ts:34`). Escolher um
      único ponto e não duplicar. **Decisão:** interceptor de resposta em `api-client.ts` —
      os repositórios apenas propagam (exceto abort `ERR_CANCELED`, que rejeita com o erro
      original para a query tratar como concorrência).
- [x] ⚑ anexo-11 (item 3): avaliar falha cedo no load do módulo sem chave (comportamento
      atual) vs. erro tratado como `UnauthorizedError` na UI. Documentar a escolha.
      **Decisão:** manter fail-early (ver `11-inconsistencias-e-decisoes.md` item 3).
- [x] Garantir que **somente** `services/http` lê `VITE_WEATHER_API_*` (ADR-12) — verificado
      (apenas `api-client.ts` + tipos em `vite-env.d.ts`).
- [x] Criar teste de integração leve `http + endpoints + adapter` via MSW (stack §16) —
      `tests/services/http/api-client.test.ts` (feliz + 404 + abort). Variáveis de teste em
      `.env.test` commitado (chave fake), carregado pelo Vitest.

## 6. `src/services/repositories/` — fetchers das consultas (ADR-10)

**`city-repository.ts`:**
- [x] `searchCities` lança (`city-repository.ts:12-14`) — implementar:
  - [x] `GET /geo/1.0/direct` com `buildCitySearchQuery(term)` (respeitando sinal de abort);
  - [x] `mapCityDtoToModel` na lista → `City[]`;
  - [x] resposta vazia/404 → `[]` (estado `empty` é traduzido no hook — arquitetura §5.3);
  - [x] propagar `AppError` (nunca `AxiosError` cru).

**`weather-repository.ts`:**
- [x] `getWeather` lança (`weather-repository.ts:20-25`) — implementar conforme escopo:
  - [x] `current` → `GET /data/2.5/weather` → `mapCurrentWeatherDtoToModel`;
  - [x] `current+forecast` → adiciona `GET /data/2.5/forecast` → `mapForecastBlockDtoToHourlyModel`;
  - [x] ⚑ anexo-11 (item 1): o repositório retorna `WeatherResult { current, hourly }` sem
        `daily` (derivado em `utils/selectors`) — manter assim e documentar;
  - [x] propagar `AppError`.
- [x] Respeitar `AbortSignal` (concorrência/descarte — ADR-06, stack §9).
- [x] Criar testes em `tests/services/repositories/*.test.ts` via **MSW** (fase 04).

---

## Critério de conclusão da fase 02

- [x] `npm run typecheck` e `npm run lint` passam.
- [x] Testes de `services/*` criados e passando (`npm run test`).
- [x] Nenhum `Not implemented` restante em `src/services/`.
- [ ] Fluxo manual opcional: com `.env` preenchido e apenas MSW desativado, uma chamada a
      `searchCities('São Paulo')` retorna `City[]`. (Parâmetro: execução sem `npm run dev`.)