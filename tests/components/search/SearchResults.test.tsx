import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SearchResults, type SearchResultsProps } from '@/components/search/SearchResults';
import { citySearchResultsModel, saoPauloCity } from '@/mocks/fixtures';
import type { City } from '@/models/City';
import type { AppError } from '@/utils/errors';

const LISTBOX_ID = 'search-results';

function baseProps(): SearchResultsProps {
  return {
    listboxId: LISTBOX_ID,
    status: 'success',
    cities: citySearchResultsModel,
    error: null as AppError | null,
    activeIndex: -1,
    onSelect: vi.fn<(city: City) => void>(),
    onActivate: vi.fn<(index: number) => void>(),
  };
}

function renderResults(overrides: Partial<SearchResultsProps> = {}) {
  return render(<SearchResults {...baseProps()} {...overrides} />);
}

describe('SearchResults (fase 05 §2)', () => {
  it('loading: exibe LoadingState em região de status acessível', () => {
    renderResults({ status: 'loading', cities: [] });

    expect(screen.getByRole('status')).toHaveAccessibleName('Buscando cidades');
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('erro retryable: mostra mensagem e botão de retry que chama onRetry', async () => {
    const user: UserEvent = userEvent.setup();
    const onRetry = vi.fn();
    renderResults({
      status: 'error',
      cities: [],
      error: { kind: 'network', message: 'Sem conexão com a internet.' },
      onRetry,
    });

    const alertRegion = screen.getByRole('alert');
    expect(alertRegion).toHaveTextContent('Sem conexão com a internet.');
    const retry = screen.getByRole('button', { name: 'Tentar novamente' });
    await user.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('erro não-retryable: mensagem sem botão de retry', () => {
    renderResults({
      status: 'error',
      cities: [],
      error: {
        kind: 'invalid-search',
        message: 'Digite pelo menos 3 caracteres.',
      },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Digite pelo menos 3 caracteres.',
    );
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
  });

  it('empty: exibe EmptyState com mensagem de nenhuma cidade', () => {
    renderResults({ status: 'empty', cities: [] });

    expect(screen.getByText('Nenhuma cidade encontrada')).toBeInTheDocument();
  });

  it('success: renderiza listbox com id e uma option por cidade', () => {
    renderResults();

    const listbox = screen.getByRole('listbox', {
      name: 'Cidades encontradas',
    });
    expect(listbox).toHaveAttribute('id', LISTBOX_ID);
    expect(screen.getAllByRole('option')).toHaveLength(
      citySearchResultsModel.length,
    );
  });

  it('success: options com ids -option-{n}, conteúdo de name/state/country e aria-selected por padrão', () => {
    renderResults();

    const first = screen.getByRole('option', { name: /São Paulo/ });
    expect(first).toHaveAttribute('id', `${LISTBOX_ID}-option-0`);
    expect(first).toHaveTextContent('São Paulo');
    expect(first).toHaveTextContent('SP');
    expect(first).toHaveTextContent('BR');
    expect(first).toHaveAttribute('aria-selected', 'false');
  });

  it('success: cidade sem state não exibe vírgula extra', () => {
    renderResults();
    expect(screen.getByRole('option', { name: /Rio de Janeiro/ })).toHaveTextContent(
      'Rio de Janeiro, BR',
    );
  });

  it('aria-selected reflete o item ativo da navegação por teclado', () => {
    renderResults({ activeIndex: 1 });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('clique em uma option chama onSelect com a cidade', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect = vi.fn();
    renderResults({ onSelect });

    await user.click(screen.getByRole('option', { name: /São Paulo/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(saoPauloCity);
  });

  it('hover em uma option ativa o item (onActivate com o índice)', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate = vi.fn();
    renderResults({ onActivate, activeIndex: 0 });

    await user.hover(screen.getByRole('option', { name: /Rio de Janeiro/ }));

    expect(onActivate).toHaveBeenCalledWith(1);
  });

  it('idle: não renderiza nada', () => {
    renderResults({ status: 'idle', cities: [] });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});