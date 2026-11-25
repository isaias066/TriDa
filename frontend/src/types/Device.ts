export interface Device {
  id_dispositivo: number;
  id_usuario: number;
  tipo_dispositivo: string;
  identificador_unico: string;
  sistema_operativo?: string | null;
  navegador?: string | null;
  confiable: boolean;
  fecha_primer_uso: string;
  fecha_ultimo_uso: string;
}

export interface RegisterDevicePayload {
  identificador_unico: string;
  tipo_dispositivo: string;
  sistema_operativo?: string;
  navegador?: string;
}

export interface UpdateDeviceTrustPayload {
  confiable: boolean;
}
