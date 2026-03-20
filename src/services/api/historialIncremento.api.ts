import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { HistorialIncremento } from '../../modules/materiales/types/material.types';

const baseUrl = `${env.materialesApiUrl}/historial`;

export const historialIncrementoApi = {
  async getAll(): Promise<HistorialIncremento[]> {
    const response = await httpClient.get<{ success: boolean; data: HistorialIncremento[] }>(`${baseUrl}/getAll`);
    return response.data.data;
  },

  async getByMaterial(material_id: number): Promise<HistorialIncremento[]> {
    const response = await httpClient.get<{ success: boolean; data: HistorialIncremento[] }>(`${baseUrl}/getByMaterial/${material_id}`);
    return response.data.data;
  },
};