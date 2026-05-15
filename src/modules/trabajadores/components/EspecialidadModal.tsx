import React, { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Divider, IconButton, List, ListItem,
  ListItemText, Snackbar, Stack, TextField, Typography,
} from '@mui/material';
import { Trash2, X } from 'lucide-react';
import { useCreateEspecialidad, useDeleteEspecialidad, useEspecialidadesList } from '../hooks/useEspecialidades';
import type { EspecialidadOption } from '../types/trabajador.types';

interface EspecialidadModalProps {
  open: boolean;
  onClose: () => void;
}

export const EspecialidadModal: React.FC<EspecialidadModalProps> = ({ open, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; especialidad: EspecialidadOption | null }>({
    open: false, especialidad: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const { data: especialidades = [], isLoading } = useEspecialidadesList();
  const createMutation = useCreateEspecialidad();
  const deleteMutation = useDeleteEspecialidad();

  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const handleCreate = async () => {
    if (!nombre.trim() || !descripcion.trim()) return;
    try {
      await createMutation.mutateAsync({ nombre: nombre.trim(), descripcion: descripcion.trim() });
      setNombre('');
      setDescripcion('');
      showSnackbar('Especialidad creada con éxito', 'success');
    } catch {
      showSnackbar('Error al crear la especialidad', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.especialidad) return;
    try {
      await deleteMutation.mutateAsync(confirmDialog.especialidad.id);
      showSnackbar('Especialidad eliminada correctamente', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al eliminar la especialidad';
      showSnackbar(msg, 'error');
    } finally {
      setConfirmDialog({ open: false, especialidad: null });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableEnforceFocus>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>Especialidades</Typography>
            <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: '#64748B' }}>
              NUEVA ESPECIALIDAD
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                fullWidth label="Nombre *" value={nombre}
                onChange={(e) => setNombre(e.target.value)} size="small"
              />
              <TextField
                fullWidth label="Descripción *" value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)} size="small"
              />
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={!nombre.trim() || !descripcion.trim() || createMutation.isPending}
                sx={{ alignSelf: 'flex-end' }}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear especialidad'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: '#64748B' }}>
            ESPECIALIDADES EXISTENTES
          </Typography>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {!isLoading && especialidades.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              No hay especialidades creadas.
            </Typography>
          )}
          {!isLoading && especialidades.length > 0 && (
            <List disablePadding>
              {especialidades.map((esp) => (
                <ListItem
                  key={esp.id} disablePadding
                  sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    py: 1, px: 1.5, borderRadius: 2,
                    '&:hover': { backgroundColor: '#F8FAFC' },
                  }}
                >
                  <ListItemText
                    primary={esp.nombre}
                    secondary={esp.descripcion || null}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                  <IconButton
                    size="small" color="error"
                    onClick={() => setConfirmDialog({ open: true, especialidad: esp })}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, especialidad: null })} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Eliminar especialidad</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que querés eliminar <strong>{confirmDialog.especialidad?.nombre}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialog({ open: false, especialidad: null })} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained" color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};