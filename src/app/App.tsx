import { DashboardLayout } from '@/app/DashboardLayout';
import { WeatherDashboard } from '@/app/WeatherDashboard';

/**
 * Ponto de entrada visual da aplicação.
 *
 * Compõe o dashboard completo: `DashboardLayout` (shell responsivo + grade) e
 * `WeatherDashboard` (busca → seleção → clima). Nenhuma lógica aqui — apenas
 * a montagem (arquitetura §5.1).
 */
export function App() {
  return (
    <DashboardLayout>
      <WeatherDashboard />
    </DashboardLayout>
  );
}