import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { FormaPago } from '../../modules/pagos/types/pago.types';

export const formasPagoApi = {
  async getAll(): Promise<FormaPago[]> {
    const response = await httpClient.get<{ success: boolean; data: FormaPago[] }>(
      `${env.pagosApiUrl}/formasPago/getAll`
    );
    return response.data.data;
  },
};