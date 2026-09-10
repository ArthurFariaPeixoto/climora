import type { LucideIcon } from 'lucide-react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react';

import type { WeatherCondition } from '@/models/CurrentWeather';

/**
 * Mapeamento único `condição → ícone` (lucide-react).
 *
 * Camada de UI (anexo-11 item 11): vive em `components/weather/` e **não** em
 * `utils/` — `utils/` é uma camada pura sem dependência de UI (§5.6).
 *
 * Dois caminhos:
 * - `WeatherCondition` (clima atual) — baseado no grupo/`id` da OpenWeather
 *   (2xx…7xx, 800–804) com fallback por `main`;
 * - `string` (blocos de `HourlyForecast`/`DailyForecast`, anexo-11 item 11) —
 *   o adapter entrega a **descrição** da API (ex.: "Chuva leve"), portanto o
 *   matching por keywords cobre descrições pt-BR e categorias em inglês.
 * Fallback final: `Cloud`.
 */
const ICON_BY_GROUP: Record<number, LucideIcon> = {
  2: CloudLightning, // Thunderstorm
  3: CloudDrizzle, // Drizzle
  5: CloudRain, // Rain
  6: CloudSnow, // Snow
  7: CloudFog, // Atmosphere: mist, fog, haze...
};

const ICON_BY_ID: Record<number, LucideIcon> = {
  800: Sun, // Clear
  801: CloudSun, // Few clouds
  802: Cloud, // Scattered clouds
  803: Cloud, // Broken clouds
  804: Cloud, // Overcast clouds
};

const ICON_BY_MAIN: Record<string, LucideIcon> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  Atmosphere: CloudFog,
  Mist: CloudFog,
  Fog: CloudFog,
  Haze: CloudFog,
};

const TEXT_MATCHERS: ReadonlyArray<readonly [RegExp, LucideIcon]> = [
  [/tempestade|chuva.*trovo|trovoada|raio|thunder|storm/, CloudLightning],
  [/chuvisco|garoa|drizzle/, CloudDrizzle],
  [/neve|granizo|snow/, CloudSnow],
  [/nevoeiro|neblina|n[uéê]voa|mist|fog|haze/, CloudFog],
  [/chuva|rain|aguaceiro|pancada/, CloudRain],
  [/poucas nuvens|parcial|few clouds|cloudsun/, CloudSun],
  [/nublad|nuvens|nuvem|cloud|nublado/, Cloud],
  [/\b(sun|limpo|sol|ensolarado|clear)\b/, Sun],
];

export function getConditionIcon(
  condition: WeatherCondition | string,
): LucideIcon {
  return typeof condition === 'string'
    ? getConditionIconFromText(condition)
    : getConditionIconFromModel(condition);
}

function getConditionIconFromModel(condition: WeatherCondition): LucideIcon {
  const byGroup = ICON_BY_GROUP[Math.floor(condition.id / 100)];
  return byGroup ?? ICON_BY_ID[condition.id] ?? ICON_BY_MAIN[condition.main] ?? Cloud;
}

/** Resolve o ícone a partir de um texto de condição (descrição ou categoria). */
export function getConditionIconFromText(text: string): LucideIcon {
  const normalized = text.toLowerCase();
  for (const [pattern, icon] of TEXT_MATCHERS) {
    if (pattern.test(normalized)) return icon;
  }
  return Cloud;
}