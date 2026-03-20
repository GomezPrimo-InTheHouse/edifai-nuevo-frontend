import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trabajadorApi } from '../../../services/api/trabajador.api';
import type { CreateTrabajadorPayload, UpdateTrabajadorPayload } from '../types/trabajador.types';

export const trabajadoresQueryKeys = {
  all: ['trabajadores'] as const,
  detail: (id: number | string) => ['trabajadores', id] as const,
  byEspecialidad: (id: number) => ['trabajadores', 'especialidad', id] as const,
};

export function useTrabajadoresList() {
  return useQuery({
    queryKey: trabajadoresQueryKeys.all,
    queryFn: () => trabajadorApi.getAll(),
  });
}

export function useTrabajadorDetail(id: number | string) {
  return useQuery({
    queryKey: trabajadoresQueryKeys.detail(id),
    queryFn: () => trabajadorApi.getById(id),
    enabled: Boolean(id),
  });
}

// Trabajadores filtrados por especialidad
export function useTrabajadoresByEspecialidad(especialidad_id: number) {
  return useQuery({
    queryKey: trabajadoresQueryKeys.byEspecialidad(especialidad_id),
    queryFn: () => trabajadorApi.getByEspecialidad(especialidad_id),
    enabled: Boolean(especialidad_id),
  });
}

export function useCreateTrabajador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTrabajadorPayload) => trabajadorApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trabajadoresQueryKeys.all });
    },
  });
}

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

export function useDeleteTrabajador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => trabajadorApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trabajadoresQueryKeys.all });
    },
  });
}

export function useJefesConEquipo(especialidad_id: number) {
  return useQuery({
    queryKey: ['trabajadores', 'jefes-equipo', especialidad_id],
    queryFn: () => trabajadorApi.getJefesConEquipo(especialidad_id),
    enabled: Boolean(especialidad_id),
  });
}