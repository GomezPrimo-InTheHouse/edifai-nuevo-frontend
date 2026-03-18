import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { TipoObraOption } from '../../modules/obras/types/obra.types';

const tipoObraBaseUrl = `${env.obraApiUrl}/obra/tipoObra`;

// API de tipos de obra — métodos de comunicación con el microservicio ms-obra (puerto 7004)
export const tipoObraApi = {
  // Obtiene todos los tipos de obra disponibles
  async getAll(): Promise<TipoObraOption[]> {
    const response = await httpClient.get<{ success: boolean; data: TipoObraOption[] }>(
      `${tipoObraBaseUrl}/getAll`
    );
    return response.data.data;
  },

  // Crea un nuevo tipo de obra
  async create(payload: { nombre: string; descripcion?: string }): Promise<TipoObraOption> {
    const response = await httpClient.post<{ success: boolean; data: TipoObraOption }>(
      `${tipoObraBaseUrl}/create`,
      payload
    );
    return response.data.data;
  },

  // Elimina un tipo de obra por ID (eliminación definitiva, no baja lógica)
  async remove(id: number): Promise<void> {
    await httpClient.delete(`${tipoObraBaseUrl}/delete/${id}`);
  },
};