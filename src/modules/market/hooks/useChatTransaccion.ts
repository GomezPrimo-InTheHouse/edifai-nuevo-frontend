import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';
import { marketQueryKeys } from './usePublicaciones';

export function useChatTransaccion(transaccion_id: number) {
  return useQuery({
    queryKey: marketQueryKeys.mensajes(transaccion_id),
    queryFn: () => marketApi.getMensajes(transaccion_id),
    enabled: Boolean(transaccion_id),
    refetchInterval: 3000,
    staleTime: 0,
  });
}

export function useEnviarMensaje(transaccion_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mensaje: string) => marketApi.enviarMensaje(transaccion_id, mensaje),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.mensajes(transaccion_id) });
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.noLeidos });
    },
  });
}

export function useMarcarLeidos(transaccion_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => marketApi.marcarLeidos(transaccion_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketQueryKeys.noLeidos });
    },
  });
}

export function useMensajesNoLeidos() {
  return useQuery({
    queryKey: marketQueryKeys.noLeidos,
    queryFn: () => marketApi.getMensajesNoLeidos(),
    refetchInterval: 15000,
  });
}