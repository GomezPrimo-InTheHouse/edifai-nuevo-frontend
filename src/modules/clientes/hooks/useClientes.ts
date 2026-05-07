import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../../../services/api/cliente.api';
import type { CreateClientePayload } from '../types/cliente.types';

export const clientesQueryKeys = {
  all: ['clientes'] as const,
  detail: (id: number | string) => ['clientes', id] as const,
};

export function useClientesList() {
  return useQuery({ queryKey: clientesQueryKeys.all, queryFn: () => clienteApi.getAll() });
}

export function useClienteDetail(id: number | string) {
  return useQuery({
    queryKey: clientesQueryKeys.detail(id),
    queryFn: () => clienteApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientePayload) => clienteApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientesQueryKeys.all }),
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number } & Partial<CreateClientePayload>) => clienteApi.update(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: clientesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: clientesQueryKeys.detail(vars.id) });
    },
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clienteApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientesQueryKeys.all }),
  });
}


