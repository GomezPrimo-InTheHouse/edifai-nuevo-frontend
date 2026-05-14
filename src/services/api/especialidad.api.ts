import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { EspecialidadOption } from '../../modules/trabajadores/types/trabajador.types';

const baseUrl = `${env.trabajadoresApiUrl}/especialidad`;

export const especialidadApi = {
  async getAll(): Promise<EspecialidadOption[]> {
    const response = await httpClient.get<EspecialidadOption[]>(`${baseUrl}/getAll`);
    return response.data;
  },

  async create(payload: { nombre: string; descripcion: string }): Promise<EspecialidadOption> {
    const response = await httpClient.post<EspecialidadOption>(`${baseUrl}/crear`, payload);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${baseUrl}/eliminar/${id}`);
  },
};