/**
 * Cidade como a aplicação a entende (modelo interno de domínio).
 *
 * Independente do formato retornado pela OpenWeather — a ponte entre o DTO
 * e este modelo é feita em `services/adapters`.
 */
export interface City {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}
