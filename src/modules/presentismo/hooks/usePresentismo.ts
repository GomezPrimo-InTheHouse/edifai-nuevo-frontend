import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presentismoApi } from '../../../services/api/presentismo.api';

export const presentismoQueryKeys = {
  misObras:  ['presentismo', 'mis-obras']  as const,
  historial: ['presentismo', 'historial']  as const,
};

export function useMisObras() {
  return useQuery({
    queryKey: presentismoQueryKeys.misObras,
    queryFn:  presentismoApi.getMisObras,
  });
}

export function useHistorialPresentismo() {
  return useQuery({
    queryKey: presentismoQueryKeys.historial,
    queryFn:  presentismoApi.getHistorial,
  });
}

export function useMarcarPresentismo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: presentismoApi.marcar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presentismoQueryKeys.historial });
    },
  });
}