import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchBar } from '@/components/search/SearchBar';
import { useCitySearch } from '@/hooks/use-city-search';
import type { City } from '@/models/City';
import { citySearchResultsModel, rioCity } from '@/mocks/fixtures';
import type { UseCitySearchResult } from '@/hooks/use-city-search';

vi.mock('@/hooks/use-city-search', () => ({
  useCitySearch: vi.fn(),
}));

const mockedUseCitySearch = vi.mocked(useCitySearch);

function result(overrides: Partial<UseCitySearchResult> = {}): UseCitySearchResult {
  return {
    status: 'idle',
    cities: [],
    error: null,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

const INVALID_SEARCH_MESSAGE = 'Digite pelo menos 3 caracteres.';
const NETWORK_ERROR = 'Sem conexão com a internet.';

let user: UserEvent;
let onSelect: (city: City) => void;

beforeEach(() => {
  user = userEvent.setup();
  onSelect = vi.fn();

  mockedUseCitySearch.mockReset();
  mockedUseCitySearch.mockImplementation((submitted: string) => {
    const trimmed = submitted.trim();
    if (trimmed === '') {
      return result();
    }
    if (trimmed.length < 3) {
      return result({
        status: 'error',
        error: { kind: 'invalid-search', message: INVALID_SEARCH_MESSAGE },
      });
    }
    return result({ status: 'success', cities: citySearchResultsModel });
  });
});

function renderSearchBar() {
  return render(<SearchBar onSelect={onSelect} />);
}

function combobox() {
  return screen.getByRole('combobox', { name: 'Buscar cidade' });
}

describe('SearchBar (fase 05 §1)', () => {
  it('renderiza combobox com label acessível, placeholder e idle', () => {
    renderSearchBar();

    expect(combobox()).toBeInTheDocument();
    expect(combobox()).toHaveAttribute('placeholder', 'Digite o nome de uma cidade');
    expect(combobox()).toHaveAttribute('aria-haspopup', 'listbox');
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    expect(combobox()).not.toHaveAttribute('aria-controls');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('não dispara a busca antes da submissão', async () => {
    renderSearchBar();

    await user.type(combobox(), 'são paulo');

    expect(mockedUseCitySearch).not.toHaveBeenCalledWith('são paulo');
  });

  it('digitar e submeter termo válido dispara a busca e abre o painel', async () => {
    renderSearchBar();

    await user.type(combobox(), 'são paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(mockedUseCitySearch).toHaveBeenCalledWith('são paulo');
    expect(combobox()).toHaveAttribute('aria-expanded', 'true');
    expect(combobox().getAttribute('aria-controls')).toMatch(/-listbox$/);
  });

  it('submeter termo inválido mostra a mensagem de InvalidSearchError', async () => {
    renderSearchBar();

    await user.type(combobox(), 'ab');
    await user.keyboard('{Enter}');

    expect(mockedUseCitySearch).toHaveBeenCalledWith('ab');
    expect(combobox()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(INVALID_SEARCH_MESSAGE);
  });

  it('setas movem o aria-activedescendant pelos resultados', async () => {
    renderSearchBar();

    await user.type(combobox(), 'são paulo');
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowDown}');

    expect(combobox().getAttribute('aria-activedescendant')).toMatch(/-option-0$/);

    await user.keyboard('{ArrowDown}');
    expect(combobox().getAttribute('aria-activedescendant')).toMatch(/-option-1$/);

    await user.keyboard('{ArrowUp}');
    expect(combobox().getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
  });

  it('Enter sem item destacado submete a busca', async () => {
    renderSearchBar();

    await user.type(combobox(), 'são paulo');
    await user.keyboard('{Enter}');

    expect(mockedUseCitySearch).toHaveBeenCalledWith('são paulo');
    expect(combobox()).toHaveAttribute('aria-expanded', 'true');
  });

  it('Enter com item destacado seleciona e chama onSelect, limpando e fechando', async () => {
    renderSearchBar();

    await user.type(combobox(), 'são paulo');
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(rioCity);
    expect(combobox()).toHaveValue('');
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
  });

  it('Escape fecha o painel e limpa o destaque', async () => {
    renderSearchBar();

    await user.type(combobox(), 'são paulo');
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Escape}');

    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    expect(combobox()).not.toHaveAttribute('aria-activedescendant');
  });

  it('Tab fecha o painel ao sair do campo', async () => {
    renderSearchBar();

    await user.type(combobox(), 'são paulo');
    await user.keyboard('{Enter}');
    await user.tab();

    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
  });

  it('estado de erro mostra mensagem em role=alert com retry quando transitório', async () => {
    const refetch = vi.fn();
    mockedUseCitySearch.mockReturnValue(
      result({
        status: 'error',
        error: { kind: 'network', message: NETWORK_ERROR },
        refetch,
      }),
    );
    const user = userEvent.setup();
    renderSearchBar();

    await user.type(combobox(), 'são paulo');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('alert')).toHaveTextContent(NETWORK_ERROR);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('erro de validação não oferece retry', async () => {
    renderSearchBar();

    await user.type(combobox(), 'ab');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('alert')).toHaveTextContent(INVALID_SEARCH_MESSAGE);
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
  });

  it('estado de loading expõe região de status e aria-busy', async () => {
    mockedUseCitySearch.mockReturnValue(
      result({ status: 'loading', isFetching: true }),
    );
    renderSearchBar();

    await user.type(combobox(), 'são paulo');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('status')).toHaveAccessibleName('Buscando cidades');
    expect(combobox()).toHaveAttribute('aria-busy', 'true');
  });
});