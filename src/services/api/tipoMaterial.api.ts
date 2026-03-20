import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { TipoMaterialOption } from '../../modules/materiales/types/material.types';

const baseUrl = `${env.materialesApiUrl}/tipoMaterial`;

export const tipoMaterialApi = {
  async getAll(): Promise<TipoMaterialOption[]> {
    const response = await httpClient.get<{ success: boolean; data: TipoMaterialOption[] }>(`${baseUrl}/getAll`);
    return response.data.data;
  },

  async create(payload: { nombre: string }): Promise<TipoMaterialOption> {
    const response = await httpClient.post<{ success: boolean; data: TipoMaterialOption }>(`${baseUrl}/create`, payload);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${baseUrl}/delete/${id}`);
  },
};