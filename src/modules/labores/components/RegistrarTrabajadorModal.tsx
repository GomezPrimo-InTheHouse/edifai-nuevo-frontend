import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle, Divider,
  Grid, IconButton, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { X, UserPlus, Link2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useCreateTrabajador, useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { useVincularProveedorTrabajador } from '../hooks/useLaborPresupuestos';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { Trabajador } from '../../trabajadores/types/trabajador.types';

interface Props {
  open: boolean;
  nombreSugerido?: string | null;
  proveedorExternoId?: number | null;
  laborId?: number;
  onClose: () => void;
  onTrabajadorCreado: (trabajador: Trabajador) => void;
}

const schema = z.object({
  nombre: z.string().min(1, 'Obligatorio'),
  apellido: z.string().min(1, 'Obligatorio'),
  dni: z.string().optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')),
  especialidad_id: z.union([z.number(), z.literal('')]).optional(),
});

type FormValues = z.infer<typeof schema>;

type Modo = 'nuevo' | 'vincular';

export const RegistrarTrabajadorModal: React.FC<Props> = ({
  open, nombreSugerido, proveedorExternoId, laborId, onClose, onTrabajadorCreado,
}) => {
  const { t } = useTranslation();
  const notify = useNotify();
  const createTrabajador = useCreateTrabajador();
  const vincularMutation = useVincularProveedorTrabajador();
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: trabajadores = [] } = useTrabajadoresList();

  const [modo, setModo] = useState<Modo>('nuevo');
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<number | ''>('');

  const partes = (nombreSugerido ?? '').trim().split(' ');
  const nombreDefault = partes[0] ?? '';
  const apellidoDefault = partes.slice(1).join(' ') ?? '';

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: nombreDefault,
      apellido: apellidoDefault,
      dni: '',
      telefono: '',
      email: '',
      password: '',
      especialidad_id: '',
    },
  });

  const handleClose = () => {
    reset();
    setModo('nuevo');
    setTrabajadorSeleccionado('');
    onClose();
  };

  const handleSubmitForm = async (values: FormValues) => {
    try {
      const payload: any = {
        nombre: values.nombre,
        apellido: values.apellido,
        dni: values.dni || null,
        telefono: values.telefono || null,
        email: values.email || null,
        password: values.password || null,
        especialidad_id: values.especialidad_id === '' ? null : values.especialidad_id,
        jefe_id: null,
        estado_id: null,
        fecha_ingreso: new Date().toISOString().split('T')[0],
        usuario_creador_id: null,
      };

      const trabajador = await createTrabajador.mutateAsync(payload);
      notify.success(t('registrar_trabajador.creado_ok'));
      handleClose();
      onTrabajadorCreado(trabajador);
    } catch {
      notify.error(t('registrar_trabajador.error_crear'));
    }
  };

  const handleVincular = async () => {
    if (!proveedorExternoId || !trabajadorSeleccionado) return;
    try {
      const result = await vincularMutation.mutateAsync({
        proveedor_id: proveedorExternoId,
        trabajador_id: Number(trabajadorSeleccionado),
        labor_id: laborId,
      });
      notify.success(t('registrar_trabajador.vinculado_ok', { nombre: result.trabajador_nombre }));
      handleClose();
      onTrabajadorCreado({ id: result.trabajador_id } as Trabajador);
    } catch {
      notify.error(t('registrar_trabajador.error_vincular'));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            <UserPlus size={18} color="#F59E0B" />
            <Typography variant="h6" fontWeight={700}>{t('registrar_trabajador.titulo')}</Typography>
          </Stack>
          <IconButton size="small" onClick={handleClose}><X size={18} /></IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>

        {/* Aviso informativo — el presupuesto ya está confirmado */}
        <Stack spacing={0.5} sx={{
          mb: 2.5, mt: 1, p: 1.5, borderRadius: 2,
          bgcolor: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.3)',
        }}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {t('registrar_trabajador.aviso_titulo')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('registrar_trabajador.aviso_desc')}
          </Typography>
        </Stack>

        {/* Selector de modo — solo si hay proveedor externo para vincular */}
        {proveedorExternoId && (
          <ToggleButtonGroup
            exclusive
            value={modo}
            onChange={(_, val) => { if (val) setModo(val); }}
            sx={{ width: '100%', mb: 2.5 }}
          >
            <ToggleButton value="nuevo" sx={{ flex: 1, gap: 1 }}>
              <UserPlus size={14} />
              {t('registrar_trabajador.modo_nuevo')}
            </ToggleButton>
            <ToggleButton value="vincular" sx={{ flex: 1, gap: 1 }}>
              <Link2 size={14} />
              {t('registrar_trabajador.modo_vincular')}
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {/* ── MODO VINCULAR ── */}
        {modo === 'vincular' && proveedorExternoId && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('registrar_trabajador.vincular_desc')}
            </Typography>
            <TextField
              select fullWidth label={t('registrar_trabajador.seleccionar_trabajador')}
              value={trabajadorSeleccionado}
              onChange={(e) => setTrabajadorSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
              SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 320 } } } }}
            >
              <MenuItem value="">{t('registrar_trabajador.seleccionar')}</MenuItem>
              {trabajadores.map((tr) => (
                <MenuItem key={tr.id} value={tr.id}>{tr.nombre} {tr.apellido}</MenuItem>
              ))}
            </TextField>

            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={handleClose}>
                {t('registrar_trabajador.no_por_ahora')}
              </Button>
              <Button
                variant="contained"
                onClick={handleVincular}
                disabled={!trabajadorSeleccionado || vincularMutation.isPending}
              >
                {vincularMutation.isPending
                  ? t('registrar_trabajador.vinculando')
                  : t('registrar_trabajador.vincular')}
              </Button>
            </Stack>
          </Box>
        )}

        {/* ── MODO NUEVO (form completo) ── */}
        {modo === 'nuevo' && (
          <Box component="form" onSubmit={handleSubmit(handleSubmitForm)}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="nombre" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth label={t('registrar_trabajador.nombre')}
                    error={!!errors.nombre} helperText={errors.nombre?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="apellido" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth label={t('registrar_trabajador.apellido')}
                    error={!!errors.apellido} helperText={errors.apellido?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="dni" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth label={t('registrar_trabajador.dni')} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="telefono" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth label={t('registrar_trabajador.telefono')} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="especialidad_id" control={control} render={({ field }) => (
                  <TextField
                    select fullWidth label={t('registrar_trabajador.especialidad')}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <MenuItem value="">{t('registrar_trabajador.sin_especialidad')}</MenuItem>
                    {especialidades.map((e) => (
                      <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
                    ))}
                  </TextField>
                )} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider>
                  <Typography variant="caption" color="text.disabled">
                    {t('registrar_trabajador.acceso_opcional')}
                  </Typography>
                </Divider>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="email" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth label={t('registrar_trabajador.email')}
                    type="email" error={!!errors.email} helperText={errors.email?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="password" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth label={t('registrar_trabajador.password')}
                    type="password" />
                )} />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={handleClose}>
                {t('registrar_trabajador.no_por_ahora')}
              </Button>
              <Button variant="contained" type="submit" disabled={createTrabajador.isPending}>
                {createTrabajador.isPending
                  ? t('registrar_trabajador.guardando')
                  : t('registrar_trabajador.registrar')}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};