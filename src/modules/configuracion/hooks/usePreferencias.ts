import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { preferenciasApi } from '../../../services/api/preferencias.api';
import type { UserPreferencias } from '../types/preferencias.types';

export const PREFERENCIAS_KEY = ['preferencias'];

export const usePreferencias = () => {
  return useQuery({
    queryKey: PREFERENCIAS_KEY,
    queryFn: preferenciasApi.obtener,
    staleTime: 1000 * 60 * 10, // 10 minutos — no cambia frecuentemente
  });
};

export const useGuardarPreferencias = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      preferencias?: Partial<UserPreferencias>;
      onboarding_completado?: boolean;
    }) => preferenciasApi.guardar(payload),

    onSuccess: () => {
      // Invalida el cache para que ConfiguracionPage refleje los cambios
      queryClient.invalidateQueries({ queryKey: PREFERENCIAS_KEY });
    },
  });
};