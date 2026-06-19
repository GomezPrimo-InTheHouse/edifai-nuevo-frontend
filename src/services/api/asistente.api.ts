import httpClient from '../httpClient';
import { env } from '../../app/config/env';

export interface MensajeAsistente {
  rol: 'user' | 'assistant';
  contenido: string;
  created_at?: string;
}

export interface SesionAsistente {
  id: number;
  titulo: string;
  created_at: string;
  updated_at: string;
}

const BASE = env.asistenteApiUrl;

export const asistenteApi = {
  enviarMensaje: async (mensaje: string, sesion_id?: number) => {
    const { data } = await httpClient.post(`${BASE}/asistente/mensaje`, { mensaje, sesion_id });
    return data as { success: boolean; data: { sesion_id: number; respuesta: string } };
  },
  obtenerSesiones: async () => {
    const { data } = await httpClient.get(`${BASE}/asistente/sesiones`);
    return data as { success: boolean; data: SesionAsistente[] };
  },
  obtenerMensajes: async (sesionId: number) => {
    const { data } = await httpClient.get(`${BASE}/asistente/sesiones/${sesionId}/mensajes`);
    return data as { success: boolean; data: MensajeAsistente[] };
  },
  eliminarSesion: async (sesionId: number) => {
    const { data } = await httpClient.delete(`${BASE}/asistente/sesiones/${sesionId}`);
    return data as { success: boolean; message: string };
  },
};