import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale('pt-br');

/**
 * Ponto central de configuração do dayjs.
 *
 * Todos os módulos devem importar dayjs a partir daqui para garantir os plugins
 * `utc` e `localizedFormat` e a localização pt-BR (stack §15). A OpenWeather
 * entrega timestamps unix em **segundos** e UTC; use
 * `dayjsFromUnixSeconds(ts).format(...)` para conversão determinística — nunca
 * a hora local do ambiente.
 */
export const dayjsUtc = dayjs.utc;

/**
 * Converte um timestamp unix em segundos (formato da OpenWeather, UTC) em um
 * `Dayjs` configurado em UTC. Uso: `dayjsFromUnixSeconds(ts).format(...)`.
 */
export function dayjsFromUnixSeconds(timestamp: number): dayjs.Dayjs {
  return dayjsUtc(timestamp * 1000);
}

export default dayjs;
