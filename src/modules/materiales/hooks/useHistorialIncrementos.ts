import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { historialIncrementoApi } from '../../../services/api/historialIncremento.api';
import { materialApi } from '../../../services/api/material.api';
import { materialesQueryKeys } from './useMateriales';

export function useHistorialIncrementos() {
  return useQuery({ queryKey: ['historial-incrementos'], queryFn: () => historialIncrementoApi.getAll() });
}

export function useHistorialByMaterial(material_id: number) {
  return useQuery({
    queryKey: ['historial-incrementos', material_id],
    queryFn: () => historialIncrementoApi.getByMaterial(material_id),
    enabled: Boolean(material_id),
  });
}

export function useAjustePreciosMasivo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { porcentaje: number; tipo_material_id?: number; motivo?: string }) =>
      materialApi.ajustePreciosMasivo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['historial-incrementos'] });
    },
  });
}