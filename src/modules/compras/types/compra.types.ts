import type { SectorTipo } from '../../obras/types/sector.types';

export interface Compra {
  id: number;
  obra_id: number;
  obra_nombre?: string;
  sector_id: number | null;
  sector_tipo?: SectorTipo;
  sector_valor?: string;
  especialidad_id: number;
  especialidad_nombre?: string;
  material_id: number | null;
  material_nombre?: string;
  cantidad: number | null;
  descripcion: string;
  proveedor: string | null;
  monto: number;
  fecha: string;
  comprobante_url: string | null;
  usuario_id: number;
  usuario_nombre?: string;
  propietario_id: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompraPayload {
  obra_id: number;
  sector_id?: number | null;
  especialidad_id: number;
  descripcion: string;
  proveedor?: string;
  monto: number;
  fecha: string;
  comprobante_url?: string;
  material_id?: number | null;
  cantidad?: number | null;
}

export interface UpdateCompraPayload {
  id: number;
  obra_id: number;
  sector_id?: number | null;
  especialidad_id: number;
  descripcion: string;
  proveedor?: string;
  monto: number;
  fecha: string;
  comprobante_url?: string;
}

export interface ComprasPorObraResponse {
  data: Compra[];
  total_compras: number;
}

export interface AnalizarComprobantePayload {
  descripcion?: string;
  monto?: number;
  fecha?: string;
  proveedor?: string;
}