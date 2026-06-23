import httpClient from '../httpClient';
import { env } from '../../app/config/env';

const BASE = env.obraApiUrl; //obraApiUrl esta defiido en env.ts y apunta a la url del microservicio de obras pero comparte url con el resto

export interface ResumenItem {
  id: string; titulo: string; subtitulo: string;
  detalle: string; severidad: 'critico' | 'advertencia' | 'info'; ruta: string;
}

export interface ResumenCategoria {
  modulo: string; label: string; color: string;
  icono: string; ruta_frontend: string;
  items: ResumenItem[]; total: number; criticos: number;
}

export interface ResumenData {
  categorias: ResumenCategoria[];
  total_pendientes: number; total_criticos: number;
  ultima_actualizacion: string;
}

export interface Recomendacion {
  titulo: string; descripcion: string; prioridad: 'alta' | 'media' | 'baja';
}

export const resumenApi = {
  obtenerPendientes: async () => {
    const { data } = await httpClient.get(`${BASE}/resumen/pendientes`);
    return data as { success: boolean; data: ResumenData };
  },
  obtenerRecomendacionesIA: async () => {
    const { data } = await httpClient.get(`${BASE}/resumen/recomendaciones-ia`);
    return data as { success: boolean; data: { recomendaciones: Recomendacion[] } };
  },
  obtenerConfig: async () => {
    const { data } = await httpClient.get(`${BASE}/resumen/config`);
    return data;
  },
  actualizarConfig: async (modulo: string, cambios: { activo?: boolean; dias_umbral?: number; label?: string }) => {
    const { data } = await httpClient.patch(`${BASE}/resumen/config/${modulo}`, cambios);
    return data;
  },
  
};
