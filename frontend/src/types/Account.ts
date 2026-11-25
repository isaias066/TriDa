export type AccountType = "BANCO" | "TARJETA" | "BILLETERA" | "EFECTIVO";

export interface Account {
  id_cuenta: number;
  id_usuario: number;
  nombre: string;
  entidad?: string | null;
  tipo: AccountType;
  numero_enmascarado?: string | null;
  color: string;
  saldo_inicial: number;
  saldo_actual: number;
  estado: boolean;
  fecha_creacion: string;
}

export interface CreateAccountPayload {
  nombre: string;
  entidad?: string;
  tipo: AccountType;
  /** Exactly the last four digits; the full account number never leaves the browser. */
  numero_enmascarado?: string;
  color?: string;
  saldo_inicial?: number;
  estado?: boolean;
}

export interface UpdateAccountPayload {
  nombre?: string;
  entidad?: string;
  tipo?: AccountType;
  numero_enmascarado?: string;
  color?: string;
  estado?: boolean;
}
