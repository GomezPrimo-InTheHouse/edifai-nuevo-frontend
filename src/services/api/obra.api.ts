import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { CreateObraPayload, Obra, UpdateObraPayload } from '../../modules/obras/types/obra.types';

const obraBaseUrl = `${env.obraApiUrl}/obra`;

export const obraApi = {
  async getAll(page = 1, limit = 50): Promise<{
    data: Obra[];
    pagination: {
      total: number;
      totalPages: number;
      page: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const response = await httpClient.get<{ success: boolean } & {
      data: Obra[];
      pagination: {
        total: number;
        totalPages: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`${obraBaseUrl}/getAll?page=${page}&limit=${limit}`);

    return { data: response.data.data, pagination: response.data.pagination };
  },

  async getAllArchivadas(): Promise<Obra[]> {
    const response = await httpClient.get<{ success: boolean; obras: Obra[] }>(`${obraBaseUrl}/archivadas`);
    return response.data.obras;
  },

  async getById(id: number | string): Promise<Obra> {
    const response = await httpClient.get<{ success: boolean; obra: Obra }>(`${obraBaseUrl}/getById/${id}`);
    return response.data.obra;
  },

  async create(payload: CreateObraPayload): Promise<Obra> {
    const response = await httpClient.post<{ success: boolean; obra: Obra }>(`${obraBaseUrl}/create`, payload);
    return response.data.obra;
  },

  async update(payload: UpdateObraPayload): Promise<Obra> {
    const { id, ...body } = payload;
    const response = await httpClient.put<{ success: boolean; obra: Obra }>(`${obraBaseUrl}/modificar/${id}`, body);
    return response.data.obra;
  },

  async remove(id: number | string): Promise<void> {
    await httpClient.delete(`${obraBaseUrl}/delete/${id}`);
  },

  async archivar(id: number | string, archivar: boolean): Promise<void> {
    await httpClient.put(`${obraBaseUrl}/archivar/${id}`, { archivar });
  },
};