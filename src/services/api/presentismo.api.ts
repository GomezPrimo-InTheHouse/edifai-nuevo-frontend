import { httpClientAbsolute } from '../httpClient';
import { env } from '../../app/config/env';

const BASE = `${env.presentismoApiUrl}/presentismo`;

export interface ObraVinculada {
  id: number;
  nombre: string;
  ubicacion: string | null;
  latitud: number | null;
  longitud: number | null;
  tipo_obra_nombre: string | null;
  rol_en_obra: string | null;
  fecha_desde: string;
  fecha_hasta: string | null;
}

export interface PresentismoRegistro {
  id: number;
  trabajador_id: number;
  obra_id: number;
  fecha: string;
  latitud: string | number;
  longitud: string | number;
  observaciones: string | null;
  obra_nombre: string;
  trabajador_nombre?: string;
  trabajador_apellido?: string;
  puntos: number;
}

export interface Trabajador {
  id: number;
  nombre: string;
  apellido: string;
  puntos: number;
}

export interface EstadisticasPresentismo {
  periodo: { desde: string; hasta: string };
  dias_periodo: number;
  puntos: number;
  resumen: {
    total_registros: string;
    trabajadores_activos: string;
    obras_con_actividad: string;
    dias_con_actividad: string;
  };
  ranking: {
    trabajador_id: number;
    nombre: string;
    apellido: string;
    total_registros: string;
    dias_distintos: string;
    ultimo_registro: string;
    puntos: number;        // ← agregar
  }[];
  ranking_puntos: {        // ← agregar
    id: number;
    nombre: string;
    apellido: string;
    puntos: number;
  }[];
  ausentes_hoy: {
    id: number;
    nombre: string;
    apellido: string;
    obra_nombre: string;
  }[];
  por_dia_semana: {
    dia_semana: string;
    nombre_dia: string;
    total: string;
  }[];
  por_obra: {
    obra_id: number;
    obra_nombre: string;
    total_registros: string;
    trabajadores_distintos: string;
    dias_con_actividad: string;
  }[];
  asistencia_perfecta: {
    id: number;
    nombre: string;
    apellido: string;
    dias_asistidos: string;
    puntos: number;        // ← agregar
  }[];
}

export const presentismoApi = {
  getMisObras: async (): Promise<{ trabajador: Trabajador; data: ObraVinculada[] }> => {
    const res = await httpClientAbsolute.get(`${BASE}/mis-obras`);
    return res.data;
  },

  marcar: async (payload: {
    obra_id: number;
    latitud: number;
    longitud: number;
    observaciones?: string;
  }): Promise<PresentismoRegistro> => {
    const res = await httpClientAbsolute.post(`${BASE}/marcar`, payload);
    return res.data.data;
  },

  getHistorial: async (): Promise<PresentismoRegistro[]> => {
    const res = await httpClientAbsolute.get(`${BASE}/historial`);
    return res.data.data;
  },

  getHistorialAdmin: async (params?: {
    obra_id?: number;
    trabajador_id?: number;
    fecha?: string;
  }): Promise<PresentismoRegistro[]> => {
    const res = await httpClientAbsolute.get(`${BASE}/historial-admin`, { params });
    return res.data.data;
  },

  getEstadisticas: async (params?: {
    fecha_desde?: string;
    fecha_hasta?: string;
    obra_id?: number;
  }): Promise<EstadisticasPresentismo> => {
    const res = await httpClientAbsolute.get(`${BASE}/estadisticas`, { params });
    return res.data.data;
  },
};