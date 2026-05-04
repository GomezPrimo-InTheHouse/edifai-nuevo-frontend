import { env } from '../../app/config/env';
import httpClient from '../httpClient';
import type { Cliente, CreateClientePayload } from '../../modules/clientes/types/cliente.types';

const baseUrl = `${env.clientesApiUrl}/clientes`;

export const clienteApi = {
  async getAll(): Promise<Cliente[]> {
    const response = await httpClient.get<{ success: boolean; data: Cliente[] }>(`${baseUrl}/getAll`);
    return response.data.data;
  },

  async getById(id: number | string): Promise<Cliente> {
    const response = await httpClient.get<{ success: boolean; data: Cliente }>(`${baseUrl}/getById/${id}`);
    return response.data.data;
  },

  async create(payload: CreateClientePayload): Promise<Cliente> {
    const response = await httpClient.post<{ success: boolean; data: Cliente }>(`${baseUrl}/create`, payload);
    return response.data.data;
  },

  async update(payload: { id: number } & Partial<CreateClientePayload>): Promise<Cliente> {
    const { id, ...body } = payload;
    const response = await httpClient.put<{ success: boolean; data: Cliente }>(`${baseUrl}/modificar/${id}`, body);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${baseUrl}/delete/${id}`);
  },
};