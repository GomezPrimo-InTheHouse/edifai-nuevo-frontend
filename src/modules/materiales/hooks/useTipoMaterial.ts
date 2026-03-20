import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tipoMaterialApi } from '../../../services/api/tipoMaterial.api';

export const tipoMaterialQueryKeys = { all: ['tipos-material'] as const };

export function useTiposMaterialList() {
  return useQuery({ queryKey: tipoMaterialQueryKeys.all, queryFn: () => tipoMaterialApi.getAll() });
}

export function useCreateTipoMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { nombre: string }) => tipoMaterialApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tipoMaterialQueryKeys.all }),
  });
}

export function useDeleteTipoMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tipoMaterialApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tipoMaterialQueryKeys.all }),
  });
}