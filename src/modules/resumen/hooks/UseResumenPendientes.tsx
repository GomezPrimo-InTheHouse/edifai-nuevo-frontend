import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { resumenApi } from '../../../services/api/resumen.api';
import { useAuthStore } from '../../../app/store/auth.store';

export const useResumenPendientes = () => {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  // Dispara la carga apenas el usuario se autentica
  useEffect(() => {
    if (accessToken) {
      queryClient.prefetchQuery({
        queryKey: ['resumen', 'pendientes'],
        queryFn:  () => resumenApi.obtenerPendientes(),
        staleTime: 3 * 60 * 1000,
      });
    }
  }, [accessToken]);

  return useQuery({
    queryKey: ['resumen', 'pendientes'],
    queryFn:  () => resumenApi.obtenerPendientes(),
    staleTime: 3 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!accessToken,
    select: (res) => res.data,
  });
};

export const useRecomendacionesIA = (enabled: boolean) =>
  useQuery({
    queryKey: ['resumen', 'recomendaciones-ia'],
    queryFn:  () => resumenApi.obtenerRecomendacionesIA(),
    staleTime: 15 * 60 * 1000,
    enabled,
    select: (res) => res.data,
  });