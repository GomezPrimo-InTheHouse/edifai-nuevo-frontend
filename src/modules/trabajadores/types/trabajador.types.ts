export interface Trabajador {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string | null;
  telefono?: string | null;
  fecha_ingreso?: string | null;
  especialidad_id?: number | null;
  estado_id?: number | null;
  jefe_id?: number | null | any;
  usuario_id?: number | null;
  usuario_creador_id: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TrabajadorFormValues {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  telefono: string;
  fecha_ingreso: string;
  especialidad_id: number | '';
  estado_id: number | '';
  jefe_id: number | '' | any;
  usuario_creador_id: number;
}

export interface CreateTrabajadorPayload {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  telefono?: string | null;
  fecha_ingreso?: string | null;
  especialidad_id?: number | null;
  estado_id?: number | null;
  jefe_id?: number | null;
  usuario_creador_id: number;
}

export interface UpdateTrabajadorPayload extends CreateTrabajadorPayload {
  id: number;
}

export interface EspecialidadOption {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado_id?: number | null;
}

export interface JefeConEquipo extends Trabajador {
  equipo: Trabajador[];
}