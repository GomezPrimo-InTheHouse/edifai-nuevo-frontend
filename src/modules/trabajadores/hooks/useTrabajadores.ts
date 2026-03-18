import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trabajadorApi } from '../../../services/api/trabajador.api';
import type { CreateTrabajadorPayload, UpdateTrabajadorPayload } from '../types/trabajador.types';

export const trabajadoresQueryKeys = {
  all: ['trabajadores'] as const,
  detail: (id: number | string) => ['trabajadores', id] as const,
};

// Lista completa de trabajadores
export function useTrabajadoresList() {
  return useQuery({
    queryKey: trabajadoresQueryKeys.all,
    queryFn: () => trabajadorApi.getAll(),
  });
}

// Detalle de un trabajador por ID
export function useTrabajadorDetail(id: number | string) {
  return useQuery({
    queryKey: trabajadoresQueryKeys.detail(id),
    queryFn: () => trabajadorApi.getById(id),
    enabled: Boolean(id),
  });
}

// Crear trabajador — invalida la lista al completarse
export function useCreateTrabajador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTrabajadorPayload) => trabajadorApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trabajadoresQueryKeys.all });
    },
  });
}

// Actualizar trabajador — invalida lista y detalle
export function useUpdateTrabajador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTrabajadorPayload) => trabajadorApi.update(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: trabajadoresQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: trabajadoresQueryKeys.detail(variables.id) });
    },
  });
}

// Eliminar trabajador — invalida la lista
export function useDeleteTrabajador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => trabajadorApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trabajadoresQueryKeys.all });
    },
  });
}