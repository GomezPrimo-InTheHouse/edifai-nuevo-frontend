import React from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCambiarPassword } from '../hooks/useUsuarios';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props { open: boolean; onClose: () => void; usuarioId: number; }

export const CambiarPasswordModal: React.FC<Props> = ({ open, onClose, usuarioId }) => {
  const notify = useNotify();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ password: string; confirmar: string }>();
  const mutation = useCambiarPassword();

  const onSubmit = async (values: { password: string; confirmar: string }) => {
    if (values.password !== values.confirmar) {
      notify.error('Las contraseñas no coinciden.');
      return;
    }
    try {
      await mutation.mutateAsync({ id: usuarioId, password: values.password });
      notify.success('Contraseña actualizada correctamente.');
      reset();
      onClose();
    } catch {
      notify.error('No se pudo cambiar la contraseña.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Cambiar contraseña</Typography>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              {...register('password', { required: 'Obligatorio', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
              fullWidth type="password" label="Nueva contraseña"
              error={!!errors.password} helperText={errors.password?.message ?? ''}
            />
            <TextField
              {...register('confirmar', { required: 'Obligatorio' })}
              fullWidth type="password" label="Confirmar contraseña"
              error={!!errors.confirmar} helperText={errors.confirmar?.message ?? ''}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="outlined" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Cambiar'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};