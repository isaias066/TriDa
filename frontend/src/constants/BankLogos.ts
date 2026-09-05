// ¿Qué? Mapeo de logos PNG de bancos colombianos hacia sus códigos de BD.
// ¿Para qué? Alimentar a BankBadge con las imágenes institucionales reales.
// ¿Impacto? Se usa en filtros, tablas, tarjetas y selector de banco.

import logoBancolombia from '@assets/banks/bancolombia.png';
import logoDavivienda from '@assets/banks/davivienda.png';
import logoBogota from '@assets/banks/bogota.png';
import logoBBVA from '@assets/banks/bbva.png';
import logoAVVillas from '@assets/banks/avvillas.png';
import logoNequi from '@assets/banks/nequi.png';
import logoDaviplata from '@assets/banks/daviplata.png';
import logoScotiabank from '@assets/banks/scotiabank.png';
import logoOccidente from '@assets/banks/occidente.png';
import logoPopular from '@assets/banks/popular.png';
import logoFalabella from '@assets/banks/falabella.png';

const BANK_LOGO_MODULES: Record<string, string> = {
  bancolombia: logoBancolombia,
  davivienda: logoDavivienda,
  bogota: logoBogota,
  bbva: logoBBVA,
  avvillas: logoAVVillas,
  nequi: logoNequi,
  daviplata: logoDaviplata,
  scotiabank: logoScotiabank,
  occidente: logoOccidente,
  popular: logoPopular,
  falabella: logoFalabella,
};

function normalizeBankKey(code?: string | null): string | null {
  if (!code) return null;
  const key = String(code).trim().toLowerCase();
  if (!key || key === 'all' || key === 'sin_asignar') return null;
  return key;
}

/**
 * Retorna la URL importada del logo del banco o null si no aplica.
 */
export function getBankLogoUrl(bankCode?: string | null): string | null {
  const key = normalizeBankKey(bankCode);
  if (!key) return null;
  return BANK_LOGO_MODULES[key] ?? null;
}

export function hasBankLogo(bankCode?: string | null): boolean {
  return getBankLogoUrl(bankCode) != null;
}
