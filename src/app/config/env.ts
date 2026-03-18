// src/config/env.ts

/**
 * Helper para asegurar que una variable de entorno exista.
 */
function required(name: string): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

/**
 * Configuración centralizada de variables de entorno.
 */
export const env = {
  authApiUrl: required('VITE_AUTH_API_URL'),
  usuarioApiUrl: required('VITE_USUARIO_API_URL'),
  trabajadoresApiUrl: required('VITE_TRABAJADORES_API_URL'),
  obraApiUrl: required('VITE_OBRA_API_URL'),
  laboresApiUrl: required('VITE_LABORES_API_URL'),
  estadosApiUrl: required('VITE_ESTADOS_API_URL'),
  apiUrl: required('VITE_API_URL'),

  /**
   * Permite saltar autenticación en desarrollo
   */
  authBypass: import.meta.env.VITE_AUTH_BYPASS === 'true',
};