import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '@/app/App';
import { weatherServerErrorHandler } from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { createTestQueryClient } from '@/mocks/testing';

/**
 * Fluxo de ponta a ponta com hooks reais + MSW (critério de conclusão da fase
 * 07: "com MSW ativo, o mesmo fluxo é exercitado sem rede real").
 *
 * Diferente de `WeatherDashboard.test.tsx` (hooks mockados — fase 09), aqui o
 * `App` renderiza `SearchBar`/`use-weather` de verdade: busca → seleção →
 * clima percorre geocoding → clima → previsão (handlers padrão) e os widgets
 * são renderizados a partir dos DTOs das fixtures. O setup do MSW usa
 * `onUnhandledRequest: 'error'` — qualquer chamada fora dos handlers falha o
 * teste, garantindo zero rede real.
 */

/** Digita, submete e seleciona a primeira cidade dos handlers (São Paulo). */
async function searchAndSelect(user: UserEvent) {
  await user.type(
    screen.getByRole('combobox', { name: 'Buscar cidade' }),
    'são paulo',
  );
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  await user.click(await screen.findByRole('option', { name: /são paulo/i }));
}

describe('Fluxo de clima com MSW (fase 07 — critério de conclusão)', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('busca → seleção → clima: widgets, métricas, previsões e gráfico', async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <App />
      </QueryClientProvider>,
    );

    await searchAndSelect(user);

    expect(
      await screen.findByRole('heading', { name: 'São Paulo' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/sensação térmica de 22°c/i)).toBeInTheDocument();
    // '65%' também aparece em blocos de previsão (precipitação) — escopa pelo
    // tile de Umidade do `MetricsGrid`.
    const umidadeTile = screen.getByText('Umidade').closest('div');
    expect(umidadeTile).toHaveTextContent('65%');
    expect(screen.getByText('1013 hPa')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Previsão por hora' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Previsão diária' }),
    ).toBeInTheDocument();
    // O gráfico é `React.lazy` (chunk separado) — `findByRole` aguarda a
    // resolução do import dinâmico real pelo `Suspense`. Timeout explícito
    // maior que o padrão (1s): sob a suíte completa (MSW ~30s + workers em
    // paralelo) o import dinâmico do Recharts pode ultrapassar 1s.
    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'Temperatura e precipitação por hora',
        },
        { timeout: 10_000 },
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole(
        'img',
        {
          name: 'Gráfico de temperatura e precipitação por hora',
        },
        { timeout: 10_000 },
      ),
    ).toBeInTheDocument();
  }, 20_000);

  it('erro transitório (500) → estado de erro e retry recupera o dashboard', async () => {
    server.use(weatherServerErrorHandler);

    render(
      <QueryClientProvider
        // `retryDelay: 0` mantém rápidos os retries automáticos da query
        // (erro `server` é transitório, até 2 tentativas) antes do estado de
        // erro; o retry do botão é verificável em seguida.
        client={createTestQueryClient({ queries: { retryDelay: () => 0 } })}
      >
        <App />
      </QueryClientProvider>,
    );

    await searchAndSelect(user);

    // O erro só aparece após os retries automáticos se esgotarem — `findByRole`
    // aguarda a transição `loading → error`.
    const retryButton = await screen.findByRole('button', {
      name: 'Tentar novamente',
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    server.resetHandlers();
    await user.click(retryButton);

    expect(
      await screen.findByRole('heading', { name: 'São Paulo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Previsão por hora' }),
    ).toBeInTheDocument();
  });
});
