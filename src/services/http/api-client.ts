import axios from 'axios';

import { classifyHttpError } from '@/services/http/errors';

/**
 * Cliente HTTP único da aplicação (ADR-12, stack §9).
 *
 * Única camada que conhece o transporte e a API Key. `services/http` concentra:
 * - base URL (via `VITE_WEATHER_API_BASE_URL`);
 * - timeout da instância;
 * - injeção da API Key (interceptor de requisição);
 * - classificação de erros de transporte (interceptor de resposta).
 *
 * O sinal de abort **não** é tratado aqui: é repassado pelos repositórios via
 * config do Axios (`{ signal }`, ADR-06) — o interceptor de resposta apenas
 * preserva o erro original quando o abort ocorre (`ERR_CANCELED`), para que a
 * camada de data-fetching o trate como concorrência, não como erro de UI.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_WEATHER_API_BASE_URL,
  timeout: 10_000,
});

const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

// Fail-early (anexo-11 item 3): sem chave configurada no build/dev, o módulo
// quebra na carga com mensagem clara em vez de deixar a UI receber 401 no
// fluxo. Copiar `.env.example` para `.env` e preencher a chave da OpenWeather.
if (!apiKey) {
  throw new Error(
    'VITE_WEATHER_API_KEY nao configurada. Copie .env.example para .env e preencha a chave da OpenWeather.',
  );
}

apiClient.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    appid: apiKey,
  };
  return config;
});

// Classificação de erros em ponto único (stack §9): todo erro que sai do
// cliente já é `AppError`. Exceto o cancelamento por abort (`classifyHttpError`
// retorna `null`) — rejeita-se com o erro original para a query tratar como
// concorrência (ADR-06). Erros não-transporte (ex.: `InvalidDataError` dos
// adapters) passam inalterados.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const classified = classifyHttpError(error);
    if (classified === null) {
      return Promise.reject(error);
    }
    return Promise.reject(classified);
  },
);