import { DashboardLayout } from '@/app/DashboardLayout';

/**
 * Ponto de entrada visual da aplicação.
 *
 * Carrega a composição raiz do dashboard. Em etapas futuras este componente
 * permanece como entrada e delega a montagem visual ao `DashboardLayout`.
 */
export function App() {
  return (
    <DashboardLayout>
      <main className="flex min-h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-3xl font-bold">Climora</h1>
        <p className="text-lg text-neutral-500">Weather Dashboard</p>
      </main>
    </DashboardLayout>
  );
}
