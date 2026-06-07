import { useEffect, useRef, useState } from 'react';
import {
  Box, CircularProgress, IconButton,
  Tooltip, Typography, useTheme,
} from '@mui/material';
import { Paperclip } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChatTransaccion, useEnviarMensaje, useMarcarLeidos } from '../hooks/useChatTransaccion';
import { useSubirComprobante } from '../hooks/useSubirComprobante';
import { ChatInput } from './ChatInput';
import { useAuthStore } from '../../../app/store/auth.store';
import { useNotify } from '../../../shared/hooks/useNotify';

interface ChatTransaccionProps {
  transaccion_id: number;
  interlocutor_nombre: string;
  es_comprador: boolean;
  transaccion_estado: 'pendiente' | 'confirmada' | 'cancelada';
}

export const ChatTransaccion: React.FC<ChatTransaccionProps> = ({
  transaccion_id,
  interlocutor_nombre,
  es_comprador,
  transaccion_estado,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const notify = useNotify();
  const user = useAuthStore((s) => s.user);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);

  const { data: mensajes = [], isLoading } = useChatTransaccion(transaccion_id);
  const enviarMutation = useEnviarMensaje(transaccion_id);
  const marcarLeidosMutation = useMarcarLeidos(transaccion_id);
  const subirComprobanteMutation = useSubirComprobante(transaccion_id);

  const miId = user?.id ?? -1;
  const puedeSubirComprobante = es_comprador && transaccion_estado === 'pendiente';

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoComprobante(true);
    try {
      const result = await subirComprobanteMutation.mutateAsync(file);
      if (result.validado) {
        notify.success('✅ Comprobante validado. Transacción confirmada automáticamente.');
      } else {
        notify.error(`⚠️ ${result.analisis.motivo}. El vendedor deberá confirmar manualmente.`);
      }
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'Error al subir el comprobante.');
    } finally {
      setSubiendoComprobante(false);
      // Limpiar input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const renderMensaje = (msg: any) => {
    const esMio = msg.remitente_id === miId;
    // const esComprobante = msg.mensaje.includes('adjuntó un comprobante');
    const esValidacion = msg.mensaje.startsWith('✅') || msg.mensaje.startsWith('⚠️');

    return (
      <Box key={msg.id} sx={{
        display: 'flex',
        justifyContent: esMio ? 'flex-end' : 'flex-start',
      }}>
        <Box sx={{
          maxWidth: '75%',
          px: 2, py: 1,
          borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          bgcolor: esValidacion
            ? msg.mensaje.startsWith('✅')
              ? 'rgba(22,163,74,0.12)'
              : 'rgba(245,158,11,0.12)'
            : esMio
              ? '#F59E0B'
              : theme.palette.action.hover,
          color: esValidacion
            ? msg.mensaje.startsWith('✅') ? '#16A34A' : '#B45309'
            : esMio ? '#0F172A' : theme.palette.text.primary,
          border: esValidacion
            ? msg.mensaje.startsWith('✅')
              ? '1px solid rgba(22,163,74,0.3)'
              : '1px solid rgba(245,158,11,0.3)'
            : 'none',
        }}>
          {!esMio && !esValidacion && (
            <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.25 }}>
              {msg.remitente_nombre}
            </Typography>
          )}
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {msg.mensaje}
          </Typography>
          <Typography variant="caption" sx={{
            display: 'block', textAlign: 'right', mt: 0.25,
            opacity: 0.7, fontSize: 10,
          }}>
            {new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      height: '100%', bgcolor: 'background.paper',
      overflow: 'hidden',
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

        {mensajes.map(renderMensaje)}
        <div ref={bottomRef} />
      </Box>

      {/* Input + botón comprobante */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
        {puedeSubirComprobante && (
          <Box sx={{
            px: 2, py: 1,
            bgcolor: 'rgba(245,158,11,0.04)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Tooltip title="Subir comprobante de pago (cámara, galería o archivo)">
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoComprobante}
                sx={{
                  bgcolor: '#F59E0B', color: '#0F172A',
                  '&:hover': { bgcolor: '#D97706' },
                  borderRadius: 2, px: 1.5,
                }}
              >
                {subiendoComprobante
                  ? <CircularProgress size={16} sx={{ color: '#0F172A' }} />
                  : <Paperclip size={16} />
                }
              </IconButton>
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              {subiendoComprobante
                ? 'Analizando comprobante con IA...'
                : 'Subir comprobante de pago — la IA lo validará automáticamente'
              }
            </Typography>
          </Box>
        )}

        <ChatInput
          onSend={handleSend}
          disabled={enviarMutation.isPending || transaccion_estado !== 'pendiente'}
        />
      </Box>
    </Box>
  );
};