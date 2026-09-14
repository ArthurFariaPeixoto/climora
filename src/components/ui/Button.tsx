import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual (as 4 da fase 08 §1). */
  variant?: ButtonVariant;
  /** Tamanho compacto ou padrão. */
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-strong',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-canvas',
  ghost: 'text-ink-muted hover:bg-canvas',
  danger: 'bg-danger text-white hover:bg-danger-strong',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium ' +
  'transition-colors focus-visible:outline focus-visible:outline-2 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:pointer-events-none disabled:opacity-50';

/**
 * Botão reutilizável (fase 08 §1).
 *
 * Componente puro, sem estado externo (arquitetura §10.1). `type` default
 * `button`; botões de ação apenas com ícone devem receber `aria-label` (o
 * atributo é propagado naturalmente pelos props).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className ?? ''}`}
      {...props}
    />
  );
}
