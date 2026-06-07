import { useQuery } from '@tanstack/react-query';
import { marketApi } from '../../../services/api/market.api';
import { marketQueryKeys } from './usePublicaciones';

export function useMisPublicaciones() {
  return useQuery({
    queryKey: marketQueryKeys.misPublicaciones,
    queryFn: () => marketApi.getMisPublicaciones(),
  });
}