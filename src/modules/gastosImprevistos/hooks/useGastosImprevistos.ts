// src/modules/gastosImprevistos/hooks/useGastosImprevistos.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gastoImprevistoApi } from '../../../services/api/gastoImprevisto.api';
import type {
  CreateGastoImprevistoPayload,
  UpdateEstadoGastoPayload,
} from '../types/gastosImprevisto.types';

const KEYS = {
  all:     ['gastos-imprevistos'] as const,
  byObra:  (obraId: number) => ['gastos-imprevistos', 'obra', obraId] as const,
  byId:    (id: number)     => ['gastos-imprevistos', id] as const,
};

export const useGastosImprevistosList = () =>
  useQuery({
    queryKey: KEYS.all,
    queryFn:  gastoImprevistoApi.getAll,
  });

export const useGastosByObra = (obraId: number) =>
  useQuery({
    queryKey: KEYS.byObra(obraId),
    queryFn:  () => gastoImprevistoApi.getByObra(obraId),
    enabled:  !!obraId,
  });

export const useGastoImprevistoById = (id: number) =>
  useQuery({
    queryKey: KEYS.byId(id),
    queryFn:  () => gastoImprevistoApi.getById(id),
    enabled:  !!id,
  });

export const useCrearGastoImprevisto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGastoImprevistoPayload) => gastoImprevistoApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useActualizarEstadoGasto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEstadoGastoPayload }) =>
      gastoImprevistoApi.updateEstado(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useEliminarGastoImprevisto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gastoImprevistoApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
};