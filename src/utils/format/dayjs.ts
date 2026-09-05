import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.locale('pt-br');

/**
 * Ponto central de configuração do dayjs.
 *
 * Todos os módulos devem importar dayjs a partir daqui para garantir o plugin
 * `utc` e a localização pt-BR (stack §15). A OpenWeather entrega timestamps
 * unix em UTC: use `dayjsUtc.unix(ts).format(...)` para conversão
 * determinística.
 */
export const dayjsUtc = dayjs.utc;

export default dayjs;
