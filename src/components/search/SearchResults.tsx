import { SearchResultItem } from '@/components/search/SearchResultItem';
import { EmptyState } from '@/components/state/EmptyState';
import { ErrorState } from '@/components/state/ErrorState';
import { LoadingState } from '@/components/state/LoadingState';
import type { CitySearchStatus } from '@/hooks/use-city-search';
import type { City } from '@/models/City';
import type { AppError } from '@/utils/errors';

/**
 * Contrato do painel de resultados da busca (anexo-11 item 9).
 *
 * `SearchBar` colapsa `use-city-search` e entrega os resultados aqui por
 * props — apresentação pura, sem colapsar o hook.
 */
export interface SearchResultsProps {
  /** `id` do `listbox` referenciado por `aria-controls`/`aria-activedescendant`. */
  listboxId: string;
  status: CitySearchStatus;
  cities: City[];
  error: AppError | null;
  /** Índice do item destacado pela navegação por teclado (setas). */
  activeIndex: number;
  onSelect: (city: City) => void;
  /** Destaca o item sob hover/ativação do teclado. */
  onActivate: (index: number) => void;
  /** Ação "tentar novamente" — presente apenas para erros transitórios. */
  onRetry?: () => void;
}

/**
 * Lista de resultados da busca de cidades.
 *
 * Apresentação pura dos estados expostos pelo `use-city-search` (via
 * `SearchBar`, anexo-11 item 9): `loading`/`error`/`empty` usam os
 * componentes de estado; `success` renderiza um `listbox` WAI-ARIA com um
 * `SearchResultItem` (botão `role="option"`) por cidade.
 */
export function SearchResults({
  listboxId,
  status,
  cities,
  error,
  activeIndex,
  onSelect,
  onActivate,
  onRetry,
}: SearchResultsProps) {
  if (status === 'loading') {
    return <LoadingState label="Buscando cidades" />;
  }

  if (status === 'error') {
    if (error === null) return null;
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (status === 'empty') {
    return <EmptyState message="Nenhuma cidade encontrada" />;
  }

  if (status === 'success') {
    return (
      <div
        id={listboxId}
        role="listbox"
        aria-label="Cidades encontradas"
        className="max-h-72 overflow-y-auto rounded-control border border-line bg-surface"
      >
        {cities.map((city, index) => (
          <SearchResultItem
            key={`${city.lat}-${city.lon}`}
            id={`${listboxId}-option-${index}`}
            city={city}
            active={index === activeIndex}
            onSelect={onSelect}
            onActivate={() => onActivate(index)}
          />
        ))}
      </div>
    );
  }

  return null;
}
