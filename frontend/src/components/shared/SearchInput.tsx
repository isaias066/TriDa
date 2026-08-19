// ¿Qué? Input de búsqueda especializado con ícono, debounce integrado y botón de limpiar.
// ¿Para qué? Reemplazar los inputs de búsqueda que estaban dispersos sin debounce
//            y con lógica de "clear" inline.
// ¿Impacto? Todas las búsquedas del sistema usan este componente, garantizando
//           consistencia visual y performance óptimo (evita filtros en cada tecla).

import { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@hooks/useDebounce';
import { Input } from '@components/ui/Input';
import type { InputProps } from '@components/ui/Input';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SearchInputProps extends Omit<InputProps, 'onChange' | 'value' | 'leftIcon' | 'rightIcon' | 'type'> {
  value: string;
  onSearch: (debouncedValue: string) => void;
  onChange?: (value: string) => void;
  debounceDelay?: number;
  showClearButton?: boolean;
  onClear?: () => void;
  minLength?: number;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SearchInput({
  value,
  onSearch,
  onChange,
  debounceDelay = 300,
  showClearButton = true,
  onClear,
  minLength = 0,
  placeholder = 'Buscar...',
  disabled,
  ...restProps
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceDelay);
  const isFirstRender = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // ==============================================================================
  // SINCRONIZAR CON VALOR EXTERNO
  // ==============================================================================

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // ==============================================================================
  // DISPARAR onSearch CON DEBOUNCE
  // ==============================================================================

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debouncedValue.length >= minLength || debouncedValue.length === 0) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, minLength, onSearch]);

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = (): void => {
    setLocalValue('');
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape' && localValue) {
      e.preventDefault();
      handleClear();
    }
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  const showClear = showClearButton && localValue.length > 0 && !disabled;

  return (
    <Input
      ref={inputRef}
      {...restProps}
      type="search"
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      leftIcon={<Search size={16} />}
      rightIcon={
        showClear ? (
          <button
            type="button"
            onClick={handleClear}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              background:     'transparent',
              border:         'none',
              padding:        '4px',
              cursor:         'pointer',
              color:          'var(--text-tertiary)',
              borderRadius:   '4px',
              transition:     'color 0.15s ease, background 0.15s ease',
            }}
            aria-label="Limpiar búsqueda"
            title="Limpiar (Esc)"
          >
            <X size={14} />
          </button>
        ) : undefined
      }
      autoComplete="off"
      aria-label={restProps.label || placeholder}
    />
  );
}