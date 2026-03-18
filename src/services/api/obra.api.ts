import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  CreateObraPayload,
  Obra,
  UpdateObraPayload,
} from '../../modules/obras/types/obra.types';

const obraBaseUrl = `${env.obraApiUrl}/obra`;

export const obraApi = {
  async getAll(): Promise<Obra[] > {
    const response = await httpClient.get<Obra[] | any>(`${obraBaseUrl}/getAll`);
    return response.data.obras;
  },

  async getById(id: number | string): Promise<Obra> {
    const response = await httpClient.get<Obra>(`${obraBaseUrl}/getById/${id}`);
    return response.data;
  },

  async getByEstado(estado: string | number): Promise<Obra[]> {
    const response = await httpClient.get<Obra[]>(
      `${obraBaseUrl}/getByEstado/${estado}`
    );
    return response.data;
  },

  async getByUbicacion(ubicacion: string): Promise<Obra[]> {
    const response = await httpClient.get<Obra[]>(
      `${obraBaseUrl}/getByUbicacion/${encodeURIComponent(ubicacion)}`
    );
    return response.data;
  },

  async create(payload: CreateObraPayload): Promise<Obra> {
    const response = await httpClient.post<Obra>(`${obraBaseUrl}/create`, payload);
    return response.data;
  },

  async update(payload: UpdateObraPayload): Promise<Obra> {
    const { id, ...body } = payload;
    const response = await httpClient.put<Obra>(
      `${obraBaseUrl}/modificar/${id}`,
      body
    );
    return response.data;
  },

  async remove(id: number | string): Promise<void> {
    await httpClient.delete(`${obraBaseUrl}/delete/${id}`);
  },
};