import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { UserPreferencias } from '../../modules/configuracion/types/preferencias.types';

const baseUrl = `${env.usuarioApiUrl}/usuario`;

interface PreferenciasResponse {
  success: boolean;
  data: {
    preferencias: UserPreferencias;
    onboarding_completado: boolean;
  };
}

export const preferenciasApi = {
  async obtener(): Promise<PreferenciasResponse['data']> {
    const res = await httpClient.get<PreferenciasResponse>(`${baseUrl}/preferencias`);
    return res.data.data;
  },

  async guardar(payload: {
    preferencias?: Partial<UserPreferencias>;
    onboarding_completado?: boolean;
  }): Promise<PreferenciasResponse['data']> {
    const res = await httpClient.put<PreferenciasResponse>(`${baseUrl}/preferencias`, payload);
    return res.data.data;
  },
};