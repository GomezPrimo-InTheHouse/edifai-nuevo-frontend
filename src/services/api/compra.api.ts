import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  Compra,
  CreateCompraPayload,
  UpdateCompraPayload,
  ComprasPorObraResponse,
  AnalizarComprobantePayload,
} from '../../modules/compras/types/compra.types';

const BASE = `${env.obraApiUrl}/compras`;

export const compraApi = {
  async getAll(): Promise<Compra[]> {
    const res = await httpClient.get<{ success: boolean; data: Compra[] }>(BASE);
    return res.data.data;
  },

  async getByObra(obraId: number): Promise<ComprasPorObraResponse> {
    const res = await httpClient.get<{ success: boolean; data: Compra[]; total_compras: number }>(
      `${BASE}/obra/${obraId}`
    );
    return { data: res.data.data, total_compras: res.data.total_compras };
  },

  async getById(id: number): Promise<Compra> {
    const res = await httpClient.get<{ success: boolean; data: Compra }>(`${BASE}/${id}`);
    return res.data.data;
  },

  async create(payload: CreateCompraPayload): Promise<Compra> {
    const res = await httpClient.post<{ success: boolean; data: Compra }>(BASE, payload);
    return res.data.data;
  },

  async update(payload: UpdateCompraPayload): Promise<Compra> {
    const { id, ...body } = payload;
    const res = await httpClient.put<{ success: boolean; data: Compra }>(`${BASE}/${id}`, body);
    return res.data.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  },

  async uploadComprobante(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('comprobante', file);
    const res = await httpClient.post<{ success: boolean; url: string }>(
      `${BASE}/comprobante/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.url;
  },

  async analizarComprobanteConIA(imageUrl: string): Promise<AnalizarComprobantePayload> {
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
            { type: 'image', source: { type: 'url', url: imageUrl } },
            {
              type: 'text',
              text: `Analizá este comprobante de compra y extraé los datos. Devolvé SOLO un JSON válido sin markdown ni texto adicional.

CAMPOS A EXTRAER:
- descripcion: string (qué se compró, resumido)
- monto: number (monto total sin símbolos)
- fecha: string (formato YYYY-MM-DD, si no se ve claramente omitir)
- proveedor: string (nombre del comercio/proveedor, si se puede leer)

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