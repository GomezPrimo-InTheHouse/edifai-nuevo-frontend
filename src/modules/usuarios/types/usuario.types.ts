// src/modules/usuarios/types/usuario.types.ts
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  rol_nombre?: string;
  estado_id?: number | null;
  estado_nombre?: string | null;
  totp_seed?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  usuario_creador_id?: number | null; // Agregado para mantener consistencia con el nuevo campo
}

export interface UsuarioFormValues {
  nombre: string;
  email: string;
  password: string;
  rol_id: number | '';
  usuario_creador_id: number | null; // Agregado para mantener consistencia con el nuevo campo
}

export interface CreateUsuarioPayload {
  nombre: string;
  email: string;
  password: string;
  rol_id: number;
  usuario_creador_id: number | null; // Agregado para mantener consistencia con el nuevo campo
}

export interface UpdateUsuarioPayload {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
}