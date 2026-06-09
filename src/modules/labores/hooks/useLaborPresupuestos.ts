import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { laborPresupuestosApi, proveedoresExternosApi } from '../../../services/api/laborPresupuestos.api';
import type { CreateLaborPresupuestoPayload, CreateProveedorExternoPayload } from '../types/labor.types';

export const laborPresupuestosQueryKeys = {
  byLabor: (labor_id: number) => ['labor-presupuestos', labor_id] as const,
  proveedores: ['proveedores-externos'] as const,
};

export function useLaborPresupuestos(labor_id: number) {
  return useQuery({
    queryKey: laborPresupuestosQueryKeys.byLabor(labor_id),
    queryFn: () => laborPresupuestosApi.getByLabor(labor_id),
    enabled: Boolean(labor_id),
  });
}

export function useCreateLaborPresupuesto(labor_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLaborPresupuestoPayload) =>
      laborPresupuestosApi.create(labor_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laborPresupuestosQueryKeys.byLabor(labor_id) });
    },
  });
}

export function useSeleccionarPresupuesto(labor_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => laborPresupuestosApi.seleccionar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laborPresupuestosQueryKeys.byLabor(labor_id) });
      queryClient.invalidateQueries({ queryKey: ['labores'] });
    },
  });
}

export function useDeleteLaborPresupuesto(labor_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => laborPresupuestosApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laborPresupuestosQueryKeys.byLabor(labor_id) });
    },
  });
}

export function useProveedoresExternos() {
  return useQuery({
    queryKey: laborPresupuestosQueryKeys.proveedores,
    queryFn: () => proveedoresExternosApi.getAll(),
  });
}

export function useCreateProveedorExterno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProveedorExternoPayload) => proveedoresExternosApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laborPresupuestosQueryKeys.proveedores });
    },
  });
}