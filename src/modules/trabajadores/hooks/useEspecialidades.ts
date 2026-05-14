import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { especialidadApi } from '../../../services/api/especialidad.api';
import { estadoGeneralApi } from '../../../services/api/estado.general.api';

export const especialidadesQueryKeys = {
  all: ['especialidades'] as const,
};

export function useEspecialidadesList() {
  return useQuery({
    queryKey: especialidadesQueryKeys.all,
    queryFn: () => especialidadApi.getAll(),
  });
}

// Hook para obtener todos los estados del sistema
export function useEstadosGenerales() {
  return useQuery({
    queryKey: ['estados-generales'],
    queryFn: () => estadoGeneralApi.getAll(),
  });
}

export function useCreateEspecialidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { nombre: string; descripcion: string }) =>
      especialidadApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: especialidadesQueryKeys.all });
    },
  });
}

export function useDeleteEspecialidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => especialidadApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: especialidadesQueryKeys.all });
    },
  });
}