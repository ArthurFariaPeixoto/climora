import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card } from '@/components/ui/Card';

describe('Card (fase 08 §1)', () => {
  it('renderiza os filhos com o estilo padrão', () => {
    const { container } = render(<Card>Conteúdo</Card>);
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    const card = container.querySelector('section');
    expect(card).toHaveClass('rounded-card', 'border-line', 'bg-surface');
    expect(card).toHaveClass('shadow-card', 'p-4');
  });

  it('aplica a variante highlight', () => {
    const { container } = render(<Card variant="highlight">Destaque</Card>);
    const card = container.querySelector('section');
    expect(card).toHaveClass('border-accent-line', 'bg-accent-soft');
    expect(card).not.toHaveClass('bg-surface');
  });

  it('remove o padding interno com padding="none"', () => {
    const { container } = render(<Card padding="none">Borda a borda</Card>);
    expect(container.querySelector('section')).not.toHaveClass('p-4');
  });

  it('funde a className do consumidor', () => {
    const { container } = render(<Card className="h-full">Custom</Card>);
    expect(container.querySelector('section')).toHaveClass('h-full');
  });
});
