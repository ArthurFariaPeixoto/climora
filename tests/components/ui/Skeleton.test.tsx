import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '@/components/ui/Skeleton';

describe('Skeleton (fase 08 §1)', () => {
  it('é apresentação pura, sem semântica de leitura de tela', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveAttribute('role', 'presentation');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('usa a cor do tema e funde a className do consumidor', () => {
    const { container } = render(<Skeleton className="h-6 w-24" />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('bg-skeleton', 'h-6', 'w-24');
  });
});