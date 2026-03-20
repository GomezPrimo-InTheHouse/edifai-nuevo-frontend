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
}

export interface UpdateLaborPayload extends CreateLaborPayload {
  id: number;
  fecha_inicio_real?: string | null;
  fecha_fin_real?: string | null;
}