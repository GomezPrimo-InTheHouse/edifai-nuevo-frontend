// src/modules/gastosImprevistos/types/gastoImprevisto.types.ts

export interface GastoImprevisto {
  id: number;
  obra_id: number;
  especialidad_id: number;
  descripcion: string;
  motivo: string;
  monto: number;
  forma_pago_id: number;
  pagado_por_id: number;
  deudor_cliente_id: number | null;
  deudor_usuario_id: number | null;
  estado_id: number;
  fecha: string;
  deudor_automatico: boolean;
  created_at: string;
  updated_at: string;
  // JOINs
  obra_nombre?: string;
  especialidad_nombre?: string;
  forma_pago_nombre?: string;
  estado_nombre?: string;

  pagado_por_nombre?: string;
  ticket_url?: string | null;
  formas_pago?: FormaPagoDetalle[];
}

export interface CreateGastoImprevistoPayload {
  obra_id: number;
  especialidad_id: number;
  descripcion: string;
  motivo: string;
  monto: number;
  forma_pago_id: number;
  pagado_por_id?: number;
  pagado_por_nombre?: string;
  deudor_cliente_id?: number;
  deudor_usuario_id?: number;
  fecha: string;
}

export interface UpdateEstadoGastoPayload {
  estado_id: number;
}

// ── Nuevos tipos ──────────────────────────────────────────────
export interface FormaPagoDetalle {
  forma_pago_id: number;
  forma_pago_nombre?: string;
  monto: number;
}

export interface CreateGastoImprevistoPayloadV2 {
  obra_id: number;
  especialidad_id: number;
  descripcion: string;
  motivo?: string | null;
  monto: number;
  formas_pago: FormaPagoDetalle[];
  pagado_por_id?: number;
  pagado_por_nombre?: string;
  deudor_cliente_id?: number | null;
  deudor_usuario_id?: number | null;
  fecha: string;
  ticket_url?: string | null;
}