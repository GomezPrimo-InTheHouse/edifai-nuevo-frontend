import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presupuestoMaterialApi } from '../../../services/api/presupuestoMaterial.api';

export function useMaterialesByPresupuesto(presupuesto_id: number) {
  return useQuery({
    queryKey: ['presupuesto-materiales', presupuesto_id],
    queryFn: () => presupuestoMaterialApi.getByPresupuesto(presupuesto_id),
    enabled: Boolean(presupuesto_id),
  });
}

export function useAddMaterialToPresupuesto(presupuesto_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { presupuesto_id: number; material_id: number; cantidad: number }) =>
      presupuestoMaterialApi.add(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto-materiales', presupuesto_id] });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
    },
  });
}

export function useUpdateCantidadMaterial(presupuesto_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cantidad }: { id: number; cantidad: number }) =>
      presupuestoMaterialApi.updateCantidad(id, cantidad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto-materiales', presupuesto_id] });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
    },
  });
}

export function useRemoveMaterialFromPresupuesto(presupuesto_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => presupuestoMaterialApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto-materiales', presupuesto_id] });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
    },
  });
}