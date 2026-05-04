import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { CreatePagoPayload, Pago, PagoResumen, PagoEstadisticas } from '../../modules/pagos/types/pago.types';

const baseUrl = `${env.pagosApiUrl}/pagos`;

export const pagoApi = {
  async getAll(): Promise<Pago[]> {
    const response = await httpClient.get<{ success: boolean; data: Pago[] }>(`${baseUrl}/getAll`);
    return response.data.data;
  },

  async getById(id: number): Promise<Pago> {
    const response = await httpClient.get<{ success: boolean; data: Pago }>(`${baseUrl}/getById/${id}`);
    return response.data.data;
  },

 async getByTrabajador(trabajador_id: number): Promise<{ data: Pago[]; resumen: PagoResumen }> {
  const response = await httpClient.get<{ success: boolean; data: Pago[]; resumen: PagoResumen }>(
    `${baseUrl}/getByTrabajador/${trabajador_id}`
  );
  return { data: response.data.data, resumen: response.data.resumen };
},

  async getByPresupuesto(presupuesto_id: number): Promise<{ data: Pago[]; saldo_pendiente: number; total_presupuesto: number }> {
    const response = await httpClient.get<{ success: boolean; data: Pago[]; saldo_pendiente: number; total_presupuesto: number }>(
      `${baseUrl}/getByPresupuesto/${presupuesto_id}`
    );
    return { data: response.data.data, saldo_pendiente: response.data.saldo_pendiente, total_presupuesto: response.data.total_presupuesto };
  },

  async create(payload: CreatePagoPayload): Promise<Pago> {
    const response = await httpClient.post<{ success: boolean; data: Pago }>(`${baseUrl}/create`, payload);
    return response.data.data;
  },

  async update(payload: { id: number } & Partial<CreatePagoPayload>): Promise<Pago> {
    const { id, ...body } = payload;
    const response = await httpClient.put<{ success: boolean; data: Pago }>(`${baseUrl}/modificar/${id}`, body);
    return response.data.data;
  },

  async cambiarEstado(id: number, estado: string): Promise<Pago> {
    const response = await httpClient.put<{ success: boolean; data: Pago }>(`${baseUrl}/cambiarEstado/${id}`, { estado });
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${baseUrl}/delete/${id}`);
  },

  async getEstadisticas(): Promise<PagoEstadisticas> {
  const response = await httpClient.get<{ success: boolean; data: PagoEstadisticas }>(`${baseUrl}/estadisticas`);
  return response.data.data;
},
};