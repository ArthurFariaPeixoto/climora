import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardLayout } from '@/app/DashboardLayout';

/**
 * Shell responsivo do dashboard (fase 07 §2, arquitetura §5.1/§12, ADR-08).
 *
 * Testa a composição (header + main + children) e as classes de grade por
 * breakpoint (1 coluna mobile / 2 tablet / N desktop) — a grade é decisão
 * exclusiva desta camada.
 */
describe('DashboardLayout (fase 07 §2)', () => {
  it('renderiza o header com a marca e os children no main', () => {
    render(
      <DashboardLayout>
        <p>conteúdo do dashboard</p>
      </DashboardLayout>,
    );

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(
      within(header).getByRole('heading', { name: 'Climora' }),
    ).toBeInTheDocument();

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(within(main).getByText('conteúdo do dashboard')).toBeInTheDocument();
  });

  it('define a grade responsiva 1/2/N colunas e o container com largura máxima', () => {
    render(
      <DashboardLayout>
        <p>bloco</p>
      </DashboardLayout>,
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-6xl', 'mx-auto');

    const grid = main.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'xl:grid-cols-4',
    );
  });
});