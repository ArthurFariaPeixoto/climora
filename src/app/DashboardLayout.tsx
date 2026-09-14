import type { ReactNode } from 'react';
import { CloudSun } from 'lucide-react';

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
 * Composição: `DashboardLayout` recebe `children` e delega ao
 * `App` a montagem (`WeatherDashboard`); o header abriga o `<h1>` "Climora".
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink antialiased">
      <header className="border-b border-line bg-surface shadow-xs">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent shadow-xs">
              <CloudSun className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-ink">
                Climora
              </h1>
              <p className="text-[11px] font-medium text-ink-muted">
                Dashboard Meteorológico
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tempo Real
            </span>
          </div>
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
