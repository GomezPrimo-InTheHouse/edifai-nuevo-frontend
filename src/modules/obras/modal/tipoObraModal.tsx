import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Trash2, X } from 'lucide-react';
import {
  useCreateTipoObra,
  useDeleteTipoObra,
  useTiposObraList,
} from '../hooks/useTiposObra';

interface TipoObraModalProps {
  open: boolean;
  onClose: () => void;
}

export const TipoObraModal: React.FC<TipoObraModalProps> = ({ open, onClose }) => {
  // Estado local del formulario de creación
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Datos y mutaciones
  const { data: tiposObra = [], isLoading } = useTiposObraList();
  const createMutation = useCreateTipoObra();
  const deleteMutation = useDeleteTipoObra();

  // Handler de creación — limpia el formulario al completarse
  const handleCreate = async () => {
    if (!nombre.trim()) return;
    await createMutation.mutateAsync({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
    });
    setNombre('');
    setDescripcion('');
  };

  // Handler de eliminación — confirma antes de proceder
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Eliminar este tipo de obra?');
    if (!confirmed) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Tipos de obra
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={18} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Formulario para crear un nuevo tipo de obra */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: '#64748B' }}>
            NUEVO TIPO
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!nombre.trim() || createMutation.isPending}
              sx={{ alignSelf: 'flex-end' }}
            >
              {createMutation.isPending ? 'Creando...' : 'Crear tipo'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Lista de tipos de obra existentes con opción de eliminar */}
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: '#64748B' }}>
          TIPOS EXISTENTES
        </Typography>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isLoading && tiposObra.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No hay tipos de obra creados.
          </Typography>
        )}

        {!isLoading && tiposObra.length > 0 && (
          <List disablePadding>
            {tiposObra.map((tipo) => (
              <ListItem
                key={tipo.id}
                disablePadding
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  px: 1.5,
                  borderRadius: 2,
                  '&:hover': { backgroundColor: '#F8FAFC' },
                }}
              >
                <ListItemText
                  primary={tipo.nombre}
                  secondary={tipo.descripcion || null}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: 12 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(tipo.id)}
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
  );
};