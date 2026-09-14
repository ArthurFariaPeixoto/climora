import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Grade responsiva do dashboard (arquitetura §5.1, §12; ADR-08).
 *
 * Única camada que decide layout/breakpoints: 1 coluna em mobile, 2 em tablet
 * (`md`) e N em desktop (`xl`). Os widgets permanecem fluidos e ignoram o
 * tamanho da tela — ocupam o espaço dado pelo grid.
 *
 * Composição (fase 07 §3): `DashboardLayout` recebe `children` e delega ao
 * `App` a montagem (`WeatherDashboard`); o header abriga o `<h1>` "Climora"
 * (promovido ao remover o placeholder do `App`). A disposição visual
 * multi-coluna dos widgets só se materializa quando os blocos forem itens
 * diretos da grade (fase 08 — polimento visual); aqui a grade existe e é
 * testável pelas classes.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
          <h1 className="text-lg font-bold">Climora</h1>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {children}
        </div>
      </main>
    </div>
  );
}
