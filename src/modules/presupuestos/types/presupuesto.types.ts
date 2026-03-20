export interface Presupuesto {
  id: number;
  nombre?: string | null;
  descripcion?: string | null;
  labor_id: number;
  obra_id?: number | null;
  estado_id?: number | null;
  total_estimado?: number | null;
  costo_mano_obra?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PresupuestoFormValues {
  nombre: string;
  descripcion: string;
  labor_id: number | '';
  obra_id: number | '';
  estado_id: number | '';
  costo_mano_obra: number | '';
}

export interface CreatePresupuestoPayload {
  nombre?: string | null;
  descripcion?: string | null;
  labor_id: number;
  obra_id?: number | null;
  estado_id?: number | null;
  costo_mano_obra?: number | null;
}

export interface PresupuestoMaterial {
  id: number;
  presupuesto_id: number;
  material_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  material_nombre?: string;
  unidad?: string;
}