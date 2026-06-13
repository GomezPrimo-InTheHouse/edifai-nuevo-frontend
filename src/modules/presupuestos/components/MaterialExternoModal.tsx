import React, { useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogContent, DialogTitle,
  Divider, IconButton, MenuItem, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { AlertTriangle, PackagePlus, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useCreateMaterial } from '../../materiales/hooks/useMateriales';
import { useTiposMaterialList } from '../../materiales/hooks/useTipoMaterial';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { Material } from '../../materiales/types/material.types';

const UNIDADES = ['unidad', 'kg', 'litro', 'metro', 'm²', 'm³', 'ml', 'bolsa', 'barra', 'rollo', 'caja', 'tn', 'gl', 'hr'];
const ESTADO_SIN_STOCK = 25;

interface Props {
  open: boolean;
  onClose: () => void;
  materialesExistentes: Material[];
  onMaterialCreado: (material: { id: number; nombre: string; unidad: string; precio_unitario: number }, cantidad: number) => void;
}

const schema = z.object({
  nombre: z.string().min(1, 'Obligatorio'),
  tipo_material_id: z.union([z.number(), z.literal('')]),
  unidad: z.string().min(1, 'Obligatorio'),
  precio_unitario: z.coerce.number().min(0.01, 'Debe ser mayor a 0'),
  descripcion: z.string().optional().or(z.literal('')),
  cantidad: z.coerce.number().min(0.01, 'Debe ser mayor a 0'),
});

type FormValues = z.infer<typeof schema>;

type Fase = 'form' | 'similares' | 'confirmar';

export const MaterialExternoModal: React.FC<Props> = ({
  open, onClose, materialesExistentes, onMaterialCreado,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const notify = useNotify();
  const createMaterial = useCreateMaterial();
  const { data: tipos = [] } = useTiposMaterialList();

  const [fase, setFase] = useState<Fase>('form');
  const [similares, setSimilares] = useState<Material[]>([]);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '', tipo_material_id: '', unidad: '',
      precio_unitario: '' as any, descripcion: '', cantidad: '' as any,
    },
  });

  const nombreWatch = watch('nombre');
  const tipoWatch = watch('tipo_material_id');

  const handleClose = () => {
    reset();
    setFase('form');
    setSimilares([]);
    onClose();
  };

  const buscarSimilares = (nombre: string, tipo_material_id: number | ''): Material[] => {
    const nombreLower = nombre.toLowerCase().trim();
    return materialesExistentes.filter((m) => {
      const nombreMatch = m.nombre.toLowerCase().includes(nombreLower) || nombreLower.includes(m.nombre.toLowerCase());
      const tipoMatch = tipo_material_id === '' || m.tipo_material_id === Number(tipo_material_id);
      return nombreMatch && tipoMatch;
    });
  };

  const onSubmitForm = (values: FormValues) => {
    const encontrados = buscarSimilares(values.nombre, values.tipo_material_id);
    setSimilares(encontrados);

    if (encontrados.length > 0) {
      setFase('similares');
    } else {
      setFase('confirmar');
    }
  };

  const handleCrearDeTodosFormas = async () => {
    await crearMaterial();
  };

  const crearMaterial = async () => {
    const values = watch();
    try {
      const material = await createMaterial.mutateAsync({
        nombre: values.nombre,
        unidad: values.unidad,
        precio_unitario: Number(values.precio_unitario),
        descripcion: values.descripcion || undefined,
        tipo_material_id: values.tipo_material_id === '' ? undefined : Number(values.tipo_material_id),
        stock_actual: 0,
        estado_id: ESTADO_SIN_STOCK,
        origen: 'externo',
      } as any);

      notify.success(t('material_externo.creado_ok'));
      onMaterialCreado({
        id: material.id,
        nombre: material.nombre,
        unidad: material.unidad,
        precio_unitario: Number(material.precio_unitario),
      }, Number(values.cantidad));

      handleClose();
    } catch {
      notify.error(t('material_externo.error_crear'));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" disableEnforceFocus
      PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}
    >
      <DialogTitle sx={{ borderBottom: `0.5px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <PackagePlus size={18} color="#F59E0B" />
            <Typography variant="h6" fontWeight={700}>{t('material_externo.titulo')}</Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>

        {/* ── FASE FORM ── */}
        {fase === 'form' && (
          <Box component="form" onSubmit={handleSubmit(onSubmitForm)}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ fontSize: 12 }}>
                {t('material_externo.aviso')}
              </Alert>

              <Controller name="nombre" control={control} render={({ field }) => (
                <TextField {...field} fullWidth label={t('material_externo.nombre')}
                  error={!!errors.nombre} helperText={errors.nombre?.message} />
              )} />

              <Controller name="tipo_material_id" control={control} render={({ field }) => (
                <TextField select fullWidth label={t('material_externo.tipo')}
                  value={field.value} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  error={!!errors.tipo_material_id} helperText={errors.tipo_material_id?.message as string}
                >
                  <MenuItem value="">{t('material_externo.sin_tipo')}</MenuItem>
                  {tipos.map((tp) => <MenuItem key={tp.id} value={tp.id}>{tp.nombre}</MenuItem>)}
                </TextField>
              )} />

              <Controller name="unidad" control={control} render={({ field }) => (
                <TextField select fullWidth label={t('material_externo.unidad')}
                  value={field.value} onChange={field.onChange}
                  error={!!errors.unidad} helperText={errors.unidad?.message}
                >
                  <MenuItem value="">{t('material_externo.seleccionar')}</MenuItem>
                  {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </TextField>
              )} />

              <Controller name="precio_unitario" control={control} render={({ field }) => (
                <TextField {...field} fullWidth type="number" label={t('material_externo.precio_unitario')}
                  inputProps={{ min: 0.01, step: 0.01 }}
                  error={!!errors.precio_unitario} helperText={errors.precio_unitario?.message} />
              )} />

              <Controller name="cantidad" control={control} render={({ field }) => (
                <TextField {...field} fullWidth type="number" label={t('material_externo.cantidad')}
                  inputProps={{ min: 0.01, step: 0.01 }}
                  error={!!errors.cantidad} helperText={errors.cantidad?.message} />
              )} />

              <Controller name="descripcion" control={control} render={({ field }) => (
                <TextField {...field} fullWidth multiline minRows={2} label={t('material_externo.descripcion')} />
              )} />

              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button variant="outlined" onClick={handleClose}>{t('material_externo.cancelar')}</Button>
                <Button type="submit" variant="contained">
                  {t('material_externo.siguiente')}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* ── FASE SIMILARES ── */}
        {fase === 'similares' && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning" icon={<AlertTriangle size={18} />}>
              {t('material_externo.similares_aviso', { n: similares.length })}
            </Alert>

            <Stack spacing={1}>
              {similares.map((m) => (
                <Box key={m.id} sx={{
                  p: 1.5, borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.action.hover,
                }}>
                  <Typography variant="body2" fontWeight={700}>{m.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.unidad} — ${Number(m.precio_unitario).toLocaleString('es-AR')} — Stock: {m.stock_actual}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider />

            <Typography variant="body2" color="text.secondary">
              {t('material_externo.similares_pregunta')}
            </Typography>

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="outlined" onClick={() => setFase('form')}>
                {t('material_externo.volver_form')}
              </Button>
              <Button variant="outlined" color="warning" onClick={() => setFase('confirmar')}>
                {t('material_externo.crear_de_todas_formas')}
              </Button>
            </Stack>
          </Stack>
        )}

        {/* ── FASE CONFIRMAR ── */}
        {fase === 'confirmar' && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              {t('material_externo.confirmar_aviso')}
            </Alert>

            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.action.hover }}>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{t('material_externo.resumen')}</Typography>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {t('material_externo.nombre')}: <strong>{watch('nombre')}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('material_externo.unidad')}: <strong>{watch('unidad')}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('material_externo.precio_unitario')}: <strong>${Number(watch('precio_unitario')).toLocaleString('es-AR')}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('material_externo.cantidad')}: <strong>{watch('cantidad')}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('material_externo.estado_inicial')}: <strong>{t('material_externo.sin_stock')}</strong>
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="outlined" onClick={() => setFase(similares.length > 0 ? 'similares' : 'form')}>
                {t('material_externo.volver')}
              </Button>
              <Button
                variant="contained"
                onClick={handleCrearDeTodosFormas}
                disabled={createMaterial.isPending}
              >
                {createMaterial.isPending
                  ? t('material_externo.creando')
                  : t('material_externo.confirmar_crear')}
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};