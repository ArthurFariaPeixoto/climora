import type { CurrentWeather } from '@/models/CurrentWeather';
import type { HourlyForecast } from '@/models/HourlyForecast';
import type { CurrentWeatherDto, ForecastBlockDto } from '@/services/dtos';

/**
 * Adaptadores — funções puras DTO → modelo (ADR-03).
 *
 * TODO: implementar os mapeamentos completos (campos, unidades métricas,
 * validação de dados corrompidos) quando a integração for feita.
 */
export function mapCurrentWeatherDtoToModel(
  _dto: CurrentWeatherDto,
): CurrentWeather {
  throw new Error('Not implemented');
}

export function mapForecastBlockDtoToHourlyModel(
  _dto: ForecastBlockDto,
): HourlyForecast {
  throw new Error('Not implemented');
}
