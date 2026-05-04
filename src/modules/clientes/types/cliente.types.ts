export interface Cliente {
  id: number;
  nombre: string;
  apellido?: string | null;
  razon_social?: string | null;
  dni_cuit?: string | null;
  telefono: string;
  direccion?: string | null;
  email?: string | null;
  estado_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  obras?: any[];
}

export interface ClienteFormValues {
  nombre: string;
  apellido: string;
  razon_social: string;
  dni_cuit: string;
  telefono: string;
  direccion: string;
  email: string;
}

export interface CreateClientePayload {
  nombre: string;
  apellido?: string | null;
  razon_social?: string | null;
  dni_cuit?: string | null;
  telefono: string;
  direccion?: string | null;
  email?: string | null;
}