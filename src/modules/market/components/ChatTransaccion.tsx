import { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useChatTransaccion, useEnviarMensaje, useMarcarLeidos } from '../hooks/useChatTransaccion';
import { ChatInput } from './ChatInput';
import { useAuthStore } from '../../../app/store/auth.store';
import { useNotify } from '../../../shared/hooks/useNotify';

interface ChatTransaccionProps {
  transaccion_id: number;
  interlocutor_nombre: string;
}

export const ChatTransaccion: React.FC<ChatTransaccionProps> = ({ transaccion_id, interlocutor_nombre }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const notify = useNotify();
  const user = useAuthStore((s) => s.user);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: mensajes = [], isLoading } = useChatTransaccion(transaccion_id);
  const enviarMutation = useEnviarMensaje(transaccion_id);
  const marcarLeidosMutation = useMarcarLeidos(transaccion_id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  useEffect(() => {
    if (mensajes.length > 0) marcarLeidosMutation.mutate();
  }, [transaccion_id]);

  const handleSend = async (mensaje: string) => {
    try {
      await enviarMutation.mutateAsync(mensaje);
    } catch {
      notify.error(t('market.notify.error_mensaje'));
    }
  };

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      height: '100%', bgcolor: 'background.paper',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 3, overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.action.hover,
      }}>
        <Typography variant="body2" fontWeight={700} color="text.primary">
          {t('market.chat.title', { nombre: interlocutor_nombre })}
        </Typography>
      </Box>

      {/* Mensajes */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isLoading && mensajes.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {t('market.chat.sin_mensajes')}
          </Typography>
        )}

        {mensajes.map((msg) => {
          const esMio = msg.remitente_id === user?.id;
          return (
            <Box key={msg.id} sx={{
              display: 'flex',
              justifyContent: esMio ? 'flex-end' : 'flex-start',
            }}>
              <Box sx={{
                maxWidth: '75%',
                px: 2, py: 1,
                borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                bgcolor: esMio ? '#F59E0B' : theme.palette.action.hover,
                color: esMio ? '#0F172A' : theme.palette.text.primary,
              }}>
                {!esMio && (
                  <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.25 }}>
                    {msg.remitente_nombre}
                  </Typography>
                )}
                <Typography variant="body2">{msg.mensaje}</Typography>
                <Typography variant="caption" sx={{
                  display: 'block', textAlign: 'right', mt: 0.25,
                  opacity: 0.7, fontSize: 10,
                }}>
                  {new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      <ChatInput onSend={handleSend} disabled={enviarMutation.isPending} />
    </Box>
  );
};