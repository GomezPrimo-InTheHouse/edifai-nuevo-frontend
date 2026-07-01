import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sectorApi } from '../../../services/api/sector.api';
import type { CreateSectorPayload } from '../types/sector.types';

export const sectoresQueryKeys = {
  byObra:          (obra_id: number) => ['sectores', 'by-obra', obra_id] as const,
  byObraWithStats: (obra_id: number) => ['sectores', 'by-obra-stats', obra_id] as const,
};

const invalidateBoth = (queryClient: ReturnType<typeof useQueryClient>, obra_id: number) => {
  queryClient.invalidateQueries({ queryKey: sectoresQueryKeys.byObra(obra_id) });
  queryClient.invalidateQueries({ queryKey: sectoresQueryKeys.byObraWithStats(obra_id) });
};

export function useSectoresPorObra(obra_id: number) {
  return useQuery({
    queryKey: sectoresQueryKeys.byObra(obra_id),
    queryFn:  () => sectorApi.getByObra(obra_id),
    enabled:  obra_id > 0,
  });
}

export function useSectoresConStats(obra_id: number) {
  return useQuery({
    queryKey: sectoresQueryKeys.byObraWithStats(obra_id),
    queryFn:  () => sectorApi.getByObraWithStats(obra_id),
    enabled:  obra_id > 0,
  });
}

export function useCreateSector(obra_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CreateSectorPayload, 'obra_id'>) =>
      sectorApi.create({ ...payload, obra_id }),
    onSuccess: () => invalidateBoth(queryClient, obra_id),
  });
}

export function useCreateSectoresBulk() {
  return useMutation({
    mutationFn: ({ obra_id, sectores }: {
      obra_id: number;
      sectores: Omit<CreateSectorPayload, 'obra_id'>[];
    }) => sectorApi.createBulk(obra_id, sectores),
  });
}

export function useDeleteSector(obra_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sectorApi.remove(id),
    onSuccess:  () => invalidateBoth(queryClient, obra_id),
  });
}