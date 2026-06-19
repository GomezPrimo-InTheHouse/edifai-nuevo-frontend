import { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, TextField, IconButton, Typography,
  Stack, CircularProgress, Fab, Collapse, Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Send, X, Bot, User, MessageSquare, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenteApi, type MensajeAsistente } from '../../../services/api/asistente.api';

const ROLES_ADMIN = [1, 3, 4, 6, 9];

interface AsistenteIAFlotanteProps {
  rolId: number;
}

export const AsistenteIAFlotante: React.FC<AsistenteIAFlotanteProps> = ({ rolId }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [abierto, setAbierto] = useState(false);
  const [input, setInput] = useState('');
  const [sesionId, setSesionId] = useState<number | undefined>();
  const [mensajes, setMensajes] = useState<MensajeAsistente[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const esAdmin = ROLES_ADMIN.includes(rolId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

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
    onError: () => {
      setMensajes((prev) => [...prev, {
        rol: 'assistant',
        contenido: 'Ocurrió un error al procesar tu mensaje. Intentá de nuevo.',
      }]);
    },
  });

  const handleEnviar = () => {
    if (!input.trim() || enviarMutation.isPending) return;
    enviarMutation.mutate(input.trim());
    setInput('');
  };

  const handleNueva = () => {
    setSesionId(undefined);
    setMensajes([]);
  };

  if (!esAdmin) return null;

  return (
    <>
      {/* Panel flotante */}
      <Collapse
        in={abierto}
        sx={{
          position: 'fixed',
          bottom: 88,
          right: 24,
          zIndex: 1300,
          width: { xs: 'calc(100vw - 48px)', sm: 380 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 480,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.6)'
              : '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Header */}
          <Box sx={{
            px: 2, py: 1.5,
            bgcolor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Bot size={18} color="#F59E0B" />
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
                {t('asistente_ia.title')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={handleNueva} title={t('asistente_ia.nueva_sesion')}>
                <Plus size={16} color="#94A3B8" />
              </IconButton>
              <IconButton size="small" onClick={() => setAbierto(false)}>
                <X size={16} color="#94A3B8" />
              </IconButton>
            </Stack>
          </Box>

          <Divider />

          {/* Mensajes */}
          <Box
            ref={scrollRef}
            sx={{ flex: 1, overflowY: 'auto', p: 2 }}
          >
            {mensajes.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Bot size={32} color={theme.palette.text.disabled} />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {t('asistente_ia.empty')}
                </Typography>
              </Box>
            )}

            <Stack spacing={1.5}>
              {mensajes.map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    justifyContent: m.rol === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '85%',
                      px: 1.5,
                      py: 1,
                      borderRadius: m.rol === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      bgcolor: m.rol === 'user' ? '#0F172A' : theme.palette.action.hover,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" mb={0.25}>
                      {m.rol === 'user'
                        ? <User size={11} color="#94A3B8" />
                        : <Bot size={11} color="#F59E0B" />}
                      <Typography sx={{ fontSize: 10, color: m.rol === 'user' ? '#94A3B8' : theme.palette.text.secondary }}>
                        {m.rol === 'user' ? t('asistente_ia.vos') : t('asistente_ia.asistente')}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: 13,
                        whiteSpace: 'pre-wrap',
                        color: m.rol === 'user' ? '#F8FAFC' : theme.palette.text.primary,
                      }}
                    >
                      {m.contenido}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {enviarMutation.isPending && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 0.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={14} />
                    <Typography variant="caption" color="text.secondary">
                      {t('asistente_ia.pensando')}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('asistente_ia.placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEnviar();
                  }
                }}
                disabled={enviarMutation.isPending}
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 },
                }}
              />
              <IconButton
                onClick={handleEnviar}
                disabled={enviarMutation.isPending || !input.trim()}
                sx={{
                  bgcolor: '#F59E0B',
                  color: '#0F172A',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#D97706' },
                  '&:disabled': { bgcolor: theme.palette.action.disabledBackground },
                  alignSelf: 'flex-end',
                }}
              >
                <Send size={16} />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Collapse>

      {/* FAB */}
      <Fab
        onClick={() => setAbierto((p) => !p)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          bgcolor: '#0F172A',
          color: '#F59E0B',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          '&:hover': { bgcolor: '#1E293B' },
        }}
      >
        {abierto ? <X size={22} /> : <MessageSquare size={22} />}
      </Fab>
    </>
  );
};