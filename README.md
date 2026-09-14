# Climora

Dashboard de monitoramento de clima — aplicação web **exclusivamente frontend** que consome a API OpenWeather. Trabalho de pós-graduação.

## Funcionalidades

- **Busca de cidades por nome** (geocodificação OpenWeather) — combobox acessível
  (WAI-ARIA) com navegação por teclado (setas, Enter, Escape) e estados de
  carregando/vazio/erro;
- **Clima atual** — temperatura, sensação térmica, condição com ícone e horário
  da observação;
- **Métricas** — umidade, vento (velocidade + direção), mín/máx, pressão,
  precipitação (quando disponível) e visibilidade;
- **Previsão por hora** — blocos de 3h com hora, condição, temperatura e
  precipitação;
- **Previsão diária** — derivada dos blocos de 3h (agrupamento por dia em
  `utils/selectors`);
- **Gráfico** de temperatura + precipitação por hora (Recharts, lazy-loaded —
  chunk separado no build);
- **Estados explícitos** — loading/erro/vazio; erros classificados por tipo
  (rede, timeout, 401, 404, 429, 5xx, dados inválidos) com retry apenas para
  falhas transitórias;
- **Cache em memória** das consultas (cidades ~60s, clima ~5min) com
  cancelamento/descarte da requisição ao trocar de cidade;
- **Responsivo e acessível** — layout fluido (Tailwind), foco visível, `roles`/`aria`
  e `lang="pt-BR"`.

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

## Deploy

O build gera um artefato **estático** em `dist/` (HTML/CSS/JS). Ele pode ser
publicado em qualquer host estático — Vercel, Netlify, GitHub Pages, Cloudflare
Pages etc. — por upload do `dist/` ou importação do repositório.

Antes de publicar, defina `VITE_WEATHER_API_KEY` no ambiente do host. A chave é
embutida no bundle (veja a nota na seção [Configuração do `.env`](#configuração-do-env)).

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
