

import httpClient from '../httpClient';

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

export const asistenteApi = {
  enviarMensaje: async (mensaje: string, sesion_id?: number) => {
    const { data } = await httpClient.post('/asistente/mensaje', { mensaje, sesion_id });
    return data as { success: boolean; data: { sesion_id: number; respuesta: string } };
  },
  obtenerSesiones: async () => {
    const { data } = await httpClient.get('/asistente/sesiones');
    return data as { success: boolean; data: SesionAsistente[] };
  },
  obtenerMensajes: async (sesionId: number) => {
    const { data } = await httpClient.get(`/asistente/sesiones/${sesionId}/mensajes`);
    return data as { success: boolean; data: MensajeAsistente[] };
  },
  eliminarSesion: async (sesionId: number) => {
    const { data } = await httpClient.delete(`/asistente/sesiones/${sesionId}`);
    return data as { success: boolean; message: string };
  },
};