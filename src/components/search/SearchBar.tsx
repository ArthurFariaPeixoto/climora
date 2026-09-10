import { useId, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';

import { SearchResults } from '@/components/search/SearchResults';
import { Button } from '@/components/ui/Button';
import { useCitySearch } from '@/hooks/use-city-search';
import type { City } from '@/models/City';
import { isRetryableAppError } from '@/utils/errors';

interface SearchBarProps {
  /** Eleva a cidade selecionada até o `WeatherDashboard` (fase 07). */
  onSelect: (city: City) => void;
}

/**
 * Barra de busca de cidades (fase 05 §1).
 *
 * Guarda o termo digitado (estado de UI, §7) e colapsa o hook de feature
 * `use-city-search` — única ponte entre a UI de busca e a lógica (ADR-11;
 * anexo-11 item 9). O termo só dispara a consulta ao submeter o formulário;
 * a validação fica no hook (`status: 'error'` com `InvalidSearchError`).
 *
 * Combobox WAI-ARIA: o input carrega `role="combobox"` com
 * `aria-expanded`/`aria-controls` e `aria-activedescendant` apontando para o
 * item destacado pelas setas; Escape fecha a lista, Tab/blur fecha e limpa o
 * destaque.
 */
export function SearchBar({ onSelect }: SearchBarProps) {
  const uid = useId();
  const inputId = `${uid}-input`;
  const listboxId = `${uid}-listbox`;

  const [draft, setDraft] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { status, cities, error, refetch } = useCitySearch(submittedTerm);

  function submit() {
    setSubmittedTerm(draft);
    setActiveIndex(-1);
    setOpen(draft.trim() !== '');
  }

  function handleSelect(city: City) {
    onSelect(city);
    setDraft('');
    setSubmittedTerm('');
    setActiveIndex(-1);
    setOpen(false);
  }

  function handleClose() {
    setOpen(false);
    setActiveIndex(-1);
  }

  /** Mantém aberto quando o foco se move para dentro do painel (clique em item/retry). */
  function handleInputBlur(event: FocusEvent<HTMLInputElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && panelRef.current?.contains(next)) return;
    handleClose();
  }

  function moveActive(delta: number) {
    if (cities.length === 0) return;
    setOpen(true);
    setActiveIndex((current) => {
      const next = current + delta;
      if (next < 0) return cities.length - 1;
      if (next >= cities.length) return -1;
      return next;
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const active = activeIndex >= 0 ? cities[activeIndex] : undefined;
      if (active) {
        handleSelect(active);
      } else {
        submit();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
    }
  }

  const loading = status === 'loading';
  const canRetry = status === 'error' && error !== null && isRetryableAppError(error);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-2"
      role="search"
    >
      <div className="flex items-center gap-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          Buscar cidade
        </label>
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder="Digite o nome de uma cidade"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={
            open && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-busy={loading || undefined}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <Button type="submit">Buscar</Button>
      </div>

      <div ref={panelRef}>
        {open ? (
          <SearchResults
            listboxId={listboxId}
            status={status}
            cities={cities}
            error={error}
            activeIndex={activeIndex}
            onSelect={handleSelect}
            onActivate={setActiveIndex}
            onRetry={canRetry ? () => void refetch() : undefined}
          />
        ) : null}
      </div>
    </form>
  );
}