import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '@/app/App';

describe('App', () => {
  it('renderiza o placeholder inicial do Climora', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Climora' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Weather Dashboard')).toBeInTheDocument();
  });
});
