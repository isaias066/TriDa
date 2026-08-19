// ¿Qué? Selector de banco global con dropdown personalizado (usado en el sidebar).
// ¿Para qué? Aislar la lógica del selector de bancos que estaba embebida en el
//            sidebar.jsx original, con dropdown y click-outside.
// ¿Impacto? Se usa dentro del Sidebar. El banco seleccionado afecta a todas las
//           páginas del sistema (via BankContext).

import { useRef, useState } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useClickOutside } from '@hooks/useClickOutside';
import { BankBadge } from '@components/shared/BankBadge';
import { Tooltip } from '@components/ui/Tooltip';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarBankSelectorProps {
  collapsed: boolean;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarBankSelector({ collapsed }: SidebarBankSelectorProps) {
  const {
    banksWithAll,
    selectedBank,
    selectedBankInfo,
    setSelectedBank,
    loading,
  } = useBank();

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useClickOutside<HTMLDivElement>(
    () => setOpen(false),
    { enabled: open, additionalRefs: [triggerRef] }
  );

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleSelectBank = (bankId: string): void => {
    setSelectedBank(bankId);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    position:   'relative',
    padding:    collapsed ? '10px 12px 8px' : '10px 12px',
    fontFamily: 'Inter, sans-serif',
  };

  // ==============================================================================
  // MODO COLAPSADO — Solo dot del banco actual
  // ==============================================================================

  if (collapsed) {
    return (
      <div style={wrapperStyle} className="sidebar-bank-selector sidebar-bank-selector-collapsed">
        <Tooltip
          content={selectedBankInfo?.name ?? 'Sin banco seleccionado'}
          position="right"
        >
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '100%',
              padding:        '8px 0',
            }}
          >
            <BankBadge
              bank={selectedBankInfo}
              dotOnly
              size="md"
            />
          </div>
        </Tooltip>
      </div>
    );
  }

  // ==============================================================================
  // MODO EXPANDIDO — Botón con dropdown
  // ==============================================================================

  const triggerButtonStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    gap:            '8px',
    width:          '100%',
    padding:        '10px 12px',
    background:     open ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
    border:         `1px solid ${open ? 'rgba(99, 102, 241, 0.3)' : 'var(--border)'}`,
    borderRadius:   '8px',
    color:          'var(--text-primary)',
    fontSize:       '12px',
    fontFamily:     'Inter, sans-serif',
    fontWeight:     500,
    cursor:         'pointer',
    transition:     'background 0.15s ease, border-color 0.15s ease',
    outline:        'none',
  };

  const iconStyle: React.CSSProperties = {
    color:      'var(--text-tertiary)',
    flexShrink: 0,
  };

  const bankInfoStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '6px',
    flex:       1,
    minWidth:   0,
  };

  const dotStyle: React.CSSProperties = {
    width:        '8px',
    height:       '8px',
    borderRadius: '50%',
    background:   selectedBankInfo?.color ?? '#6366F1',
    flexShrink:   0,
    boxShadow:    `0 0 0 2px ${selectedBankInfo?.color ?? '#6366F1'}20`,
  };

  const bankNameStyle: React.CSSProperties = {
    flex:         1,
    textAlign:    'left',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
    fontWeight:   600,
  };

  const chevronStyle: React.CSSProperties = {
    color:      'var(--text-tertiary)',
    transition: 'transform 0.2s ease',
    transform:  open ? 'rotate(180deg)' : 'none',
    flexShrink: 0,
  };

  const dropdownStyle: React.CSSProperties = {
    position:      'absolute',
    top:           'calc(100% + 4px)',
    left:          '12px',
    right:         '12px',
    background:    'var(--bg-secondary)',
    border:        '1px solid var(--border)',
    borderRadius:  '8px',
    boxShadow:     '0 8px 24px rgba(0, 0, 0, 0.3)',
    zIndex:        50,
    padding:       '4px',
    maxHeight:     '340px',
    overflowY:     'auto',
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    animation:     'bank-dropdown-in 0.15s ease-out',
  };

  const optionBaseStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    gap:            '8px',
    padding:        '8px 10px',
    fontSize:       '12px',
    fontWeight:     500,
    color:          'var(--text-primary)',
    background:     'transparent',
    border:         'none',
    borderRadius:   '6px',
    cursor:         'pointer',
    textAlign:      'left',
    width:          '100%',
    transition:     'background 0.15s ease',
    fontFamily:     'Inter, sans-serif',
  };

  const optionDotStyle = (color: string): React.CSSProperties => ({
    width:        '10px',
    height:       '10px',
    borderRadius: '50%',
    background:   color,
    flexShrink:   0,
    boxShadow:    `0 0 0 2px ${color}20`,
  });

  const optionNameStyle: React.CSSProperties = {
    flex:         1,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  };

  const checkIconStyle: React.CSSProperties = {
    color:      '#6366F1',
    flexShrink: 0,
  };

  const loadingStyle: React.CSSProperties = {
    padding:       '12px',
    fontSize:      '11px',
    color:         'var(--text-tertiary)',
    textAlign:     'center',
    fontStyle:     'italic',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      style={wrapperStyle}
      className="sidebar-bank-selector"
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        style={triggerButtonStyle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Banco seleccionado: ${selectedBankInfo?.name ?? 'Ninguno'}. Click para cambiar.`}
      >
        <Building2 size={13} style={iconStyle} strokeWidth={1.8} />

        <div style={bankInfoStyle}>
          <span style={dotStyle} aria-hidden="true" />
          <span style={bankNameStyle}>
            {selectedBankInfo?.name ?? 'Cargando...'}
          </span>
        </div>

        <ChevronDown size={13} style={chevronStyle} />
      </button>

      {/* Dropdown de opciones */}
      {open && (
        <div
          ref={dropdownRef as React.RefObject<HTMLDivElement>}
          style={dropdownStyle}
          role="listbox"
          aria-label="Lista de bancos disponibles"
        >
          {loading && (
            <div style={loadingStyle}>Cargando bancos...</div>
          )}

          {!loading && banksWithAll.map((bank) => {
            const isSelected = bank.id === selectedBank;

            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => handleSelectBank(bank.id)}
                style={optionBaseStyle}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span style={optionDotStyle(bank.color)} aria-hidden="true" />
                <span style={optionNameStyle}>{bank.name}</span>
                {isSelected && <Check size={13} style={checkIconStyle} />}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes bank-dropdown-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}