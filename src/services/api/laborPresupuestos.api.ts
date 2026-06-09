import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  LaborPresupuesto,
  CreateLaborPresupuestoPayload,
  ProveedorExterno,
  CreateProveedorExternoPayload,
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

  async seleccionar(id: number): Promise<void> {
    await httpClient.put(`${base}/labor-presupuestos/${id}/seleccionar`, {});
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${base}/labor-presupuestos/${id}`);
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
};