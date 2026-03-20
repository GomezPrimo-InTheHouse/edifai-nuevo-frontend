export interface Material {
  id: number;
  nombre: string;
  descripcion?: string | null;
  tipo_material_id?: number | null;
  unidad: string;
  stock_actual: number;
  precio_unitario: number;
  porcentaje_aumento_mensual?: number | null;
  estado_id: number;
  imagen_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MaterialFormValues {
  nombre: string;
  descripcion: string;
  tipo_material_id: number | '';
  unidad: string;
  stock_actual: number | '';
  precio_unitario: number | '';
  porcentaje_aumento_mensual: number | '';
  estado_id: number | '';
  imagen_url: string;
}

export interface CreateMaterialPayload {
  nombre: string;
  descripcion?: string | null;
  tipo_material_id?: number | null;
  unidad: string;
  stock_actual: number;
  precio_unitario: number;
  porcentaje_aumento_mensual?: number | null;
  estado_id: number;
  imagen_url?: string | null;
}

export interface UpdateMaterialPayload extends CreateMaterialPayload {
  id: number;
}

export interface TipoMaterialOption {
  id: number;
  nombre: string;
}

export interface HistorialIncremento {
  id: number;
  material_id: number;
  material_nombre?: string;
  precio_anterior: number;
  precio_nuevo: number;
  porcentaje_aplicado: number;
  motivo?: string | null;
  usuario_id?: number | null;
  created_at: string;
}