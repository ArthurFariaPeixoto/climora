import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '@/app/App';
import { createTestQueryClient } from '@/mocks/testing';

/**
 * Smoke test da aplicação montada (fase 07 §3).
 *
 * O `App` renderiza `DashboardLayout` + `WeatherDashboard` (busca → clima).
 * Com o `QueryClientProvider` de teste, os hooks reais não disparam requisição
 * no estado inicial (termo vazio + nenhuma cidade selecionada → `idle`), então
 * nenhum handler MSW é exigido. Valida o h1 do header, a busca e o prompt
 * inicial do `WeatherDashboard` (placeholder removido).
 */
describe('App', () => {
  it('renderiza o dashboard montado (header, busca e prompt inicial)', () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <App />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Climora' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Buscar cidade' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Busque uma cidade para ver o clima.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Weather Dashboard')).not.toBeInTheDocument();
  });
});
