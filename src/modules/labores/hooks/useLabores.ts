import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { laborApi } from '../../../services/api/labor.api';
import { useAuthStore } from '../../../app/store/auth.store';
import type { CreateLaborPayload, UpdateLaborPayload } from '../types/labor.types';

export const laboresQueryKeys = {
  all: ['labores'] as const,
  detail: (id: number | string) => ['labores', id] as const,
  mis: ['labores', 'mis-labores'] as const,
  byObra: (obra_id: number) => ['labores', 'by-obra', obra_id] as const,
};

export function useLaboresList() {
  return useQuery({
    queryKey: laboresQueryKeys.all,
    queryFn: () => laborApi.getAll(),
  });
}

export function useLaborDetail(id: number | string) {
  return useQuery({
    queryKey: laboresQueryKeys.detail(id),
    queryFn: () => laborApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateLabor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLaborPayload) => laborApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laboresQueryKeys.all });
    },
  });
}

export function useUpdateLabor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateLaborPayload) => laborApi.update(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: laboresQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: laboresQueryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteLabor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => laborApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laboresQueryKeys.all });
    },
  });
}

export function useCambiarEstadoLabor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado_id }: { id: number | string; estado_id: number }) =>
      laborApi.cambiarEstado(id, estado_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: laboresQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: laboresQueryKeys.detail(variables.id) });
    },
  });
}

export function useMisLabores() {
  const user = useAuthStore((s) => s.user);
  const esWorker = user?.rol_id === 7 || user?.rol_id === 8;

  return useQuery({
    queryKey: laboresQueryKeys.mis,
    queryFn: () => laborApi.getMisLabores(),
    enabled: esWorker, // ← solo ejecuta para workers, nunca para admins
  });
}

export function useLaborsByObra(obra_id: number) {
  return useQuery({
    queryKey: laboresQueryKeys.byObra(obra_id),
    queryFn: () => laborApi.getByObra(obra_id),
    enabled: Boolean(obra_id),
  });
}

export function useLaboresArchivadas() {
  return useQuery({
    queryKey: ['labores', 'archivadas'],
    queryFn: () => laborApi.getAllArchivadas(),
  });
}