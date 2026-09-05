import axios from 'axios';

/**
 * Cliente HTTP único da aplicação (ADR-12, stack §9).
 *
 * Única camada que conhece o transporte e a API Key. `services/http` concentra:
 * - base URL (via `VITE_WEATHER_API_BASE_URL`);
 * - timeout da instância;
 * - injeção da API Key (interceptor);
 * - (futuro) cancelamento por sinal de abort e classificação de erros.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_WEATHER_API_BASE_URL,
  timeout: 10_000,
});

const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

if (!apiKey) {
  throw new Error(
    'VITE_WEATHER_API_KEY nao configurada. Copie .env.example para .env e preencha a chave da OpenWeather.',
  );
}

// TODO: anexar a chave como parâmetro `appid` e repassar o sinal de abort.
apiClient.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    appid: apiKey,
  };
  return config;
});

// TODO: classificar erros via services/http/errors.ts e propagar a taxonomia.
