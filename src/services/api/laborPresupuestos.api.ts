import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  LaborPresupuesto,
  CreateLaborPresupuestoPayload,
  ProveedorExterno,
  CreateProveedorExternoPayload,
  UnidadMedida,
  AnalizarDocumentoResponse,
} from '../../modules/labores/types/labor.types';

const base = env.laboresApiUrl;

export const laborPresupuestosApi = {
  async getByLabor(labor_id: number): Promise<LaborPresupuesto[]> {
    const res = await httpClient.get<{ success: boolean; data: LaborPresupuesto[] }>(
      `${base}/labor-presupuestos/${labor_id}`
    );
    return res.data.data;
  },

  async create(labor_id: number, payload: CreateLaborPresupuestoPayload): Promise<LaborPresupuesto> {
    const res = await httpClient.post<{ success: boolean; data: LaborPresupuesto }>(
      `${base}/labor-presupuestos/${labor_id}`,
      payload
    );
    return res.data.data;
  },

  async seleccionar(id: number): Promise<{ es_proveedor_externo: boolean; proveedor_nombre: string | null }> {
  const res = await httpClient.put<{
    success: boolean;
    data: { es_proveedor_externo: boolean; proveedor_nombre: string | null };
  }>(`${base}/labor-presupuestos/${id}/seleccionar`, {});
  return res.data.data;
},

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${base}/labor-presupuestos/${id}`);
  },

  async getUnidades(): Promise<UnidadMedida[]> {
    const res = await httpClient.get<{ success: boolean; data: UnidadMedida[] }>(
      `${base}/labor-presupuestos/unidades-medida`
    );
    return res.data.data;
  },

  async analizarDocumento(payload: {
    imagen_base64?: string;
    media_type?: string;
    texto_libre?: string;
  }): Promise<AnalizarDocumentoResponse> {
    const res = await httpClient.post<{ success: boolean; data: AnalizarDocumentoResponse }>(
      `${base}/labor-presupuestos/analizar-documento`,
      payload
    );
    return res.data.data;
  },
};

export const proveedoresExternosApi = {
  async getAll(): Promise<ProveedorExterno[]> {
    const res = await httpClient.get<{ success: boolean; data: ProveedorExterno[] }>(
      `${base}/proveedores-externos`
    );
    return res.data.data;
  },

  async create(payload: CreateProveedorExternoPayload): Promise<ProveedorExterno> {
    const res = await httpClient.post<{ success: boolean; data: ProveedorExterno }>(
      `${base}/proveedores-externos`,
      payload
    );
    return res.data.data;
  },

  async vincularTrabajador(
    proveedor_id: number,
    trabajador_id: number,
    labor_id?: number
  ): Promise<{ trabajador_id: number; trabajador_nombre: string }> {
    const res = await httpClient.put<{
      success: boolean;
      data: { trabajador_id: number; trabajador_nombre: string };
    }>(`${base}/proveedores-externos/${proveedor_id}/vincular-trabajador`, {
      trabajador_id,
      labor_id,
    });
    return res.data.data;
  },
};