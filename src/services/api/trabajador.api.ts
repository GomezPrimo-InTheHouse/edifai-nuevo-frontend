import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  CreateTrabajadorPayload,
  Trabajador,
  UpdateTrabajadorPayload,
} from '../../modules/trabajadores/types/trabajador.types';

const baseUrl = `${env.trabajadoresApiUrl}/trabajador`;

// API de trabajadores — microservicio ms-trabajadores (puerto 7003)
export const trabajadorApi = {
  // Obtiene todos los trabajadores — backend devuelve array directo
  async getAll(): Promise<Trabajador[]> {
    const response = await httpClient.get<Trabajador[]>(`${baseUrl}/getAll`);
    return response.data;
  },

  // Obtiene un trabajador por ID
  async getById(id: number | string): Promise<Trabajador> {
  const response = await httpClient.get<{ ok: boolean; data: Trabajador }>(
    `${baseUrl}/${id}`
  );
  return response.data.data;
},

  // Crea un nuevo trabajador
  async create(payload: CreateTrabajadorPayload): Promise<Trabajador> {
    const response = await httpClient.post<Trabajador>(`${baseUrl}/crear`, payload);
    return response.data;
  },

  // Actualiza un trabajador existente
  async update(payload: UpdateTrabajadorPayload): Promise<Trabajador> {
    const { id, ...body } = payload;
    const response = await httpClient.put<Trabajador>(`${baseUrl}/modificar/${id}`, body);
    return response.data;
  },

  // Elimina un trabajador por ID
  async remove(id: number | string): Promise<void> {
    await httpClient.delete(`${baseUrl}/eliminar/${id}`);
  },
};