import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { compraApi } from '../../../services/api/compra.api';
import type { CreateCompraPayload, UpdateCompraPayload } from '../types/compra.types';

export const comprasQueryKeys = {
  all: ['compras'] as const,
  byObra: (obraId: number) => ['compras', 'by-obra', obraId] as const,
  detail: (id: number) => ['compras', id] as const,
};

export function useComprasList() {
  return useQuery({ queryKey: comprasQueryKeys.all, queryFn: () => compraApi.getAll() });
}

export function useComprasPorObra(obraId: number) {
  return useQuery({
    queryKey: comprasQueryKeys.byObra(obraId),
    queryFn: () => compraApi.getByObra(obraId),
    enabled: obraId > 0,
  });
}

export function useCompraDetail(id: number) {
  return useQuery({
    queryKey: comprasQueryKeys.detail(id),
    queryFn: () => compraApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCompraPayload) => compraApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: comprasQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: comprasQueryKeys.byObra(data.obra_id) });
      if (data.material_id) {
        queryClient.invalidateQueries({ queryKey: ['materiales'] });
        queryClient.invalidateQueries({ queryKey: ['historial-incrementos'] });
      }
    },
  });
}

export function useUpdateCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCompraPayload) => compraApi.update(payload),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: comprasQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: comprasQueryKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: comprasQueryKeys.byObra(data.obra_id) });
    },
  });
}

export function useDeleteCompra(obraId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => compraApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comprasQueryKeys.all });
      if (obraId) queryClient.invalidateQueries({ queryKey: comprasQueryKeys.byObra(obraId) });
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
    },
  });
}

export function useUploadComprobante() {
  return useMutation({ mutationFn: (file: File) => compraApi.uploadComprobante(file) });
}

export function useAnalizarComprobanteConIA() {
  return useMutation({ mutationFn: (imageUrl: string) => compraApi.analizarComprobanteConIA(imageUrl) });
}

export function useAnalizarComprobanteMultiItemConIA() {
  return useMutation({
    mutationFn: ({
      imageUrl,
      materiales,
      especialidades,
    }: {
      imageUrl: string;
      materiales: { id: number; nombre: string; unidad: string }[];
      especialidades: { id: number; nombre: string }[];
    }) => compraApi.analizarComprobanteMultiItemConIA(imageUrl, materiales, especialidades),
  });
}

export function useCreateComprasBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payloads: CreateCompraPayload[]) => {
      const results = [];
      for (const payload of payloads) {
        results.push(await compraApi.create(payload));
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comprasQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      queryClient.invalidateQueries({ queryKey: ['historial-incrementos'] });
    },
  });
}