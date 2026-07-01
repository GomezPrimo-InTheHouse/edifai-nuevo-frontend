// import { env } from '../../app/config/env';
// import httpClient from '../httpClient';
// import type { CreateSectorPayload, Sector } from '../../modules/obras/types/sector.types';

// // const baseUrl = env.sectoresApiUrl/sectores;
// const baseUrl = `${env.sectoresApiUrl}/sectores`;

// export const sectorApi = {
//   async getByObra(obra_id: number): Promise<Sector[]> {
//     const res = await httpClient.get<{ success: boolean; data: Sector[] }>(
//       `${baseUrl}/byObra/${obra_id}`
//     );
//     return res.data.data;
//   },

//   async create(payload: CreateSectorPayload): Promise<Sector> {
//     const res = await httpClient.post<{ success: boolean; data: Sector }>(
//       `${baseUrl}/create`, payload
//     );
//     return res.data.data;
//   },

//   async createBulk(
//     obra_id: number,
//     sectores: Omit<CreateSectorPayload, 'obra_id'>[]
//   ): Promise<Sector[]> {
//     const res = await httpClient.post<{ success: boolean; data: Sector[] }>(
//       `${baseUrl}/bulk`, { obra_id, sectores }
//     );
//     return res.data.data;
//   },

//   async update(id: number, payload: Partial<Omit<CreateSectorPayload, 'obra_id'>>): Promise<Sector> {
//     const res = await httpClient.put<{ success: boolean; data: Sector }>(
//       `${baseUrl}/modificar/${id}`, payload
//     );
//     return res.data.data;
//   },

//   async remove(id: number): Promise<void> {
//     await httpClient.delete(`${baseUrl}/delete/${id}`);
//   },
// };

import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  CreateSectorPayload, Sector, SectorConStats, SectorLocal,
} from '../../modules/obras/types/sector.types';
import { flattenLocalSectorTree as flattenLocal } from '../../modules/obras/types/sector.types';

const baseUrl = env.sectoresApiUrl;

export const sectorApi = {
  async getByObra(obra_id: number): Promise<Sector[]> {
    const res = await httpClient.get<{ success: boolean; data: Sector[] }>(
      `${baseUrl}/byObra/${obra_id}`
    );
    return res.data.data;
  },

  async getByObraWithStats(obra_id: number): Promise<SectorConStats[]> {
    const res = await httpClient.get<{ success: boolean; data: SectorConStats[] }>(
      `${baseUrl}/byObra/${obra_id}/stats`
    );
    return res.data.data;
  },

  async create(payload: CreateSectorPayload): Promise<Sector> {
    const res = await httpClient.post<{ success: boolean; data: Sector }>(
      `${baseUrl}/create`, payload
    );
    return res.data.data;
  },

  async createBulk(obra_id: number, sectores: Omit<CreateSectorPayload, 'obra_id'>[]): Promise<Sector[]> {
    const res = await httpClient.post<{ success: boolean; data: Sector[] }>(
      `${baseUrl}/bulk`, { obra_id, sectores }
    );
    return res.data.data;
  },

  // Crea sectores locales preservando la jerarquía, en orden de árbol
  async createWithHierarchy(obra_id: number, sectores: SectorLocal[]): Promise<void> {
    const tempIdToRealId = new Map<string, number>();
    const flattened = flattenLocal(sectores);
    for (const { sector } of flattened) {
      const parent_id = sector.parent_tempId
        ? (tempIdToRealId.get(sector.parent_tempId) ?? null)
        : null;
      const created = await sectorApi.create({
        obra_id, tipo: sector.tipo, valor: sector.valor, orden: sector.orden, parent_id,
      });
      tempIdToRealId.set(sector.tempId, created.id);
    }
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