import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { EspecialidadOption } from '../../modules/trabajadores/types/trabajador.types';

const baseUrl = `${env.trabajadoresApiUrl}/especialidad`;

// API de especialidades — microservicio ms-trabajadores (puerto 7003)
export const especialidadApi = {
  // Obtiene todas las especialidades — backend devuelve array directo
  async getAll(): Promise<EspecialidadOption[]> {
    const response = await httpClient.get<EspecialidadOption[]>(`${baseUrl}/getAll`);
    return response.data;
  },
  
// Crea una nueva especialidad
 async create(payload: { nombre: string; descripcion?: string; estado_id?: number }): Promise<EspecialidadOption> {
  const response = await httpClient.post<EspecialidadOption>(`${baseUrl}/crear`, payload);
  return response.data;
},

  // Elimina una especialidad por ID
  async remove(id: number): Promise<void> {
    await httpClient.delete(`${baseUrl}/eliminar/${id}`);
  },
};