import { TrendingUp } from 'lucide-react';
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
        <div className="flex flex-col gap-2 border-b border-line/60 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink sm:text-lg">
              Temperatura e precipitação por hora
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-ink-muted">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0284c7]" />
              <span>Temperatura (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#7dd3fc]" />
              <span>Chuva (%)</span>
            </div>
          </div>
        </div>

        {data.length === 0 ? (
          <EmptyState message="Gráfico indisponível." />
        ) : (
          <div
            role="img"
            aria-label="Gráfico de temperatura e precipitação por hora"
            className="pt-2"
          >
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={data}
                margin={{ top: 10, right: 12, bottom: 4, left: -10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  yAxisId="temperature"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  unit="°"
                  width={34}
                />
                <YAxis
                  yAxisId="precipitation"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  unit="%"
                  width={34}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                    fontSize: '12px',
                    color: '#0f172a',
                  }}
                />
                <Line
                  yAxisId="temperature"
                  type="monotone"
                  dataKey="temperatureC"
                  name="Temperatura (°C)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Bar
                  yAxisId="precipitation"
                  dataKey="precipitationPct"
                  name="Precipitação (%)"
                  fill="#7dd3fc"
                  fillOpacity={0.65}
                  radius={[4, 4, 0, 0]}
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
