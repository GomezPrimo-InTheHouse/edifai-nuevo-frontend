export type Idioma = 'es' | 'en';
export type Tema = 'light' | 'dark';
export type Moneda = 'ARS' | 'USD' | 'EUR';
export type FormatoDashboard = 'resumen' | 'detallado';
export type FormatoFecha = 'DD/MM/YYYY' | 'MM/DD/YYYY';

export interface Ubicacion {
  lat: number;
  lng: number;
  label: string; // nombre de ciudad/lugar detectado o ingresado
}

export interface UserPreferencias {
  idioma: Idioma;
  tema: Tema;
  moneda: Moneda;
  notificaciones: boolean;
  dashboard_vista: FormatoDashboard;
  formato_fecha: FormatoFecha;
  ubicacion?: Ubicacion;
}

export const PREFERENCIAS_DEFAULT: UserPreferencias = {
  idioma: 'es',
  tema: 'light',
  moneda: 'ARS',
  notificaciones: true,
  dashboard_vista: 'resumen',
  formato_fecha: 'DD/MM/YYYY',
  ubicacion: undefined,
};