import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { avanceApi } from '../../../services/api/avance.api';

export function useAvancesByLabor(obra_id?: number, labor_id?: number) {
  return useQuery({
    queryKey: ['avances', obra_id, labor_id],
    queryFn: () => avanceApi.getByLabor(obra_id!, labor_id!),
    enabled: Boolean(obra_id) && Boolean(labor_id),
  });
}

export function useCrearAvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: avanceApi.crear,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['avances', vars.obra_id, vars.labor_id] });
    },
  });
}

export function useAprobarAvance(obra_id: number, labor_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observacion_admin }: { id: number; observacion_admin?: string }) =>
      avanceApi.aprobar(id, observacion_admin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avances', obra_id, labor_id] });
      queryClient.invalidateQueries({ queryKey: ['labores'] });
    },
  });
}

export function useRechazarAvance(obra_id: number, labor_id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observacion_admin }: { id: number; observacion_admin: string }) =>
      avanceApi.rechazar(id, observacion_admin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avances', obra_id, labor_id] });
    },
  });
}