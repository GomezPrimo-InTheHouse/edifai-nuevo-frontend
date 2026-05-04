export interface Pago {
  id: number;
  presupuesto_id: number;
  trabajador_id: number;
  monto: number;
  fecha: string;
  motivo?: string | null;
  forma_pago_id?: number | null;
  estado: string;
  trabajador_nombre?: string;
  trabajador_apellido?: string;
  presupuesto_nombre?: string;
  forma_pago_nombre?: string;
  presupuesto_total?: number | null; // ← nuevo
  created_at?: string | null;
  updated_at?: string | null;
}
export interface PagoResumen {
  total_pagado: number;
  total_parcial: number;
  saldo_pendiente: number;
  total_cobrado: number;
  
}

export interface PagoFormValues {
  presupuesto_id: number | '';
  trabajador_id: number | '';
  monto: number | '';
  fecha: string;
  motivo: string;
  forma_pago_id: number | '';
  estado: string;
}

export interface CreatePagoPayload {
  presupuesto_id: number;
  trabajador_id: number;
  monto: number;
  fecha: string;
  motivo?: string | null;
  forma_pago_id?: number | null;
  estado?: string;
}

export interface FormaPago {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface PagoEstadisticas {
  totales: {
    total_pagado: string;
    total_parcial: string;
    total_pendiente: string;
    total_cancelado: string;
    total_general: string;
    cantidad_pagos: string;
  };
  por_trabajador: { id: number; trabajador: string; total_cobrado: string; cantidad_pagos: string }[];
  por_mes: { mes: string; mes_label: string; total: string; cantidad: string }[];
  por_forma_pago: { forma_pago: string; total: string; cantidad: string }[];
}