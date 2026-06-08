import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { obraApi } from '../../../services/api/obra.api';
import { tipoObraApi } from '../../../services/api/tipoObra.api';
import { estadoApi } from '../../../services/api/estado.api';
import type {
  CreateObraPayload,
  UpdateObraPayload,
} from '../types/obra.types';

export const obrasQueryKeys = {
  all: ['obras'] as const,
  detail: (id: number | string) => ['obras', id] as const,
  tiposObra: ['tipos-obra'] as const,
  estadosObra: ['estados', 'obra'] as const,
};

export function useObrasList(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...obrasQueryKeys.all, page, limit],
    queryFn: () => obraApi.getAll(page, limit),
  });
}

export function useObraDetail(id: number | string) {
  return useQuery({
    queryKey: obrasQueryKeys.detail(id),
    queryFn: () => obraApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useTiposObraOptions() {
  return useQuery({
    queryKey: obrasQueryKeys.tiposObra,
    queryFn: () => tipoObraApi.getAll(),
  });
}

export function useEstadosObraOptions() {
  return useQuery({
    queryKey: obrasQueryKeys.estadosObra,
    queryFn: () => estadoApi.getByAmbito('obra'),
  });
}

export function useCreateObra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateObraPayload) => obraApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obrasQueryKeys.all });
    },
  });
}

export function useUpdateObra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateObraPayload) => obraApi.update(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: obrasQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: obrasQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteObra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => obraApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obrasQueryKeys.all });
    },
  });
}

//funciones de archivo y desarchivo de obra

export function useObrasArchivadas() {
  return useQuery({
    queryKey: ['obras', 'archivadas'],
    queryFn: () => obraApi.getAllArchivadas(),
  });
}

export function useArchivarObra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archivar }: { id: number; archivar: boolean }) =>
      obraApi.archivar(id, archivar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] });
    },
  });
}

export function useObrasListAll() {
  return useQuery({
    queryKey: [...obrasQueryKeys.all, 'all'],
    queryFn: async () => {
      const res = await obraApi.getAll(1, 1000);
      return res.data ?? [];
    },
  });
}
