import React, { useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle,
  Divider, IconButton, List, ListItem, ListItemText, MenuItem,
  Stack, TextField, Typography,
} from '@mui/material';
import { Trash2, X } from 'lucide-react';
import { useCreateEspecialidad, useDeleteEspecialidad, useEspecialidadesList, useEstadosGenerales } from '../hooks/useEspecialidades';

interface EspecialidadModalProps {
  open: boolean;
  onClose: () => void;
}

export const EspecialidadModal: React.FC<EspecialidadModalProps> = ({ open, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estadoId, setEstadoId] = useState<number | ''>('');

  const { data: especialidades = [], isLoading } = useEspecialidadesList();
  const { data: estados = [] } = useEstadosGenerales();
  const createMutation = useCreateEspecialidad();
  const deleteMutation = useDeleteEspecialidad();

  // Handler de creación — limpia el formulario al completarse
  const handleCreate = async () => {
    if (!nombre.trim()) return;
    await createMutation.mutateAsync({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      estado_id: estadoId === '' ? undefined : estadoId,
    });
    setNombre('');
    setDescripcion('');
    setEstadoId('');
  };

  // Handler de eliminación — confirma antes de proceder
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Eliminar esta especialidad?');
    if (!confirmed) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Especialidades</Typography>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Formulario para crear nueva especialidad */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: '#64748B' }}>
            NUEVA ESPECIALIDAD
          </Typography>
          <Stack spacing={1.5}>
            <TextField fullWidth label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} size="small" />
            <TextField fullWidth label="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} size="small" />

            {/* Select de estado */}
            <TextField
              select fullWidth label="Estado" size="small"
              value={estadoId}
              onChange={(e) => setEstadoId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              {estados.map((estado) => (
                <MenuItem key={estado.id} value={estado.id}>{estado.nombre}</MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!nombre.trim() || createMutation.isPending}
              sx={{ alignSelf: 'flex-end' }}
            >
              {createMutation.isPending ? 'Creando...' : 'Crear especialidad'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Lista de especialidades existentes */}
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: '#64748B' }}>
          ESPECIALIDADES EXISTENTES
        </Typography>

        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>}
        {!isLoading && especialidades.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>No hay especialidades creadas.</Typography>
        )}
        {!isLoading && especialidades.length > 0 && (
          <List disablePadding>
            {especialidades.map((esp) => (
              <ListItem
                key={esp.id} disablePadding
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, px: 1.5, borderRadius: 2, '&:hover': { backgroundColor: '#F8FAFC' } }}
              >
                <ListItemText
                  primary={esp.nombre}
                  secondary={esp.descripcion || null}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: 12 }}
                />
                <IconButton size="small" color="error" onClick={() => handleDelete(esp.id)} disabled={deleteMutation.isPending}>
                  <Trash2 size={16} />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};