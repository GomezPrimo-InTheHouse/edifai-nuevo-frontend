import { useQuery } from '@tanstack/react-query';
import { resumenApi } from '../../../services/api/resumen.api';

export const useResumenPendientes = () =>
  useQuery({
    queryKey: ['resumen', 'pendientes'],
    queryFn:  () => resumenApi.obtenerPendientes(),
    staleTime: 3 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    select: (res) => res.data,
  });

export const useRecomendacionesIA = (enabled: boolean) =>
  useQuery({
    queryKey: ['resumen', 'recomendaciones-ia'],
    queryFn:  () => resumenApi.obtenerRecomendacionesIA(),
    staleTime: 15 * 60 * 1000,
    enabled,
    select: (res) => res.data,
  });