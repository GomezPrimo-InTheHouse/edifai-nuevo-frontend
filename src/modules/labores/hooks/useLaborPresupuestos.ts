
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { laborPresupuestosApi, proveedoresExternosApi } from '../../../services/api/laborPresupuestos.api';
import type {
  CreateLaborPresupuestoPayload,
  CreateProveedorExternoPayload,
} from '../types/labor.types';

export const laborPresupuestosQueryKeys = {
  byLabor: (labor_id: number) => ['labor-presupuestos', labor_id] as const,
  proveedores: ['proveedores-externos'] as const,
  unidades: ['unidades-medida'] as const,
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
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
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
    mutationFn: (payload: CreateProveedorExternoPayload) =>
      proveedoresExternosApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laborPresupuestosQueryKeys.proveedores });
    },
  });
}

export function useUnidadesMedida() {
  return useQuery({
    queryKey: laborPresupuestosQueryKeys.unidades,
    queryFn: () => laborPresupuestosApi.getUnidades(),
    staleTime: Infinity, // lista fija, nunca re-fetchar
  });
}

export function useAnalizarDocumento() {
  return useMutation({
    mutationFn: (payload: { imagen_base64?: string; media_type?: string; texto_libre?: string }) =>
      laborPresupuestosApi.analizarDocumento(payload),
  });
}

export function useVincularProveedorTrabajador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ proveedor_id, trabajador_id, labor_id }: {
      proveedor_id: number;
      trabajador_id: number;
      labor_id?: number;
    }) => proveedoresExternosApi.vincularTrabajador(proveedor_id, trabajador_id, labor_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laborPresupuestosQueryKeys.proveedores });
      queryClient.invalidateQueries({ queryKey: ['labores'] });
    },
  });
}

export function useUpdateLaborPresupuesto(labor_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; precio_unitario?: number; cantidad?: number; plazo_dias?: number | null; calidad?: string | null; garantia?: string | null; notas?: string | null }) =>
      laborPresupuestosApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laborPresupuestosQueryKeys.byLabor(labor_id) });
    },
  });
}