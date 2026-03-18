import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { TipoObraOption } from '../../modules/obras/types/obra.types';

const tipoObraBaseUrl = `${env.obraApiUrl}/obra/tipoObra`;

export const tipoObraApi = {
  async getAll(): Promise<TipoObraOption[]> {
    const response = await httpClient.get<{ success: boolean; data: TipoObraOption[] }>(
      `${tipoObraBaseUrl}/getAll`
    );
    return response.data.data;
  },
};