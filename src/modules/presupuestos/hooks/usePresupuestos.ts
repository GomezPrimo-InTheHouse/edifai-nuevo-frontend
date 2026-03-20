import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presupuestoApi } from '../../../services/api/presupuesto.api';
import type { CreatePresupuestoPayload } from '../types/presupuesto.types';

export const presupuestosQueryKeys = {
  all: ['presupuestos'] as const,
  detail: (id: number | string) => ['presupuestos', id] as const,
};

export function usePresupuestosList() {
  return useQuery({ queryKey: presupuestosQueryKeys.all, queryFn: () => presupuestoApi.getAll() });
}

export function usePresupuestoDetail(id: number | string) {
  return useQuery({
    queryKey: presupuestosQueryKeys.detail(id),
    queryFn: () => presupuestoApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePresupuesto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePresupuestoPayload) => presupuestoApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: presupuestosQueryKeys.all }),
  });
}

export function useUpdatePresupuesto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; nombre?: string; descripcion?: string; estado_id?: number; costo_mano_obra?: number }) =>
      presupuestoApi.update(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: presupuestosQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: presupuestosQueryKeys.detail(vars.id) });
    },
  });
}

export function useDeletePresupuesto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => presupuestoApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: presupuestosQueryKeys.all }),
  });
}

export function useCambiarEstadoPresupuesto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado_id }: { id: number | string; estado_id: number }) =>
      presupuestoApi.cambiarEstado(id, estado_id),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: presupuestosQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: presupuestosQueryKeys.detail(vars.id) });
    },
  });
}