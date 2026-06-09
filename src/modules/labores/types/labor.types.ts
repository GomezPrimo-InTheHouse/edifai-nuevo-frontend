export interface Labor {
  id: number;
  nombre: string;
  descripcion?: string | null;
  obra_id: number;
  trabajador_id?: number | null;
  especialidad_id?: number | null;
  estado_id?: number | null;
  fecha_inicio_estimada?: string | null;
  fecha_fin_estimada?: string | null;
  fecha_inicio_real?: string | null;
  fecha_fin_real?: string | null;
  usuario_creador_id: number;
  created_at?: string | null;
  updated_at?: string | null;
  modo?: 'rapido' | 'cotizacion' | null;  // ← agregar esta línea

  obra_nombre?: string | null;
  trabajador_nombre?: string | null;
  trabajador_apellido?: string | null;
  especialidad_nombre?: string | null;
}

export interface LaborFormValues {
  nombre: string;
  descripcion: string;
  obra_id: number | '';
  trabajador_id: number | '';
  especialidad_id: number | '';
  estado_id: number | '';
  fecha_inicio_estimada: string;
  fecha_fin_estimada: string;
  fecha_inicio_real: string;
  fecha_fin_real: string;
  usuario_creador_id: number;
}

export interface CreateLaborPayload {
  nombre: string;
  descripcion?: string | null;
  obra_id: number;
  trabajador_id?: number | null;
  especialidad_id?: number | null;
  estado_id?: number | null;
  fecha_inicio_estimada?: string | null;
  fecha_fin_estimada?: string | null;
  usuario_creador_id: number;
  modo?: 'rapido' | 'cotizacion' | null;  // ← agregar esta línea

}

export interface UpdateLaborPayload extends CreateLaborPayload {
  id: number;
  fecha_inicio_real?: string | null;
  fecha_fin_real?: string | null;
}

export interface LaborDeObra {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado_id?: number | null;
  estado_nombre?: string | null;
  especialidad_id?: number | null;
  especialidad_nombre?: string | null;
  trabajador_id?: number | null;
  trabajador_nombre?: string | null;
  fecha_inicio_estimada?: string | null;
  fecha_fin_estimada?: string | null;
  fecha_inicio_real?: string | null;
  fecha_fin_real?: string | null;
}

// ── Modo de labor ─────────────────────────────────────────────
export type LaborModo = 'rapido' | 'cotizacion';

// ── Labor extendida con modo ──────────────────────────────────
// Agregar campo modo a la interfaz Labor existente
// (modificar la interfaz Labor agregando esta línea):
// modo?: LaborModo | null;

// ── Proveedores externos ──────────────────────────────────────
export interface ProveedorExterno {
  id: number;
  nombre: string;
  propietario_id?: number | null;
  created_at?: string | null;
}

export interface CreateProveedorExternoPayload {
  nombre: string;
}

// ── Presupuestos de labor ─────────────────────────────────────
export type LaborPresupuestoEstado = 'pendiente' | 'seleccionado' | 'no_seleccionado';
export type LaborPresupuestoCalidad = 'alta' | 'media' | 'baja';

export interface LaborPresupuesto {
  id: number;
  labor_id: number;
  trabajador_id?: number | null;
  proveedor_externo_id?: number | null;
  precio: number;
  plazo_dias?: number | null;
  calidad?: LaborPresupuestoCalidad | null;
  garantia?: string | null;
  notas?: string | null;
  estado: LaborPresupuestoEstado;
  notificar_trabajador: boolean;
  created_at?: string | null;
  // Campos enriquecidos desde JOIN
  trabajador_nombre?: string | null;
  proveedor_nombre?: string | null;
}

export interface CreateLaborPresupuestoPayload {
  trabajador_id?: number | null;
  proveedor_externo_id?: number | null;
  precio: number;
  plazo_dias?: number | null;
  calidad?: LaborPresupuestoCalidad | null;
  garantia?: string | null;
  notas?: string | null;
  notificar_trabajador?: boolean;
}