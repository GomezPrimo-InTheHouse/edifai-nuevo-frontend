import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  IniciarTransaccionPayload,
  Mensaje,
  MensajesNoLeidos,
  Publicacion,
  PublicarMaterialPayload,
  Transaccion,
} from '../../modules/market/types/market.types';

const baseUrl = `${env.obraApiUrl}/market`;

export const marketApi = {
  // Publicaciones
  async getPublicaciones(): Promise<Publicacion[]> {
    const res = await httpClient.get<{ success: boolean; data: Publicacion[] }>(`${baseUrl}/publicaciones`);
    return res.data.data;
  },

  async getMisPublicaciones(): Promise<Publicacion[]> {
    const res = await httpClient.get<{ success: boolean; data: Publicacion[] }>(`${baseUrl}/publicaciones/mis`);
    return res.data.data;
  },

  async publicarMaterial(payload: PublicarMaterialPayload): Promise<Publicacion> {
    const res = await httpClient.post<{ success: boolean; data: Publicacion }>(`${baseUrl}/publicaciones`, payload);
    return res.data.data;
  },

  async cancelarPublicacion(id: number): Promise<void> {
    await httpClient.put(`${baseUrl}/publicaciones/${id}/cancelar`);
  },

  // Transacciones
  async getMisTransacciones(): Promise<Transaccion[]> {
    const res = await httpClient.get<{ success: boolean; data: Transaccion[] }>(`${baseUrl}/transacciones/mis`);
    return res.data.data;
  },

  async iniciarTransaccion(payload: IniciarTransaccionPayload): Promise<Transaccion> {
    const res = await httpClient.post<{ success: boolean; data: Transaccion }>(`${baseUrl}/transacciones`, payload);
    return res.data.data;
  },

  async actualizarTransaccion(id: number, estado: 'confirmada' | 'cancelada'): Promise<void> {
  await httpClient.put(`${baseUrl}/transacciones/${id}`, { estado });
},

  // Mensajes
  async getMensajes(transaccion_id: number): Promise<Mensaje[]> {
    const res = await httpClient.get<{ success: boolean; data: Mensaje[] }>(`${baseUrl}/mensajes/${transaccion_id}`);
    return res.data.data;
  },

  async enviarMensaje(transaccion_id: number, mensaje: string): Promise<Mensaje> {
    const res = await httpClient.post<{ success: boolean; data: Mensaje }>(`${baseUrl}/mensajes/${transaccion_id}`, { mensaje });
    return res.data.data;
  },

  async marcarLeidos(transaccion_id: number): Promise<void> {
    await httpClient.put(`${baseUrl}/mensajes/leer/${transaccion_id}`);
  },

  async getMensajesNoLeidos(): Promise<MensajesNoLeidos[]> {
    const res = await httpClient.get<{ success: boolean; data: MensajesNoLeidos[] }>(`${baseUrl}/mensajes/no-leidos`);
    return res.data.data;
  },

  async getInbox(archivadas = false): Promise<Transaccion[]> {
  const res = await httpClient.get<{ success: boolean; data: Transaccion[] }>(
    `${baseUrl}/transacciones/inbox?archivadas=${archivadas}`
  );
  return res.data.data;
  },


};