export interface Publicacion {
  id: number;
  vendedor_id: number;
  material_id: number | null;
  nombre_material: string;
  descripcion: string | null;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  moneda: string;
  estado: 'activa' | 'vendida' | 'cancelada';
  vendedor_nombre: string;
  vendedor_email: string;
  created_at: string;
  updated_at: string;
}

export interface Transaccion {
  id: number;
  publicacion_id: number;
  comprador_id: number;
  vendedor_id: number;
  cantidad_comprada: number;
  precio_unitario: number;
  moneda: string;
  total: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  archivada: boolean;
  agregado_al_inventario: boolean; // ← nuevo
  nombre_material: string;
  unidad: string;
  comprador_nombre: string;
  comprador_email: string;
  vendedor_nombre: string;
  vendedor_email: string;
  mensajes_no_leidos: number;
  ultimo_mensaje: string | null;
  ultimo_mensaje_at: string | null;
  publicacion_estado: string;
  created_at: string;
  ya_tiene_solicitud?: boolean;
}

export interface Mensaje {
  id: number;
  transaccion_id: number;
  remitente_id: number;
  remitente_nombre: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
}

export interface PublicarMaterialPayload {
  material_id?: number;
  nombre_material: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  moneda?: string;
}

export interface IniciarTransaccionPayload {
  publicacion_id: number;
  cantidad_comprada: number;
}

export interface MensajesNoLeidos {
  transaccion_id: number;
  cantidad: number;
}

export interface MaterialSimilar {
  id: number;
  nombre: string;
  stock_actual: number;
  unidad: string;
  precio_unitario: number;
}