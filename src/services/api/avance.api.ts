import { env } from '../../app/config/env';
import httpClient from '../httpClient';

export interface Avance {
  id: number;
  obra_id: number;
  labor_id: number;
  trabajador_id: number;
  descripcion?: string | null;
  imagen_url?: string | null;
  audio_url?: string | null;
  porcentaje_cambio?: number | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  aprobado_por?: number | null;
  fecha_aprobacion?: string | null;
  observacion_admin?: string | null;
  resultado_vision?: string | null;
  fecha_registro: string;
  created_at: string;
  trabajador_nombre?: string;
  labor_nombre?: string;
  admin_nombre?: string;
}

const obraBaseUrl = `${env.obraApiUrl}/obra`;
const avanceBaseUrl = `${env.obraApiUrl}/obra`;

export const avanceApi = {
  async uploadImagen(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('imagen', file);
    const response = await httpClient.post<{ success: boolean; url: string }>(
      `${obraBaseUrl}/uploadImagenAvance`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.url;
  },

  async crear(payload: {
    obra_id: number;
    labor_id: number;
    descripcion?: string;
    imagen_url?: string;
    porcentaje_cambio?: number;
  }): Promise<Avance> {
    const response = await httpClient.post<{ success: boolean; data: Avance }>(
      `${avanceBaseUrl}/crearAvance`,
      payload
    );
    return response.data.data;
  },

  async getByLabor(obra_id: number, labor_id: number): Promise<Avance[]> {
    const response = await httpClient.get<{ success: boolean; data: Avance[] }>(
      `${avanceBaseUrl}/getByObra?obra_id=${obra_id}&labor_id=${labor_id}`
    );
    return response.data.data;
  },

  async aprobar(id: number, observacion_admin?: string): Promise<void> {
    await httpClient.put(`${avanceBaseUrl}/${id}/aprobar`, { observacion_admin });
  },

  async rechazar(id: number, observacion_admin: string): Promise<void> {
    await httpClient.put(`${avanceBaseUrl}/${id}/rechazar`, { observacion_admin });
  },
};