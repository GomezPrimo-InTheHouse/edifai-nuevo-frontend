import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
  Usuario,
} from '../../modules/usuarios/types/usuario.types';

const baseUrl = `${env.usuarioApiUrl}/usuario`;

export const usuarioApi = {

  async getAll(): Promise<Usuario[]> {
    const response = await httpClient.get<{ ok: boolean; data: Usuario[] }>(`${baseUrl}/`);
    return response.data.data;
  },

  async getById(id: number): Promise<Usuario> {
    const response = await httpClient.get<{ ok: boolean; data: Usuario }>(`${baseUrl}/${id}`);
    return response.data.data;
  },

  // Crea usuario vía ms-usuario → ms-auth (genera TOTP + QR)
  async create(payload: CreateUsuarioPayload): Promise<{
    data:          Usuario;
    qrCodeDataURL: string | null;
    totp_seed:     string | null;
    message:       string;
  }> {
    const response = await httpClient.post<{
      ok:            boolean;
      user:          Usuario;       // ← "user" en lugar de "data"
      qrCodeDataURL: string | null;
      totp_seed:     string | null;
      message:       string;
    }>(`${baseUrl}/create`, payload);

    return {
      data:          response.data.user,          // ← .user en lugar de .data.data
      qrCodeDataURL: response.data.qrCodeDataURL ?? null,
      totp_seed:     response.data.totp_seed     ?? null,
      message:       response.data.message,
    };
  },

  async update(payload: UpdateUsuarioPayload): Promise<Usuario> {
    const { id, ...body } = payload;
    const response = await httpClient.put<{ ok: boolean; data: Usuario }>(
      `${baseUrl}/${id}`,
      body
    );
    return response.data.data;
  },

  // Dar de baja vía ms-usuario (desactiva, no elimina)
  async darDeBaja(id: number): Promise<void> {
    await httpClient.delete(`${baseUrl}/${id}`);
  },

  async cambiarPassword(id: number, password: string): Promise<void> {
    await httpClient.patch(`${baseUrl}/${id}/password`, { password });
  },

  async getRolesUsuarios(): Promise<{ id: number; nombre: string; descripcion: string }[]> {
    const response = await httpClient.get(`${baseUrl}-rol/getAllRoles`);
    return response.data;
  },
};