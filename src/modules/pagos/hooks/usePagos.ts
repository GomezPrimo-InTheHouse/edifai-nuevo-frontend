import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pagoApi } from '../../../services/api/pago.api';
import type { CreatePagoPayload } from '../types/pago.types';
import { presupuestoApi } from '../../../services/api/presupuesto.api';

export const pagosQueryKeys = {
  all: ['pagos'] as const,
  detail: (id: number) => ['pagos', id] as const,
  byTrabajador: (id: number) => ['pagos', 'trabajador', id] as const,
  byPresupuesto: (id: number) => ['pagos', 'presupuesto', id] as const,
};

export function usePagosList() {
  return useQuery({ queryKey: pagosQueryKeys.all, queryFn: () => pagoApi.getAll() });
}

export function usePagoDetail(id: number) {
  return useQuery({ queryKey: pagosQueryKeys.detail(id), queryFn: () => pagoApi.getById(id), enabled: Boolean(id) });
}

export function usePagosByTrabajador(trabajador_id: number) {
  return useQuery({ queryKey: pagosQueryKeys.byTrabajador(trabajador_id), queryFn: () => pagoApi.getByTrabajador(trabajador_id), enabled: Boolean(trabajador_id) });
}

export function usePagosByPresupuesto(presupuesto_id: number) {
  return useQuery({ queryKey: pagosQueryKeys.byPresupuesto(presupuesto_id), queryFn: () => pagoApi.getByPresupuesto(presupuesto_id), enabled: Boolean(presupuesto_id) });
}

export function useCreatePago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePagoPayload) => pagoApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pagosQueryKeys.all }),
  });
}

export function useUpdatePago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number } & Partial<CreatePagoPayload>) => pagoApi.update(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: pagosQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: pagosQueryKeys.detail(vars.id) });
    },
  });
}

export function useCambiarEstadoPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) => pagoApi.cambiarEstado(id, estado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pagosQueryKeys.all }),
  });
}

export function useDeletePago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pagoApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pagosQueryKeys.all }),
  });
}

export function usePagosEstadisticas() {
  return useQuery({
    queryKey: ['pagos', 'estadisticas'] as const,
    queryFn: () => pagoApi.getEstadisticas(),
    refetchInterval: 60000,
  });
}

