import type { City } from '@/models/City';

interface SearchResultItemProps {
  city: City;
  /** `id` da opção (alvo do `aria-activedescendant` do combobox). */
  id: string;
  /** Item destacado pelas setas/hover (`aria-selected` + realce visual). */
  active: boolean;
  onSelect: (city: City) => void;
  onActivate: () => void;
}

/**
 * Item individual da lista de resultados de busca.
 *
 * Apresenta uma cidade do modelo interno (nunca DTO) como um botão nativo
 * com `role="option"` — clique e Enter/Space já são cobertos pelo botão. O
 * destaque do teclado é informado pelo pai via `id`/`active`.
 */
export function SearchResultItem({
  city,
  id,
  active,
  onSelect,
  onActivate,
}: SearchResultItemProps) {
  return (
    <button
      type="button"
      id={id}
      role="option"
      aria-selected={active}
      onClick={() => onSelect(city)}
      onMouseEnter={onActivate}
      className={`block w-full px-3 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        active ? 'bg-accent-soft' : 'hover:bg-canvas'
      }`}
    >
      <span className="font-medium">{city.name}</span>
      {city.state ? (
        <span className="text-ink-muted">, {city.state}</span>
      ) : null}
      <span className="text-ink-muted">, {city.country}</span>
    </button>
  );
}
