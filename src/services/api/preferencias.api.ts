import httpClient from '../httpClient';
import type { UserPreferencias } from '../../modules/configuracion/types/preferencias.types';

interface PreferenciasResponse {
  success: boolean;
  data: {
    preferencias: UserPreferencias;
    onboarding_completado: boolean;
  };
}

export const preferenciasApi = {
  obtener: async (): Promise<PreferenciasResponse['data']> => {
    const res = await httpClient.get<PreferenciasResponse>('/usuarios/preferencias');
    return res.data.data;
  },

  guardar: async (payload: {
    preferencias?: Partial<UserPreferencias>;
    onboarding_completado?: boolean;
  }): Promise<PreferenciasResponse['data']> => {
    const res = await httpClient.put<PreferenciasResponse>('/usuarios/preferencias', payload);
    return res.data.data;
  },
};