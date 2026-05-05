import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { CreateLaborPayload, Labor, UpdateLaborPayload, LaborDeObra } from '../../modules/labores/types/labor.types';

const baseUrl = `${env.laboresApiUrl}/labor`;

// API de labores — microservicio ms-labores (puerto 7005)
export const laborApi = {
  // Obtiene todas las labores — backend devuelve { success, data: [...] }
  async getAll(): Promise<Labor[]> {
    const response = await httpClient.get<{ success: boolean; data: Labor[] }>(`${baseUrl}/getAll`);
    return response.data.data;
  },

  // Obtiene una labor por ID — backend devuelve el objeto directo
 
async getById(id: number | string): Promise<Labor> {
  const response = await httpClient.get<{ success: boolean; data: Labor }>(`${baseUrl}/getOne/${id}`);
  return response.data.data;
},

  // Crea una nueva labor
  async create(payload: CreateLaborPayload): Promise<Labor> {
    const response = await httpClient.post<{ success: boolean; data: Labor }>(`${baseUrl}/create`, payload);
    return response.data.data;
  },

  // Actualiza una labor existente
  async update(payload: UpdateLaborPayload): Promise<Labor> {
    const { id, ...body } = payload;
    const response = await httpClient.put<{ success: boolean; data: Labor }>(`${baseUrl}/actualizarLabor/${id}`, body);
    return response.data.data;
  },

  // Da de baja una labor
  async remove(id: number | string): Promise<void> {
    await httpClient.delete(`${baseUrl}/darDeBaja/${id}`);
  },

  // Cambia el estado de una labor
  async cambiarEstado(id: number | string, estado_id: number): Promise<Labor> {
    const response = await httpClient.put<{ success: boolean; data: Labor }>(`${baseUrl}/cambiarEstadoLabor/${id}`, { estado_id });
    return response.data.data;
  },

  async getMisLabores() : Promise<Labor[]> {
  const response = await httpClient.get(
    `${baseUrl}/mis-labores`
  );
  return response.data.data;
},

getByObra: async (obra_id: number) => {
  const res = await httpClient.get(`${baseUrl}/getByObra/${obra_id}`);
  return res.data.data as LaborDeObra[];
},
};

