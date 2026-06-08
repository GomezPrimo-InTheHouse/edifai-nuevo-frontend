import { useMutation, useQueryClient } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';
import { marketQueryKeys } from './usePublicaciones';
import { inboxQueryKey, historialQueryKey } from './useInbox';
import { materialesQueryKeys } from '../../materiales/hooks/useMateriales';

export function useSubirComprobante(transaccion_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => marketApi.subirComprobante(transaccion_id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.mensajes(transaccion_id) });
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.transacciones });
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.publicaciones });      // ← nuevo
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.misPublicaciones });   // ← nuevo
      queryClient.invalidateQueries({ queryKey: inboxQueryKey });
      queryClient.invalidateQueries({ queryKey: historialQueryKey });
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.publicaciones });
      queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all });
    },
  });
}