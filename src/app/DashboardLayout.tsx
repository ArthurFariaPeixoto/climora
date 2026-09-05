import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Grade responsiva do dashboard.
 *
 * Única camada responsável por definir a disposição e as quebras de layout
 * (1/2/N colunas por breakpoint — ADR-08). Os widgets permanecem fluidos e
 * ignoram o tamanho da tela.
 *
 * TODO: implementar a grade responsiva real quando o dashboard for montado.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <div className="w-full">{children}</div>;
}
