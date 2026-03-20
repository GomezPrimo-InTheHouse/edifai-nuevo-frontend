import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { PresupuestoMaterial } from '../../modules/presupuestos/types/presupuesto.types';

const baseUrl = `${env.materialesApiUrl}/presupuestoMateriales`;

export const presupuestoMaterialApi = {
  async getByPresupuesto(presupuesto_id: number): Promise<PresupuestoMaterial[]> {
    const response = await httpClient.get<{ success: boolean; data: PresupuestoMaterial[] }>(
      `${baseUrl}/getByPresupuesto/${presupuesto_id}`
    );
    return response.data.data;
  },

  async add(payload: { presupuesto_id: number; material_id: number; cantidad: number }): Promise<PresupuestoMaterial> {
    const response = await httpClient.post<{ success: boolean; data: PresupuestoMaterial }>(`${baseUrl}/add`, payload);
    return response.data.data;
  },

  async updateCantidad(id: number, cantidad: number): Promise<void> {
    await httpClient.put(`${baseUrl}/update/${id}`, { cantidad });
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${baseUrl}/remove/${id}`);
  },
};