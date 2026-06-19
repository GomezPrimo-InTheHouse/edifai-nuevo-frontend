

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenteApi, type MensajeAsistente } from '../../../services/api/asistente.api';

export const useAsistenteChat = () => {
  const [sesionId, setSesionId] = useState<number | undefined>();
  const [mensajes, setMensajes] = useState<MensajeAsistente[]>([]);
  const queryClient = useQueryClient();

  const cargarSesion = async (id: number) => {
    const res = await asistenteApi.obtenerMensajes(id);
    setSesionId(id);
    setMensajes(res.data);
  };

  const nuevaSesion = () => {
    setSesionId(undefined);
    setMensajes([]);
  };

  const enviarMutation = useMutation({
    mutationFn: (mensaje: string) => asistenteApi.enviarMensaje(mensaje, sesionId),
    onMutate: (mensaje) => {
      setMensajes((prev) => [...prev, { rol: 'user', contenido: mensaje }]);
    },
    onSuccess: (res) => {
      setSesionId(res.data.sesion_id);
      setMensajes((prev) => [...prev, { rol: 'assistant', contenido: res.data.respuesta }]);
      queryClient.invalidateQueries({ queryKey: ['asistente', 'sesiones'] });
    },
  });

  return {
    sesionId, mensajes, cargarSesion, nuevaSesion,
    enviarMensaje: enviarMutation.mutate,
    enviando: enviarMutation.isPending,
  };
};