import React, { useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle,
  Divider, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography,
} from '@mui/material';
import { Trash2, X } from 'lucide-react';
import { useCreateTipoMaterial, useDeleteTipoMaterial, useTiposMaterialList } from '../hooks/useTipoMaterial';
import { useNotify } from '../../../shared/hooks/useNotify';

interface TipoMaterialModalProps {
  open: boolean;
  onClose: () => void;
}

export const TipoMaterialModal: React.FC<TipoMaterialModalProps> = ({ open, onClose }) => {
  const [nombre, setNombre] = useState('');
  const notify = useNotify();
  const { data: tipos = [], isLoading } = useTiposMaterialList();
  const createMutation = useCreateTipoMaterial();
  const deleteMutation = useDeleteTipoMaterial();

  const handleCreate = async () => {
    if (!nombre.trim()) return;
    try {
      await createMutation.mutateAsync({ nombre: nombre.trim() });
      setNombre('');
      notify.success('Tipo de material creado.');
    } catch {
      notify.error('No se pudo crear el tipo de material.');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm({
      title: '¿Eliminar tipo de material?',
      message: 'Solo se puede eliminar si no hay materiales de este tipo.',
      confirmLabel: 'Eliminar',
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success('Tipo eliminado.');
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Tipos de material</Typography>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Formulario */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: '#64748B' }}>NUEVO TIPO</Typography>
          <Stack spacing={1.5}>
            <TextField fullWidth label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} size="small" />
            <Button variant="contained" onClick={handleCreate} disabled={!nombre.trim() || createMutation.isPending} sx={{ alignSelf: 'flex-end' }}>
              {createMutation.isPending ? 'Creando...' : 'Crear tipo'}
            </Button>
          </Stack>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: '#64748B' }}>TIPOS EXISTENTES</Typography>
        {isLoading && <CircularProgress size={24} />}
        {!isLoading && tipos.length === 0 && <Typography variant="body2" color="text.secondary">No hay tipos creados.</Typography>}
        <List disablePadding>
          {tipos.map((t) => (
            <ListItem key={t.id} disablePadding sx={{ display: 'flex', justifyContent: 'space-between', py: 1, px: 1.5, borderRadius: 2, '&:hover': { backgroundColor: '#F8FAFC' } }}>
              <ListItemText primary={t.nombre} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              <IconButton size="small" color="error" onClick={() => handleDelete(t.id)} disabled={deleteMutation.isPending}>
                <Trash2 size={16} />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};