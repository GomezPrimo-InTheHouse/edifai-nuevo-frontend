import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';
import { marketQueryKeys } from './usePublicaciones';
import type { IniciarTransaccionPayload } from '../types/market.types';

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
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.publicaciones });
    },
  });
}