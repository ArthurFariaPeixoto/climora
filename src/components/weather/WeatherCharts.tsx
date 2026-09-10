import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { EmptyState } from '@/components/state/EmptyState';
import { Card } from '@/components/ui/Card';
import type { DailyForecast } from '@/models/DailyForecast';
import type { HourlyForecast } from '@/models/HourlyForecast';
import { toHourlyChartData } from '@/utils/selectors';

interface WeatherChartsProps {
  /** Blocos de 3h — dados de origem do gráfico (derivação em `utils/selectors`). */
  hourly: HourlyForecast[];
  /** Contrato das fases 07 (linha diária é item opcional do §5 — não renderizada). */
  daily?: DailyForecast[];
}

/**
 * Gráficos do dashboard (único consumer de Recharts).
 *
 * **Default export** para `React.lazy` na fase 07 (`WeatherDashboard` + `<Suspense>`),
 * mantendo o Recharts em chunk separado (arquitetura §13; stack §14).
 *
 * Linha de temperatura (eixo °C) + barras de precipitação % (eixo direito) a partir de
 * `toHourlyChartData` — derivação pré-formatada em `utils`, nunca dados brutos aqui
 * (arquitetura §5.6). Acessibilidade via heading + `role="img"`/`aria-label` (Recharts
 * v3 não expõe `accessibilityLayer`). Lista vazia não derruba o dashboard (arquitetura
 * §9.2): fallback `EmptyState`.
 */
export default function WeatherCharts({ hourly }: WeatherChartsProps) {
  const data = toHourlyChartData(hourly);

  return (
    <Card>
      <div className="flex h-full flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Temperatura e precipitação por hora
        </h2>
        {data.length === 0 ? (
          <EmptyState message="Gráfico indisponível." />
        ) : (
          <div
            role="img"
            aria-label="Gráfico de temperatura e precipitação por hora"
          >
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  yAxisId="temperature"
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  fontSize={12}
                />
                <YAxis
                  yAxisId="precipitation"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  fontSize={12}
                />
                <Tooltip />
                <Line
                  yAxisId="temperature"
                  type="monotone"
                  dataKey="temperatureC"
                  name="Temperatura (°C)"
                  // Recharts aplica como atributo SVG (não resolve CSS var()) —
                  // valores espelham os tokens do tema: accent / accent-line.
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Bar
                  yAxisId="precipitation"
                  dataKey="precipitationPct"
                  name="Precipitação (%)"
                  fill="#7dd3fc"
                  fillOpacity={0.5}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}