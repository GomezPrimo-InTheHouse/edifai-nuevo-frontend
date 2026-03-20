import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type {
  CreateTrabajadorPayload,
  Trabajador,
  UpdateTrabajadorPayload,
} from '../../modules/trabajadores/types/trabajador.types';

const baseUrl = `${env.trabajadoresApiUrl}/trabajador`;

// Estructura de respuesta del endpoint jefesConEquipo
export interface JefeConEquipo extends Trabajador {
  equipo: Trabajador[];
}

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

 // Obtiene trabajadores filtrados por especialidad
  async getByEspecialidad(especialidad_id: number): Promise<Trabajador[]> {
    const response = await httpClient.get<Trabajador[]>(
      `${baseUrl}/getByEspecialidad/${especialidad_id}`
    );
    return response.data;
  },
  // Agregá en trabajadorApi:
async getJefesConEquipo(especialidad_id: number): Promise<JefeConEquipo[]> {
  const response = await httpClient.get<JefeConEquipo[]>(
    `${baseUrl}/getJefesConEquipo/${especialidad_id}`
  );
  return response.data;
},

  // Crea un nuevo trabajador
 async create(payload: CreateTrabajadorPayload): Promise<Trabajador> {
  const cleanPayload = {
    ...payload,
    jefe_id: payload.jefe_id === ('' as any) ? null : payload.jefe_id,
    especialidad_id: payload.especialidad_id === ('' as any) ? null : payload.especialidad_id,
    estado_id: payload.estado_id === ('' as any) ? null : payload.estado_id,
  };
  const response = await httpClient.post<Trabajador>(`${baseUrl}/crear`, cleanPayload);
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