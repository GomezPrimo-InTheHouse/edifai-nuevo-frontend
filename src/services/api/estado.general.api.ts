import { env } from '../../app/config/env';
import httpClient from '../httpClient';

export interface EstadoGeneral {
  id: number;
  nombre: string;
  descripcion?: string | null;
  ambito: string;
}

// Obtiene todos los estados del sistema — backend devuelve { success, data: [...] }
export const estadoGeneralApi = {
  async getAll(): Promise<EstadoGeneral[]> {
    const response = await httpClient.get<{ success: boolean; data: EstadoGeneral[] }>(
      `${env.estadosApiUrl}/estado/getAll`
    );
    return response.data.data;
  },
};