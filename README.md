# Climora

Dashboard de monitoramento de clima — aplicação web **exclusivamente frontend** que consome a API OpenWeather. Trabalho de pós-graduação.

## Stack

| Área          | Tecnologia                                      |
| ------------- | ----------------------------------------------- |
| Framework     | React 19                                        |
| Build         | Vite 7                                          |
| Linguagem     | TypeScript 5.9 (strict)                         |
| Data-fetching | TanStack Query 5                                |
| HTTP          | Axios 1 (confinado a `services/http`)           |
| API           | OpenWeather                                     |
| Estilização   | Tailwind CSS 4                                  |
| Gráficos      | Recharts (lazy-loaded)                          |
| Datas         | dayjs + plugin `utc`                            |
| Testes        | Vitest + React Testing Library + Jest-dom + MSW |
| Lint/Format   | ESLint 9 (flat) + Prettier                      |
| Package       | npm                                             |

A arquitetura e a stack estão documentadas em [`docs/decisoes_arquiteturais.md`](docs/decisoes_arquiteturais.md) e [`docs/stack_definida.md`](docs/stack_definida.md).

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Instalação

```bash
npm install
```

## Configuração do `.env`

Copie o exemplo e preencha a chave da OpenWeather:

```bash
cp .env.example .env
```

Variáveis necessárias:

```text
VITE_WEATHER_API_KEY=cole-sua-chave-aqui
VITE_WEATHER_API_BASE_URL=https://api.openweathermap.org
```

> A chave trafega no bundle do frontend (limitação documentada na arquitetura). Nunca commite `.env`.

## Execução local

```bash
npm run dev
```

## Build

```bash
npm run build      # typecheck + build estático em dist/
npm run preview    # preview local do build
```

## Testes

```bash
npm run test        # executa uma vez
npm run test:watch  # modo watch
```

Os testes de integração de `services/http` e `services/repositories` simulam a rede com MSW e
usam valores fake de `VITE_WEATHER_API_KEY`/`VITE_WEATHER_API_BASE_URL` do `.env.test`
(commitado, carregado pelo Vitest no modo `test`). Nenhum teste chama a API real.

## Lint / formatação

```bash
npm run lint         # ESLint
npm run lint:fix
npm run format       # Prettier (escreve)
npm run format:check
```

## Typecheck

```bash
npm run typecheck
```
