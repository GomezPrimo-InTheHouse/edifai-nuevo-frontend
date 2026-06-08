import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';
import { materialesQueryKeys } from '../../materiales/hooks/useMateriales';

export const misComprasQueryKey = ['market-mis-compras'] as const;

export function useMisCompras() {
  return useQuery({
    queryKey: misComprasQueryKey,
    queryFn: () => marketApi.getMisCompras(),
  });
}

export function useAgregarCompraAlInventario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transaccion_id: number) => marketApi.agregarCompraAlInventario(transaccion_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: misComprasQueryKey });
    },
  });
}

export function useAgregarStockExistente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transaccion_id, material_id }: { transaccion_id: number; material_id: number }) =>
      marketApi.agregarStockMaterialExistente(transaccion_id, material_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: misComprasQueryKey });
    },
  });
}