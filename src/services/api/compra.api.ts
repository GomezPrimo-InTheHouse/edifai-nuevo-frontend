import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  Compra,
  CreateCompraPayload,
  UpdateCompraPayload,
  ComprasPorObraResponse,
  AnalizarComprobantePayload,
  AnalisisMultiItemResult,
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
  async analizarComprobanteMultiItemConIA(
  imageUrl: string,
  materiales: { id: number; nombre: string; unidad: string }[],
  especialidades: { id: number; nombre: string }[]
): Promise<AnalisisMultiItemResult> {
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
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: imageUrl } },
          {
            type: 'text',
            text: `Analizá este comprobante de compra (factura/ticket) y extraé CADA línea de artículo como un ítem separado. Devolvé SOLO un JSON válido sin markdown ni texto adicional.

ESTRUCTURA DE RESPUESTA:
{
  "proveedor": string (nombre del comercio/proveedor, si se puede leer),
  "fecha": string (formato YYYY-MM-DD, si se puede leer),
  "items": [
    {
      "descripcion": string (nombre del artículo tal cual figura),
      "monto": number (total de esa línea, sin símbolos),
      "cantidad": number (cantidad comprada, si figura),
      "unidad": string (unidad de esa línea si figura, ej: UN, BL, KM, KG),
      "material_id": number | null (ver instrucciones abajo),
      "material_nombre": string | null (nombre del material si hiciste match),
      "especialidad_id": number | null (ver instrucciones abajo),
      "especialidad_nombre": string | null (nombre de la especialidad si la inferiste)
    }
  ]
}

CATÁLOGO DE MATERIALES DISPONIBLES (matchear por nombre/similitud, ser flexible con mayúsculas/variaciones):
${JSON.stringify(materiales)}

Si un ítem del comprobante corresponde a un material de la lista, completá material_id y material_nombre con ESE id y nombre exactos del catálogo. Si no corresponde a ningún material (ej: flete, mano de obra, servicios), dejá material_id y material_nombre en null.

ESPECIALIDADES DISPONIBLES (inferir según el tipo de ítem, ej: cemento/bloques→albañilería, flete→logística/transporte si existe, cañerías→plomería):
${JSON.stringify(especialidades)}

Completá especialidad_id y especialidad_nombre con la que mejor corresponda de la lista. Si no podés inferir con razonable certeza, dejá ambos en null.

Extraé TODAS las líneas de producto/servicio que veas, no omitas ninguna. No incluyas líneas de subtotal, IVA o totales generales como ítems.

Respondé ÚNICAMENTE con el JSON.`,
          },
        ],
      }],
    }),
  });

  const data = await response.json();
  const rawText = data.content?.[0]?.text ?? '{"items":[]}';
  const clean = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
},
};