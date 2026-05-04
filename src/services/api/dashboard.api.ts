import { httpClientAbsolute } from '../httpClient';
import { env } from '../../app/config/env';

const BASE = `${env.dashboardApiUrl}/dashboard`;

export interface DashboardAdminData {
  periodo: { desde: string; hasta: string };
  kpis: {
    obras:        { total: number; activas: number };
    labores:      { total: number; activas: number };
    trabajadores: { total: number };
    presupuestos: { total: number; confirmados: number; borradores: number };
    pagos:        { total_pagos: number; total_pagado: number; total_pendiente: number };
    asistencia:   { presentes_hoy: number; total_trabajadores: number; tasa: number };
    materiales_criticos: number;
    logins_hoy:   number;
  };
  ausentes_hoy:        { id: number; nombre: string; apellido: string; obra_nombre: string }[];
  materiales_criticos: { id: number; nombre: string; stock_actual: number; unidad: string }[];
  pagos_evolucion:     { mes: string; total: number }[];
  obras_por_estado:    { estado: string; total: number }[];
  labores_por_progreso: { estado: string; total: number }[];
  actividad_reciente:  { tipo: string; mensaje: string; created_at: string }[];
}

export interface DashboardTrabajadorData {
  trabajador:     { id: number; nombre: string; apellido: string };
  obra_actual:    { obra_nombre: string; rol_en_obra: string } | null;
  kpis: {
    labores_activas:  number;
    cobrado_mes:      number;
    pendiente_mes:    number;
    tasa_asistencia:  number;
    dias_marcados:    number;
    dias_habiles:     number;
  };
  labores:         any[];
  dias_asistencia: string[];
  ultimos_pagos:   any[];
  mes_actual:      { anio: number; mes: number; dias: number };
}

export const dashboardApi = {
  getAdmin: async (params?: {
    periodo?: 'hoy' | 'semana' | 'mes';
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<DashboardAdminData> => {
    const res = await httpClientAbsolute.get(`${BASE}/admin`, { params });
    return res.data.data;
  },

  getTrabajador: async (): Promise<DashboardTrabajadorData> => {
    const res = await httpClientAbsolute.get(`${BASE}/trabajador`);
    return res.data.data;
  },
};