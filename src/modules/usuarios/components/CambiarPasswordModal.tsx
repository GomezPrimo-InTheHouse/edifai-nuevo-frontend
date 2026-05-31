// import React from 'react';
// import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
// import { X } from 'lucide-react';
// import { useForm } from 'react-hook-form';
// import { useCambiarPassword } from '../hooks/useUsuarios';
// import { useNotify } from '../../../shared/hooks/useNotify';

// interface Props { open: boolean; onClose: () => void; usuarioId: number; }

// export const CambiarPasswordModal: React.FC<Props> = ({ open, onClose, usuarioId }) => {
//   const notify = useNotify();
//   const { register, handleSubmit, reset, formState: { errors } } = useForm<{ password: string; confirmar: string }>();
//   const mutation = useCambiarPassword();

//   const onSubmit = async (values: { password: string; confirmar: string }) => {
//     if (values.password !== values.confirmar) {
//       notify.error('Las contraseñas no coinciden.');
//       return;
//     }
//     try {
//       await mutation.mutateAsync({ id: usuarioId, password: values.password });
//       notify.success('Contraseña actualizada correctamente.');
//       reset();
//       onClose();
//     } catch {
//       notify.error('No se pudo cambiar la contraseña.');
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableEnforceFocus>
//       <DialogTitle>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Typography variant="h6" fontWeight={700}>Cambiar contraseña</Typography>
//           <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
//         </Box>
//       </DialogTitle>
//       <DialogContent>
//         <Box component="form" onSubmit={handleSubmit(onSubmit)}>
//           <Stack spacing={2} sx={{ mt: 1 }}>
//             <TextField
//               {...register('password', { required: 'Obligatorio', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
//               fullWidth type="password" label="Nueva contraseña"
//               error={!!errors.password} helperText={errors.password?.message ?? ''}
//             />
//             <TextField
//               {...register('confirmar', { required: 'Obligatorio' })}
//               fullWidth type="password" label="Confirmar contraseña"
//               error={!!errors.confirmar} helperText={errors.confirmar?.message ?? ''}
//             />
//             <Stack direction="row" justifyContent="flex-end" spacing={1}>
//               <Button variant="outlined" onClick={onClose}>Cancelar</Button>
//               <Button type="submit" variant="contained" disabled={mutation.isPending}>
//                 {mutation.isPending ? 'Guardando...' : 'Cambiar'}
//               </Button>
//             </Stack>
//           </Stack>
//         </Box>
//       </DialogContent>
//     </Dialog>
//   );
// };

import React from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle,
  IconButton, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useCambiarPassword } from '../hooks/useUsuarios';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props { open: boolean; onClose: () => void; usuarioId: number; }

export const CambiarPasswordModal: React.FC<Props> = ({ open, onClose, usuarioId }) => {
  const notify = useNotify();
  const theme = useTheme();
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ password: string; confirmar: string }>();
  const mutation = useCambiarPassword();

  const onSubmit = async (values: { password: string; confirmar: string }) => {
    if (values.password !== values.confirmar) {
      notify.error(t('cambiar_password.no_coinciden'));
      return;
    }
    try {
      await mutation.mutateAsync({ id: usuarioId, password: values.password });
      notify.success(t('cambiar_password.success'));
      reset();
      onClose();
    } catch {
      notify.error(t('cambiar_password.error'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableEnforceFocus
      PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}
    >
      <DialogTitle sx={{ borderBottom: `0.5px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{t('cambiar_password.titulo')}</Typography>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              {...register('password', {
                required: t('cambiar_password.obligatorio'),
                minLength: { value: 6, message: t('cambiar_password.min_length') },
              })}
              fullWidth type="password" label={t('cambiar_password.nueva')}
              error={!!errors.password} helperText={errors.password?.message ?? ''}
            />
            <TextField
              {...register('confirmar', { required: t('cambiar_password.obligatorio') })}
              fullWidth type="password" label={t('cambiar_password.confirmar')}
              error={!!errors.confirmar} helperText={errors.confirmar?.message ?? ''}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="outlined" onClick={onClose}>{t('cambiar_password.cancelar')}</Button>
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? t('cambiar_password.guardando') : t('cambiar_password.cambiar')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};