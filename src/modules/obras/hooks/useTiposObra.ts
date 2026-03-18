import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tipoObraApi } from '../../../services/api/tipoObra.api';
import { obrasQueryKeys } from './useObras';

// Hook para obtener la lista de tipos de obra
// Al invalidar obrasQueryKeys.tiposObra, todos los componentes que usen este hook se actualizan automáticamente
export function useTiposObraList() {
  return useQuery({
    queryKey: obrasQueryKeys.tiposObra,
    queryFn: () => tipoObraApi.getAll(),
  });
}

// Hook para crear un nuevo tipo de obra
// onSuccess invalida el cache → la lista se refresca sin recargar la página
export function useCreateTipoObra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { nombre: string; descripcion?: string }) =>
      tipoObraApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obrasQueryKeys.tiposObra });
    },
  });
}

// Hook para eliminar un tipo de obra
// onSuccess invalida el cache → la lista se refresca automáticamente
export function useDeleteTipoObra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tipoObraApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obrasQueryKeys.tiposObra });
    },
  });
}