import { createElement } from 'react';

import type { WeatherCondition } from '@/models/CurrentWeather';
import { getConditionIcon } from '@/components/weather/condition-icon';

interface ConditionIconProps {
  /** Condição do clima atual ou texto de condição de previsões por hora/dia. */
  condition: WeatherCondition | string;
  className?: string;
}

/**
 * Ícone decorativo da condição climática.
 *
 * Decorativo (`aria-hidden`): a descrição da condição permanece como texto
 * acessível no componente pai. Usa `createElement` porque o ícone é resolvido
 * por função na renderização (o `react-hooks/static-components` não aceita
 * componente atribuído em variável no render).
 */
export function ConditionIcon({ condition, className }: ConditionIconProps) {
  return createElement(getConditionIcon(condition), {
    className,
    'aria-hidden': true,
  });
}
