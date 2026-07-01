import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { CreateSectorPayload, Sector } from '../../modules/obras/types/sector.types';

// const baseUrl = env.sectoresApiUrl/sectores;
const baseUrl = `${env.sectoresApiUrl}/sectores`;

export const sectorApi = {
  async getByObra(obra_id: number): Promise<Sector[]> {
    const res = await httpClient.get<{ success: boolean; data: Sector[] }>(
      `${baseUrl}/byObra/${obra_id}`
    );
    return res.data.data;
  },

  async create(payload: CreateSectorPayload): Promise<Sector> {
    const res = await httpClient.post<{ success: boolean; data: Sector }>(
      `${baseUrl}/create`, payload
    );
    return res.data.data;
  },

  async createBulk(
    obra_id: number,
    sectores: Omit<CreateSectorPayload, 'obra_id'>[]
  ): Promise<Sector[]> {
    const res = await httpClient.post<{ success: boolean; data: Sector[] }>(
      `${baseUrl}/bulk`, { obra_id, sectores }
    );
    return res.data.data;
  },

  async update(id: number, payload: Partial<Omit<CreateSectorPayload, 'obra_id'>>): Promise<Sector> {
    const res = await httpClient.put<{ success: boolean; data: Sector }>(
      `${baseUrl}/modificar/${id}`, payload
    );
    return res.data.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${baseUrl}/delete/${id}`);
  },
};