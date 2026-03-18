import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { EstadoOption } from '../../modules/obras/types/obra.types';

const estadoBaseUrl = `${env.estadosApiUrl}/estado`;

export const estadoApi = {
  async getByAmbito(ambito: string): Promise<EstadoOption[]> {
    const response = await httpClient.get<{ success: boolean; data: EstadoOption[] }>(
      `${estadoBaseUrl}/estadosPorAmbito/${ambito}`
    );
    return response.data.data;
  },
};