import { useQuery } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';

export const inboxQueryKey = ['market-inbox'] as const;

export function useInbox() {
  return useQuery({
    queryKey: inboxQueryKey,
    queryFn: () => marketApi.getInbox(),
    refetchInterval: 10000,
  });
}