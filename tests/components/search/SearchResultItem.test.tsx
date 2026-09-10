import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SearchResultItem } from '@/components/search/SearchResultItem';
import { rioCity, saoPauloCity } from '@/mocks/fixtures';

const OPTION_ID = 'listbox-option-0';

function renderItem() {
  return render(
    <SearchResultItem
      id={OPTION_ID}
      city={saoPauloCity}
      active={false}
      onSelect={vi.fn()}
      onActivate={vi.fn()}
    />,
  );
}

describe('SearchResultItem (fase 05 §3)', () => {
  it('renderiza como botão role="option" com name/state/country', () => {
    renderItem();

    const option = screen.getByRole('option', { name: /São Paulo/ });
    expect(option.tagName).toBe('BUTTON');
    expect(option).toHaveAttribute('id', OPTION_ID);
    expect(option).toHaveTextContent('São Paulo');
    expect(option).toHaveTextContent('SP');
    expect(option).toHaveTextContent('BR');
  });

  it('cidade sem state não exibe o campo (nem vírgula extra)', () => {
    render(
      <SearchResultItem
        id={OPTION_ID}
        city={rioCity}
        active={false}
        onSelect={vi.fn()}
        onActivate={vi.fn()}
      />,
    );

    expect(screen.getByRole('option')).toHaveTextContent('Rio de Janeiro, BR');
  });

  it('aria-selected e classe de destaque refletem o estado active', () => {
    const { rerender } = renderItem();

    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'false');

    rerender(
      <SearchResultItem
        id={OPTION_ID}
        city={saoPauloCity}
        active
        onSelect={vi.fn()}
        onActivate={vi.fn()}
      />,
    );

    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option')).toHaveClass('bg-neutral-100');
  });

  it('clique chama onSelect com a cidade', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <SearchResultItem
        id={OPTION_ID}
        city={saoPauloCity}
        active={false}
        onSelect={onSelect}
        onActivate={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('option'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(saoPauloCity);
  });

  it('mouseEnter chama onActivate', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate = vi.fn();

    render(
      <SearchResultItem
        id={OPTION_ID}
        city={saoPauloCity}
        active={false}
        onSelect={vi.fn()}
        onActivate={onActivate}
      />,
    );

    await user.hover(screen.getByRole('option'));

    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});