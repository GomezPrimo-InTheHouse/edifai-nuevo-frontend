import { useEffect } from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle,
  Divider, InputAdornment, MenuItem, Stack,
  TextField, Typography, useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { usePublicarMaterial } from '../hooks/usePublicarMaterial';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { Material } from '../../materiales/types/material.types';

const schema = z.object({
  cantidad: z.number({ invalid_type_error: 'Ingresá una cantidad' }).positive('Debe ser mayor a 0'),
  descripcion: z.string().optional(),
  moneda: z.string().default('ARS'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  material: Material;
}

const MONEDAS = ['ARS', 'USD', 'EUR'];

export const PublicarMaterialModal: React.FC<Props> = ({ open, onClose, material }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const notify = useNotify();
  const publicarMutation = usePublicarMaterial();

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cantidad: 1, descripcion: '', moneda: 'ARS' },
  });

  useEffect(() => { if (!open) reset(); }, [open]);

  const cantidadWatch = watch('cantidad');
  const total = (cantidadWatch * Number(material.precio_unitario)).toLocaleString('es-AR');

  const onSubmit = async (data: FormData) => {
    try {
      await publicarMutation.mutateAsync({
        material_id: material.id,
        nombre_material: material.nombre,
        cantidad: data.cantidad,
        unidad: material.unidad,
        precio_unitario: Number(material.precio_unitario),
        descripcion: data.descripcion,
        moneda: data.moneda,
      });
      notify.success(t('market.notify.publicado'));
      onClose();
    } catch (error: any) {
      notify.error(error?.response?.data?.message || t('market.notify.error_publicar'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>{t('market.publicacion.title')}</Typography>
        <Typography variant="body2" color="text.secondary">{material.nombre}</Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)}>

          {/* Info del material */}
          <Box sx={{
            p: 2, borderRadius: 2,
            bgcolor: theme.palette.action.hover,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">{t('market.card.precio')}</Typography>
              <Typography variant="body2" fontWeight={700}>
                ${Number(material.precio_unitario).toLocaleString('es-AR')} / {material.unidad}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">{t('market.publicacion.cantidad_hint', { stock: material.stock_actual, unidad: material.unidad })}</Typography>
            </Stack>
          </Box>

          {/* Cantidad */}
          <Controller
            name="cantidad"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('market.publicacion.cantidad')}
                type="number"
                fullWidth
                error={!!errors.cantidad}
                helperText={errors.cantidad?.message}
                inputProps={{ min: 1, max: Number(material.stock_actual), step: 0.01 }}
                onChange={(e) => field.onChange(Number(e.target.value))}
                InputProps={{ endAdornment: <InputAdornment position="end">{material.unidad}</InputAdornment> }}
              />
            )}
          />

          {/* Moneda */}
          <Controller
            name="moneda"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label={t('market.publicacion.moneda')} fullWidth>
                {MONEDAS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            )}
          />

          {/* Descripcion */}
          <Controller
            name="descripcion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('market.publicacion.descripcion')}
                fullWidth multiline rows={2}
              />
            )}
          />

          {/* Total estimado */}
          <Box sx={{
            p: 2, borderRadius: 2,
            bgcolor: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">{t('market.card.total')}</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#F59E0B' }}>
                ${total}
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={onClose} disabled={publicarMutation.isPending}>
              {t('market.transaccion.cancelar')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={publicarMutation.isPending}
              sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}
            >
              {publicarMutation.isPending ? t('market.publicacion.publicando') : t('market.publicacion.publicar')}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};