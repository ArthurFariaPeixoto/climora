import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Botão reutilizável.
 *
 * Envolve o botão nativo com estilos base e semântica ARIA. Novas variantes
 * (primária, secundária etc.) serão adicionadas com o design final.
 */
export function Button(props: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
    />
  );
}
