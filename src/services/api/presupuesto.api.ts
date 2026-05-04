import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { CreatePresupuestoPayload, Presupuesto, PresupuestoContextoPago } from '../../modules/presupuestos/types/presupuesto.types';

const baseUrl = `${env.materialesApiUrl}/presupuestos`;

export const presupuestoApi = {
  async getAll(): Promise<Presupuesto[]> {
    const response = await httpClient.get<{ success: boolean; data: Presupuesto[] }>(`${baseUrl}/getAll`);
    return response.data.data;
  },

  async getById(id: number | string): Promise<Presupuesto> {
    const response = await httpClient.get<{ success: boolean; data: Presupuesto }>(`${baseUrl}/getById/${id}`);
    return response.data.data;
  },

  async create(payload: CreatePresupuestoPayload): Promise<Presupuesto> {
    const response = await httpClient.post<{ success: boolean; data: Presupuesto }>(`${baseUrl}/create`, payload);
    return response.data.data;
  },

 async update(payload: { id: number; nombre?: string; descripcion?: string; estado_id?: number; costo_mano_obra?: number }): Promise<Presupuesto> {
  const { id, ...body } = payload;
  const response = await httpClient.put<{ success: boolean; data: Presupuesto }>(`${baseUrl}/modificar/${id}`, body);
  return response.data.data;
},

  async remove(id: number | string): Promise<void> {
    await httpClient.delete(`${baseUrl}/delete/${id}`);
  },

  async cambiarEstado(id: number | string, estado_id: number): Promise<void> {
    await httpClient.put(`${baseUrl}/cambiarEstado/${id}`, { estado_id });
  },

  async getContextoPago(id: number | string): Promise<PresupuestoContextoPago> {
  const response = await httpClient.get<{ success: boolean; data: PresupuestoContextoPago }>(
    `${baseUrl}/contextoPago/${id}`
  );
  return response.data.data;
},
};