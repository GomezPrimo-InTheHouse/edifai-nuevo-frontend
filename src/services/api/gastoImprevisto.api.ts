// src/services/api/gastoImprevisto.api.ts
import { env } from '../../app/config/env';

import httpClient from '../httpClient';
import type {
  GastoImprevisto,
  CreateGastoImprevistoPayload,
  UpdateEstadoGastoPayload,
} from '../../modules/gastosImprevistos/types/gastosImprevisto.types';

const BASE = `${env.obraApiUrl}/gastos-imprevistos`;

export const gastoImprevistoApi = {
  async getAll(): Promise<GastoImprevisto[]> {
    const res = await httpClient.get<{ success: boolean; data: GastoImprevisto[] }>(BASE);
    return res.data.data;
  },

  async getByObra(obraId: number): Promise<GastoImprevisto[]> {
    const res = await httpClient.get<{ success: boolean; data: GastoImprevisto[] }>(`${BASE}/obra/${obraId}`);
    return res.data.data;
  },

  async getById(id: number): Promise<GastoImprevisto> {
    const res = await httpClient.get<{ success: boolean; data: GastoImprevisto }>(`${BASE}/${id}`);
    return res.data.data;
  },

  async create(payload: CreateGastoImprevistoPayload): Promise<GastoImprevisto> {
    const res = await httpClient.post<{ success: boolean; data: GastoImprevisto }>(BASE, payload);
    return res.data.data;
  },

  async updateEstado(id: number, payload: UpdateEstadoGastoPayload): Promise<GastoImprevisto> {
    const res = await httpClient.patch<{ success: boolean; data: GastoImprevisto }>(`${BASE}/${id}/estado`, payload);
    return res.data.data;
  },
  async updateDeudor(id: number, payload: { deudor_cliente_id?: number | null; deudor_usuario_id?: number | null }): Promise<GastoImprevisto> {
  const res = await httpClient.patch<{ success: boolean; data: GastoImprevisto }>(`${BASE}/${id}/deudor`, payload);
  return res.data.data;
},

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  },
};