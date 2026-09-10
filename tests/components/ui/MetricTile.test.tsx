import { render, screen } from '@testing-library/react';
import { Droplets } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { MetricTile } from '@/components/ui/MetricTile';

describe('MetricTile (fase 08 §1)', () => {
  it('renderiza rótulo e valor no estilo padrão', () => {
    render(<MetricTile label="Umidade" value="65%" />);
    expect(screen.getByText('Umidade')).toBeInTheDocument();
    expect(screen.getByText('65%')).toHaveClass('text-lg', 'text-ink');
  });

  it('renderiza o ícone decorativo com aria-hidden', () => {
    const { container } = render(
      <MetricTile label="Umidade" value="65%" icon={Droplets} />,
    );
    const icon = container.querySelector('.lucide-droplets');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('não renderiza ícone quando ausente', () => {
    const { container } = render(<MetricTile label="Umidade" value="65%" />);
    expect(container.querySelector('.lucide-droplets')).not.toBeInTheDocument();
  });

  it('aplica a variante highlight', () => {
    const { container } = render(
      <MetricTile label="Sensação" value="21°C" variant="highlight" />,
    );
    expect(screen.getByText('21°C')).toHaveClass('text-2xl', 'text-accent');
    expect(screen.getByText('21°C')).not.toHaveClass('text-lg');
    expect(container.querySelector('.lucide-droplets')).not.toBeInTheDocument();
  });
});