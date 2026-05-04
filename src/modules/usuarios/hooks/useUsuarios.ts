import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuarioApi } from '../../../services/api/usuario.api';
import type { CreateUsuarioPayload, UpdateUsuarioPayload } from '../types/usuario.types';

export const usuariosQueryKeys = {
  all: ['usuarios'] as const,
  detail: (id: number) => ['usuarios', id] as const,
};

export function useUsuariosList() {
  return useQuery({ queryKey: usuariosQueryKeys.all, queryFn: () => usuarioApi.getAll() });
}

export function useUsuarioDetail(id: number) {
  return useQuery({
    queryKey: usuariosQueryKeys.detail(id),
    queryFn: () => usuarioApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUsuarioPayload) => usuarioApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosQueryKeys.all }),
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUsuarioPayload) => usuarioApi.update(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: usuariosQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: usuariosQueryKeys.detail(vars.id) });
    },
  });
}

export function useDarDeBajaUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuarioApi.darDeBaja(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosQueryKeys.all }),
  });
}

export function useCambiarPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      usuarioApi.cambiarPassword(id, password),
  });
}