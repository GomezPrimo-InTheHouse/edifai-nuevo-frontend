import { httpClientAbsolute } from '../httpClient';
import { env } from '../../app/config/env';

export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  usuario_id: number | null;
  leida: boolean;
  created_at: string;
}

const BASE = `${env.notificacionesApiUrl}/notificaciones`;

export const notificacionesApi = {
  getAll: async (): Promise<Notificacion[]> => {
    const res = await httpClientAbsolute.get(BASE);
    return res.data.data;
  },

  marcarLeida: async (id: number): Promise<void> => {
    await httpClientAbsolute.patch(`${BASE}/${id}/leer`);
  },

  marcarTodasLeidas: async (): Promise<void> => {
    await httpClientAbsolute.patch(`${BASE}/leer-todas`);
  },
};