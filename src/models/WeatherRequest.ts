/**
 * Parâmetros de uma consulta de clima (modelo interno).
 *
 * Usado como chave da consulta na camada de data-fetching (cidade + escopo de
 * dados). O `scope` permite futuramente reduzir a quantidade de dados buscada.
 */
export interface WeatherRequest {
  lat: number;
  lon: number;
  scope: 'current' | 'current+forecast';
}
