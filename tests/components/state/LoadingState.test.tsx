import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingState } from '@/components/state/LoadingState';

describe('LoadingState (fase 08 §2)', () => {
  it('é uma região de status acessível com rótulo padrão', () => {
    render(<LoadingState />);

    const status = screen.getByRole('status');
    expect(status).toHaveAccessibleName('Carregando dados');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('aceita rótulo customizado para o contexto', () => {
    render(<LoadingState label="Buscando cidades" />);
    expect(screen.getByRole('status')).toHaveAccessibleName('Buscando cidades');
  });

  it('compõe skeletons de altura coerente com os widgets', () => {
    const { container } = render(<LoadingState />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(6);
    expect(container.querySelector('.h-28')).not.toBeNull();
    expect(container.querySelector('.h-40')).not.toBeNull();
    expect(container.querySelectorAll('.h-20').length).toBe(3);
  });
});