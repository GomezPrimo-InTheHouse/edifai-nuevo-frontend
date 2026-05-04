import { useQuery } from '@tanstack/react-query';
import { formasPagoApi } from '../../../services/api/formasPago.api';

export function useFormasPagoList() {
  return useQuery({ queryKey: ['formas-pago'], queryFn: () => formasPagoApi.getAll() });
}