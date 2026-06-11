export interface Presupuesto {
  id: number;
  nombre?: string | null;
  descripcion?: string | null;
  labor_id: number;
  obra_id?: number | null;
  obra_nombre?: string | null;
  estado_id?: number | null;
  total_estimado?: number | null;
  costo_mano_obra?: number | null;
  precio_unitario?: number | null;
  cantidad?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  // campos del JOIN
  trabajador_id?: number | null;
  jefe_nombre?: string | null;
  jefe_apellido?: string | null;
  jefe_especialidad?: string | null;
  equipo?: PresupuestoMiembro[];
}

export interface PresupuestoFormValues {
  nombre: string;
  descripcion: string;
  labor_id: number | '';
  obra_id: number | '';
  estado_id: number | '';
  costo_mano_obra: number | '';
  precio_unitario: number | '';
  cantidad: number | '';
}

export interface CreatePresupuestoPayload {
  nombre?: string | null;
  descripcion?: string | null;
  labor_id: number;
  obra_id?: number | null;
  estado_id?: number | null;
  costo_mano_obra?: number | null;
  precio_unitario?: number | null;
  cantidad?: number | null;
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

export interface PresupuestoMiembro {
  id: number;
  nombre: string;
  apellido: string;
  especialidad?: string | null;
}

export interface PresupuestoContextoPago {
  presupuesto: {
    id: number;
    nombre?: string | null;
    descripcion?: string | null;
    costo_mano_obra?: number | null;
    total_estimado?: number | null;
    precio_unitario?: number | null;
    cantidad?: number | null;
    estado_id?: number | null;
  };
  labor: {
    id: number;
    nombre?: string | null;
    descripcion?: string | null;
    estado_id?: number | null;
    estado_nombre?: string | null;
  } | null;
  obra: {
    id: number;
    nombre?: string | null;
  } | null;
  trabajador: {
    id: number;
    nombre?: string | null;
    apellido?: string | null;
    especialidad?: string | null;
  } | null;
  cliente: {
    id: number;
    nombre?: string | null;
    apellido?: string | null;
    telefono?: string | null;
    email?: string | null;
    dni_cuit?: string | null;
  } | null;
  equipo: PresupuestoMiembro[];
  materiales: {
    id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    material_nombre?: string | null;
    unidad?: string | null;
  }[];
}