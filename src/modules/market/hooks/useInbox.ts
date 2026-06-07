import { useQuery } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';

export const inboxQueryKey = ['market-inbox'] as const;
export const historialQueryKey = ['market-inbox-historial'] as const;

export function useInbox() {
  return useQuery({
    queryKey: inboxQueryKey,
    queryFn: () => marketApi.getInbox(false),
    refetchInterval: 10000,
  });
}

export function useHistorialInbox() {
  return useQuery({
    queryKey: historialQueryKey,
    queryFn: () => marketApi.getInbox(true),
  });
}