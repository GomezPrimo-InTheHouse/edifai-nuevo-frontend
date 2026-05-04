import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { materialApi } from '../../../services/api/material.api';
import type { CreateMaterialPayload, UpdateMaterialPayload } from '../types/material.types';

export const materialesQueryKeys = {
  all: ['materiales'] as const,
  detail: (id: number | string) => ['materiales', id] as const,
};

export function useMaterialesList() {
  return useQuery({ queryKey: materialesQueryKeys.all, queryFn: () => materialApi.getAll() });
}

export function useMaterialDetail(id: number | string) {
  return useQuery({
    queryKey: materialesQueryKeys.detail(id),
    queryFn: () => materialApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMaterialPayload) => materialApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all }),
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMaterialPayload) => materialApi.update(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: materialesQueryKeys.detail(vars.id) });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => materialApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all }),
  });
}

export function useAjustePreciosMasivo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { porcentaje: number; tipo_material_id?: number; motivo?: string }) =>
      materialApi.ajustePreciosMasivo(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all }),
  });
}

export function useEstadisticasMateriales() {
  return useQuery({
    queryKey: ['materiales-estadisticas'],
    queryFn: () => materialApi.getEstadisticas(),
  });
}