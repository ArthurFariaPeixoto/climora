import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '@/components/state/EmptyState';

describe('EmptyState (fase 08 §2)', () => {
  it('é uma região de status com a mensagem', () => {
    render(<EmptyState message="Nenhuma cidade encontrada" />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma cidade encontrada',
    );
  });

  it('usa o ícone padrão CloudOff, decorativo', () => {
    const { container } = render(<EmptyState message="Sem previsão" />);
    const icon = container.querySelector('.lucide-cloud-off');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('aceita ícone configurável por contexto', () => {
    const { container } = render(
      <EmptyState message="Sem dados" icon={Inbox} />,
    );
    expect(container.querySelector('.lucide-inbox')).toBeInTheDocument();
    expect(
      container.querySelector('.lucide-cloud-off'),
    ).not.toBeInTheDocument();
  });
});
