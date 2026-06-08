import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';
import { marketQueryKeys } from './usePublicaciones';
import { inboxQueryKey, historialQueryKey } from './useInbox';
import type { IniciarTransaccionPayload } from '../types/market.types';
import { materialesQueryKeys } from '../../materiales/hooks/useMateriales';

export function useTransacciones() {
  return useQuery({
    queryKey: marketQueryKeys.transacciones,
    queryFn: () => marketApi.getMisTransacciones(),
  });
}

export function useIniciarTransaccion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IniciarTransaccionPayload) => marketApi.iniciarTransaccion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.transacciones });
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.publicaciones });
      queryClient.invalidateQueries({ queryKey: inboxQueryKey });
    },
  });
}

export function useActualizarTransaccion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: 'confirmada' | 'cancelada' }) =>
      marketApi.actualizarTransaccion(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.transacciones });
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.publicaciones });      // ← forzar refetch del market
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.misPublicaciones });   // ← forzar refetch mis pubs
      queryClient.invalidateQueries({ queryKey: inboxQueryKey });
      queryClient.invalidateQueries({ queryKey: historialQueryKey });
      queryClient.invalidateQueries({ queryKey: materialesQueryKeys.all });            // ← forzar refetch materiales
    },
  });
}