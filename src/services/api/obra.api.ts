import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  CreateObraPayload,
  Obra,
  UpdateObraPayload,
} from '../../modules/obras/types/obra.types';

const obraBaseUrl = `${env.obraApiUrl}/obra`;

export const obraApi = {
  // Obtiene todas las obras — backend devuelve { success, obras: [...] }
  async getAll(): Promise<Obra[]> {
    const response = await httpClient.get<{ success: boolean; obras: Obra[] }>(
      `${obraBaseUrl}/getAll`
    );
    return response.data.obras;
  },

  // Obtiene una obra por ID — backend devuelve { success, message, obra: {...} }
  async getById(id: number | string): Promise<Obra> {
    const response = await httpClient.get<{ success: boolean; obra: Obra }>(
      `${obraBaseUrl}/getById/${id}`
    );
    return response.data.obra;
  },

  // Crea una nueva obra — ajustar si el backend devuelve { success, obra: {...} }
  async create(payload: CreateObraPayload): Promise<Obra> {
    const response = await httpClient.post<{ success: boolean; obra: Obra }>(
      `${obraBaseUrl}/create`,
      payload
    );
    return response.data.obra;
  },

  // Actualiza una obra existente
  async update(payload: UpdateObraPayload): Promise<Obra> {
    const { id, ...body } = payload;
    const response = await httpClient.put<{ success: boolean; obra: Obra }>(
      `${obraBaseUrl}/modificar/${id}`,
      body
    );
    return response.data.obra;
  },

  // Elimina una obra por ID
  async remove(id: number | string): Promise<void> {
    await httpClient.delete(`${obraBaseUrl}/delete/${id}`);
  },
};