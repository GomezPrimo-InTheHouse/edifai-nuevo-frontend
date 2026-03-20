import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { CreateMaterialPayload, Material, UpdateMaterialPayload } from '../../modules/materiales/types/material.types';

const baseUrl = `${env.materialesApiUrl}/materiales`;

export const materialApi = {
  async getAll(): Promise<Material[]> {
    const response = await httpClient.get<{ success: boolean; data: Material[] }>(`${baseUrl}/getAll`);
    return response.data.data;
  },

  async getById(id: number | string): Promise<Material> {
    const response = await httpClient.get<{ success: boolean; data: Material }>(`${baseUrl}/getById/${id}`);
    return response.data.data;
  },

  async create(payload: CreateMaterialPayload): Promise<Material> {
    const response = await httpClient.post<{ success: boolean; data: Material }>(`${baseUrl}/create`, payload);
    return response.data.data;
  },

  async update(payload: UpdateMaterialPayload): Promise<Material> {
    const { id, ...body } = payload;
    const response = await httpClient.put<{ success: boolean; data: Material }>(`${baseUrl}/modificar/${id}`, body);
    return response.data.data;
  },

  async remove(id: number | string): Promise<void> {
    await httpClient.delete(`${baseUrl}/delete/${id}`);
  },

  async ajustePreciosMasivo(payload: { porcentaje: number; tipo_material_id?: number; motivo?: string; usuario_id?: number }): Promise<void> {
    await httpClient.put(`${baseUrl}/ajustePrecios`, payload);
  },
};