import { useQuery } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';

export const marketQueryKeys = {
  publicaciones: ['market-publicaciones'] as const,
  misPublicaciones: ['market-mis-publicaciones'] as const,
  transacciones: ['market-transacciones'] as const,
  mensajes: (id: number) => ['market-mensajes', id] as const,
  noLeidos: ['market-no-leidos'] as const,
};

export function usePublicaciones() {
  return useQuery({
    queryKey: marketQueryKeys.publicaciones,
    queryFn: () => marketApi.getPublicaciones(),
  });
}