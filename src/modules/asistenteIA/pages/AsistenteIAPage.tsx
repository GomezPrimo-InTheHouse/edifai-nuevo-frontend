

import { useEffect, useRef, useState } from 'react';
import {
  Box, Paper, TextField, IconButton, Typography, List, ListItemButton,
  ListItemText, Drawer, useMediaQuery, CircularProgress, Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Send, Plus, Menu, Bot, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { asistenteApi } from '../../../services/api/asistente.api';
import { useAsistenteChat } from '../hooks/useAsistenteChat';

const AsistenteIAPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [input, setInput] = useState('');
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { sesionId, mensajes, cargarSesion, nuevaSesion, enviarMensaje, enviando } = useAsistenteChat();

  const { data: sesiones } = useQuery({
    queryKey: ['asistente', 'sesiones'],
    queryFn: () => asistenteApi.obtenerSesiones(),
    select: (res) => res.data,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes, enviando]);

  const handleEnviar = () => {
    if (!input.trim() || enviando) return;
    enviarMensaje(input.trim());
    setInput('');
  };

  const Sidebar = (
    <Box sx={{ width: 280, bgcolor: 'background.paper', height: '100%', borderRight: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => { nuevaSesion(); setSidebarAbierto(false); }}
          sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
        >
          <Plus size={18} style={{ marginRight: 8 }} />
          <ListItemText primary={t('asistente_ia.nueva_sesion')} />
        </ListItemButton>
      </Box>
      <List>
        {sesiones?.map((s) => (
          <ListItemButton
            key={s.id}
            selected={s.id === sesionId}
            onClick={() => { cargarSesion(s.id); setSidebarAbierto(false); }}
          >
            <ListItemText primary={s.titulo} primaryTypographyProps={{ noWrap: true, fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: 'background.default' }}>
      {isMobile ? (
        <Drawer open={sidebarAbierto} onClose={() => setSidebarAbierto(false)}>{Sidebar}</Drawer>
      ) : Sidebar}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {isMobile && (
          <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <IconButton onClick={() => setSidebarAbierto(true)}><Menu size={20} /></IconButton>
          </Box>
        )}

        <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {mensajes.length === 0 && (
            <Typography color="text.secondary" textAlign="center" mt={6}>
              {t('asistente_ia.empty')}
            </Typography>
          )}

          <Stack spacing={2}>
            {mensajes.map((m, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: m.rol === 'user' ? 'flex-end' : 'flex-start' }}>
                <Paper
                  sx={{
                    p: 1.5, maxWidth: '75%',
                    bgcolor: m.rol === 'user' ? theme.palette.action.hover : 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none', borderRadius: 3,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    {m.rol === 'user'
                      ? <User size={14} color={theme.palette.text.secondary} />
                      : <Bot size={14} color={theme.palette.text.secondary} />}
                    <Typography variant="caption" color="text.secondary">
                      {m.rol === 'user' ? t('asistente_ia.vos') : t('asistente_ia.asistente')}
                    </Typography>
                  </Stack>
                  <Typography whiteSpace="pre-wrap">{m.contenido}</Typography>
                </Paper>
              </Box>
            ))}
            {enviando && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <CircularProgress size={18} />
              </Box>
            )}
          </Stack>
        </Box>

        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth size="small"
              placeholder={t('asistente_ia.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEnviar(); }}
              disabled={enviando}
            />
            <IconButton onClick={handleEnviar} disabled={enviando || !input.trim()} color="primary">
              <Send size={20} />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default AsistenteIAPage;