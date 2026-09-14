import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/Button';

describe('Button (fase 08 §1)', () => {
  it('renderiza o conteúdo e usa type=button por padrão', () => {
    render(<Button>Buscar</Button>);
    const button = screen.getByRole('button', { name: 'Buscar' });
    expect(button).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveTextContent(
      'Buscar',
    );
  });

  it('respeita o type explícito do consumidor', () => {
    render(<Button type="submit">Buscar</Button>);
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it.each([
    ['primary', 'bg-accent'],
    ['secondary', 'border-line-strong'],
    ['ghost', 'text-ink-muted'],
    ['danger', 'bg-danger'],
  ] as const)('aplica a classe da variante %s', (variant, expectedClass) => {
    render(<Button variant={variant}>{variant}</Button>);
    expect(screen.getByRole('button', { name: variant })).toHaveClass(
      expectedClass,
    );
  });

  it('aplica o tamanho sm', () => {
    render(<Button size="sm">Compacto</Button>);
    expect(screen.getByRole('button', { name: 'Compacto' })).toHaveClass(
      'px-3',
      'text-xs',
    );
  });

  it('aplica foco visível e estado desabilitado', () => {
    render(<Button disabled>Buscar</Button>);
    const button = screen.getByRole('button', { name: 'Buscar' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('focus-visible:outline-accent');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('dispara onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Buscar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('propaga aria-label para botões de ação apenas com ícone', () => {
    render(<Button aria-label="Fechar" />);
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
  });
});
