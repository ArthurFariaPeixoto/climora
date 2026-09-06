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

- [ ] ⚑ anexo-11 (item 4): revisar o contrato contra a **resposta real** da OpenWeather
      (campos usados pelos adapters: `dt_txt` p/ blocos, `rain`/`snow`/`clouds` se usados,
      `sys.country` se necessário etc.).
- [ ] Ajustar tipos conforme a revisão (nomes e unidades metric — a API entrega `metric`).
- [ ] Documentar, em comentário, o endpoint de origem de cada DTO (`/geo/1.0/direct`,
      `/data/2.5/weather`, `/data/2.5/forecast`).

## 2. `src/services/endpoints/endpoints.ts` — rotas e parâmetros

**Já existe:** constantes de path + `buildCitySearchQuery(term)` (limit 5, lang `pt_br`).

- [ ] `buildWeatherQuery` ignora o parâmetro `_scope` (`endpoints.ts:48-57`) — implementar
      a derivação do escopo (TODO `endpoints.ts:44-46`):
  - [ ] `scope === 'current'` → só clima atual (`CURRENT_WEATHER_PATH`);
  - [ ] `scope === 'current+forecast'` → clima atual + previsão (`FORECAST_PATH`);
  - [ ] expor função que devolve o *path* (ou parâmetro) conforme o escopo.
- [ ] (Opcional) parametrizar `limit`/`lang` via constantes quando houver configuração
      (TODO `endpoints.ts:24-25`).
- [ ] Manter funções puras (sem acesso ao Axios).
- [ ] Criar testes em `tests/services/endpoints.test.ts` (parâmetros exatos por escopo).

## 3. `src/services/adapters/` — DTO → modelo (ADR-03)

**`city.adapter.ts`:**
- [ ] `mapCityDtoToModel` lança (`city.adapter.ts:12-14`) — mapear `GeocodingLocationDto`
      → `City` (`name`, `country`, `state?`, `lat`, `lon`; tratar `local_names` se aplicável).

**`weather.adapter.ts`:**
- [ ] `mapCurrentWeatherDtoToModel` lança (`weather.adapter.ts:11-15`):
  - [ ] `temperatureC`, `feelsLikeC`, `minC`, `maxC`, `humidityPct`, `pressureHpa` diretos;
  - [ ] `visibilityKm` (m → km);
  - [ ] `precipitationPct` (`pop`), `wind.speedKmh` (m/s → km/h), `wind.degree`;
  - [ ] `condition` (id, description, main);
  - [ ] `observedAt` (timestamp unix);
  - [ ] dados corrompidos/incompletos → `InvalidDataError` (arquitetura §9).
- [ ] `mapForecastBlockDtoToHourlyModel` lança (`weather.adapter.ts:17-20`):
  - [ ] `time` (unix), `temperatureC`, `feelsLikeC`, `humidityPct`, `precipitationPct`,
        `windSpeedKmh`, `condition`;
  - [ ] dados corrompidos → `InvalidDataError`.
- [ ] Validar entradas (arrays vazios de `weather`, campos ausentes) e decidir fallback.
- [ ] Funções puras, sem Axios/DOM.
- [ ] Criar testes em `tests/services/adapters/*.test.ts` usando fixtures (fase 04) —
      feliz + corrompido.

## 4. `src/services/http/errors.ts` — classificador de erros de transporte

**`classifyHttpError` é identidade (`errors.ts:10-11`) — reimplementar** (stack §9):

- [ ] Sem `AxiosError` → manter/marcar como erro desconhecido (ou `InvalidDataError`? definir).
- [ ] `error.code === 'ECONNABORTED'`/timeout → `TimeoutError`.
- [ ] `error.code` de rede (ex.: `ERR_NETWORK`) → `NetworkError`.
- [ ] `error.code === 'ERR_CANCELED'` → cancelamento por abort: **não deve virar erro de UI**
      (repassar/silenciar — é concorrência, ADR-06).
- [ ] `response.status`:
  - [ ] `401` → `UnauthorizedError` (erro de configuração, não caso de negócio);
  - [ ] `404` → `NotFoundError` (cidade inexistente);
  - [ ] `429` → `ServerError` (limite de taxa) ou tempo de re-try;
  - [ ] `5xx` → `ServerError`;
  - [ ] outros → fallback tipado.
- [ ] Função pura e testável (mock de `AxiosError`).
- [ ] Criar testes em `tests/services/http/errors.test.ts`.

## 5. `src/services/http/api-client.ts` — cliente Axios (concluir TODOs)

**Já existe:** instância com `baseURL` (`.env`), `timeout 10s`, interceptor de `appid`,
validação de chave no load (lança se `VITE_WEATHER_API_KEY` ausente).

- [ ] Remover o TODO em `api-client.ts:25` (abort) — definir: o sinal de abort é repassado
      **nos repositórios** via config do Axios (`signal`), não no interceptor; documentar.
- [ ] Integrar o classificador: interceptor de **resposta** (ou tratamento nos repositórios)
      para que erros propagados sejam sempre `AppError` (TODO `api-client.ts:34`). Escolher um
      único ponto e não duplicar.
- [ ] ⚑ anexo-11 (item 3): avaliar falha cedo no load do módulo sem chave (comportamento
      atual) vs. erro tratado como `UnauthorizedError` na UI. Documentar a escolha.
- [ ] Garantir que **somente** `services/http` lê `VITE_WEATHER_API_*` (ADR-12).
- [ ] Criar teste de integração leve `http + endpoints + adapter` via MSW (stack §16).

## 6. `src/services/repositories/` — fetchers das consultas (ADR-10)

**`city-repository.ts`:**
- [ ] `searchCities` lança (`city-repository.ts:12-14`) — implementar:
  - [ ] `GET /geo/1.0/direct` com `buildCitySearchQuery(term)` (respeitando sinal de abort);
  - [ ] `mapCityDtoToModel` na lista → `City[]`;
  - [ ] resposta vazia/404 → `[]` (estado `empty` é traduzido no hook — arquitetura §5.3);
  - [ ] propagar `AppError` (nunca `AxiosError` cru).

**`weather-repository.ts`:**
- [ ] `getWeather` lança (`weather-repository.ts:20-25`) — implementar conforme escopo:
  - [ ] `current` → `GET /data/2.5/weather` → `mapCurrentWeatherDtoToModel`;
  - [ ] `current+forecast` → adiciona `GET /data/2.5/forecast` → `mapForecastBlockDtoToHourlyModel`;
  - [ ] ⚑ anexo-11 (item 1): o repositório retorna `WeatherResult { current, hourly }` sem
        `daily` (derivado em `utils/selectors`) — manter assim e documentar;
  - [ ] propagar `AppError`.
- [ ] Respeitar `AbortSignal` (concorrência/descarte — ADR-06, stack §9).
- [ ] Criar testes em `tests/services/repositories/*.test.ts` via **MSW** (fase 04).

---

## Critério de conclusão da fase 02

- [ ] `npm run typecheck` e `npm run lint` passam.
- [ ] Testes de `services/*` criados e passando (`npm run test`).
- [ ] Nenhum `Not implemented` restante em `src/services/`.
- [ ] Fluxo manual opcional: com `.env` preenchido e apenas MSW desativado, uma chamada a
      `searchCities('São Paulo')` retorna `City[]`. (Parâmetro: execução sem `npm run dev`.)