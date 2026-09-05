import type { City } from '@/models/City';

interface SearchResultItemProps {
  city: City;
  onSelect: (city: City) => void;
}

/**
 * Item individual da lista de resultados de busca.
 *
 * Apresenta uma cidade (do modelo interno, nunca de DTOs) e notifica a
 * seleção ao pai ao ser acionado.
 *
 * TODO: implementar o item acessível (botão/listbox option) quando a feature
 * for desenvolvida.
 */
export function SearchResultItem(_props: SearchResultItemProps) {
  return null;
}
