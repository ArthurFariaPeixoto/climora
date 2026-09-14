import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorState } from '@/components/state/ErrorState';
import type { AppError } from '@/utils/errors';

describe('ErrorState (fase 08 §2)', () => {
  it('renderiza a mensagem amigável da taxonomia em alert', () => {
    render(<ErrorState error={{ kind: 'network', message: '' }} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Sem conexão com a internet.');
  });

  it.each([
    ['invalid-search', 'lucide-search-x', 'Digite pelo menos 3 caracteres.'],
    ['network', 'lucide-wifi-off', 'Sem conexão com a internet.'],
    ['timeout', 'lucide-clock', 'A conexão está lenta. Tente novamente.'],
    ['not-found', 'lucide-map-pin-off', 'Cidade não encontrada.'],
    [
      'unauthorized',
      'lucide-key-round',
      'Configuração inválida: verifique a chave de API.',
    ],
    ['server', 'lucide-cloud', 'Serviço indisponível, tente novamente.'],
    [
      'invalid-data',
      'lucide-triangle-alert',
      'Dados incompletos. Tente novamente mais tarde.',
    ],
  ] as const)(
    'exibe o ícone de %s e a mensagem correspondente',
    (kind, iconClass, message) => {
      const { container } = render(
        <ErrorState error={{ kind, message } as AppError} />,
      );

      expect(container.querySelector(`.${iconClass}`)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(message);
    },
  );

  it('ícone é decorativo (aria-hidden)', () => {
    const { container } = render(
      <ErrorState error={{ kind: 'server', message: '' }} />,
    );
    expect(container.querySelector('.lucide-cloud')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('mostra retry apenas para erro transitório com onRetry', async () => {
    const user: UserEvent = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ErrorState error={{ kind: 'server', message: '' }} onRetry={onRetry} />,
    );

    const retry = screen.getByRole('button', { name: 'Tentar novamente' });
    await user.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('não mostra retry para erro transitório sem onRetry', () => {
    render(<ErrorState error={{ kind: 'server', message: '' }} />);

    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
  });

  it('não mostra retry para erro não transitório, mesmo com onRetry', () => {
    render(
      <ErrorState
        error={{ kind: 'not-found', message: '' }}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
  });
});
