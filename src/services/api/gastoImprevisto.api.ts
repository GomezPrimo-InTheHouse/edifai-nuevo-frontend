// // src/services/api/gastoImprevisto.api.ts
// import { env } from '../../app/config/env';

// import httpClient from '../httpClient';
// import type {
//   GastoImprevisto,
//   CreateGastoImprevistoPayload,
//   UpdateEstadoGastoPayload,
// } from '../../modules/gastosImprevistos/types/gastosImprevisto.types';

// const BASE = `${env.obraApiUrl}/gastos-imprevistos`;

// export const gastoImprevistoApi = {
//   async getAll(): Promise<GastoImprevisto[]> {
//     const res = await httpClient.get<{ success: boolean; data: GastoImprevisto[] }>(BASE);
//     return res.data.data;
//   },

//   async getByObra(obraId: number): Promise<GastoImprevisto[]> {
//     const res = await httpClient.get<{ success: boolean; data: GastoImprevisto[] }>(`${BASE}/obra/${obraId}`);
//     return res.data.data;
//   },

//   async getById(id: number): Promise<GastoImprevisto> {
//     const res = await httpClient.get<{ success: boolean; data: GastoImprevisto }>(`${BASE}/${id}`);
//     return res.data.data;
//   },

//   async create(payload: CreateGastoImprevistoPayload): Promise<GastoImprevisto> {
//     const res = await httpClient.post<{ success: boolean; data: GastoImprevisto }>(BASE, payload);
//     return res.data.data;
//   },

//   async updateEstado(id: number, payload: UpdateEstadoGastoPayload): Promise<GastoImprevisto> {
//     const res = await httpClient.patch<{ success: boolean; data: GastoImprevisto }>(`${BASE}/${id}/estado`, payload);
//     return res.data.data;
//   },
//   async updateDeudor(id: number, payload: { deudor_cliente_id?: number | null; deudor_usuario_id?: number | null }): Promise<GastoImprevisto> {
//   const res = await httpClient.patch<{ success: boolean; data: GastoImprevisto }>(`${BASE}/${id}/deudor`, payload);
//   return res.data.data;
// },

//   async remove(id: number): Promise<void> {
//     await httpClient.delete(`${BASE}/${id}`);
//   },
// };

import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  GastoImprevisto,
  CreateGastoImprevistoPayload,
  UpdateEstadoGastoPayload,
} from '../../modules/gastosImprevistos/types/gastosImprevisto.types';

const BASE = `${env.obraApiUrl}/gastos-imprevistos`;

export const gastoImprevistoApi = {
  async getAll(): Promise<GastoImprevisto[]> {
    const res = await httpClient.get<{ success: boolean; data: GastoImprevisto[] }>(BASE);
    return res.data.data;
  },

  async getByObra(obraId: number): Promise<GastoImprevisto[]> {
    const res = await httpClient.get<{ success: boolean; data: GastoImprevisto[] }>(`${BASE}/obra/${obraId}`);
    return res.data.data;
  },

  async getById(id: number): Promise<GastoImprevisto> {
    const res = await httpClient.get<{ success: boolean; data: GastoImprevisto }>(`${BASE}/${id}`);
    return res.data.data;
  },

  async create(payload: CreateGastoImprevistoPayload): Promise<GastoImprevisto> {
    const res = await httpClient.post<{ success: boolean; data: GastoImprevisto }>(BASE, payload);
    return res.data.data;
  },

  async updateEstado(id: number, payload: UpdateEstadoGastoPayload): Promise<GastoImprevisto> {
    const res = await httpClient.patch<{ success: boolean; data: GastoImprevisto }>(`${BASE}/${id}/estado`, payload);
    return res.data.data;
  },

  async updateDeudor(id: number, payload: { deudor_cliente_id?: number | null; deudor_usuario_id?: number | null }): Promise<GastoImprevisto> {
    const res = await httpClient.patch<{ success: boolean; data: GastoImprevisto }>(`${BASE}/${id}/deudor`, payload);
    return res.data.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  },

  async uploadTicket(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('ticket', file);
    const res = await httpClient.post<{ success: boolean; url: string }>(
      `${BASE}/ticket/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.url;
  },

  async analizarTicketConIA(imageUrl: string, formasPago: { id: number; nombre: string }[]): Promise<{
    descripcion?: string;
    monto?: number;
    fecha?: string;
    formas_pago?: { forma_pago_id: number; monto: number }[];
  }> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: imageUrl },
            },
            {
              type: 'text',
              text: `Analizá este ticket o factura y extraé los datos. Devolvé SOLO un JSON válido sin markdown ni texto adicional.

CAMPOS A EXTRAER:
- descripcion: string (qué se compró, resumido)
- monto: number (monto total sin símbolos)
- fecha: string (formato YYYY-MM-DD, si no se ve claramente omitir)
- formas_pago: array de { forma_pago_id, monto } — solo si se puede determinar la forma de pago

FORMAS DE PAGO DISPONIBLES: ${JSON.stringify(formasPago)}

Si no podés determinar un campo con certeza, no lo incluyas.
Respondé ÚNICAMENTE con el JSON.`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    const rawText = data.content?.[0]?.text ?? '{}';
    const clean = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  },
};