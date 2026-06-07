import { useMutation, useQueryClient } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';
import { marketQueryKeys } from './usePublicaciones';
import { materialesQueryKeys } from '../../materiales/hooks/useMateriales';
import type { PublicarMaterialPayload } from '../types/market.types';

export function usePublicarMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PublicarMaterialPayload) => marketApi.publicarMaterial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.publicaciones });
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.misPublicaciones });
      queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all });
    },
  });
}

export function useCancelarPublicacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => marketApi.cancelarPublicacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.publicaciones });
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.misPublicaciones });
      queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all });
    },
  });
}