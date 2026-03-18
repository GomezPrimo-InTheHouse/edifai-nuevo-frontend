export interface Obra {
  id: number;
  nombre: string;
  descripcion?: string | null;
  ubicacion?: string | null;
  tipo_obra_id?: number | null;
  estado_id?: number | null;
  fecha_inicio_estimado?: string | null;
  fecha_fin_estimado?: string | null;
  fecha_inicio_real?: string | null;
  fecha_fin_real?: string | null;
  usuario_creador_id: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ObraFormValues {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  tipo_obra_id: number | '';
  estado_id: number | '';
  fecha_inicio_estimado: string;
  fecha_fin_estimado: string;
  fecha_inicio_real: string;
  fecha_fin_real: string;
  usuario_creador_id: number;
}

export interface TipoObraOption {
  id: number;
  nombre: string;
  descripcion?: string | null;
  active?: boolean;
}

export interface EstadoOption {
  id: number;
  nombre: string;
  descripcion?: string | null;
  ambito: string;
}

export interface CreateObraPayload {
  nombre: string;
  descripcion?: string | null;
  ubicacion?: string | null;
  tipo_obra_id?: number | null;
  estado_id?: number | null;
  fecha_inicio_estimado?: string | null;
  fecha_fin_estimado?: string | null;
  fecha_inicio_real?: string | null;
  fecha_fin_real?: string | null;
  usuario_creador_id: number;
}

export interface UpdateObraPayload extends CreateObraPayload {
  id: number;
}