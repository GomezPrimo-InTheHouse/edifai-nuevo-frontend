
import { useEffect, useState } from 'react';
import {
  Box, Button, Grid, IconButton, InputAdornment,
  MenuItem, Paper, Stack, TextField, Tooltip, Typography,
  useTheme,
} from '@mui/material';
import { MapPin, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { obraSchema, type ObraSchemaValues } from '../schemas/obra.schema';
import type {
  ClienteOption, EstadoOption, Obra, ObraFormValues, TipoObraOption,
} from '../types/obra.types';
import { MapPickerModal, type MapPickerResult } from './MapPickerModal';

interface ObraFormProps {
  initialData?:  Obra | null;
  tiposObra:     TipoObraOption[];
  estados:       EstadoOption[];
  clientes:      ClienteOption[];
  onSubmit:      (values: ObraFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

function toDateInput(value?: string | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

function toFormDefaults(initialData?: Obra | null): ObraFormValues {
  return {
    nombre:                initialData?.nombre                ?? '',
    descripcion:           initialData?.descripcion           ?? '',
    ubicacion:             initialData?.ubicacion             ?? '',
    latitud:               initialData?.latitud  != null ? Number(initialData.latitud)  : null,
    longitud:              initialData?.longitud != null ? Number(initialData.longitud) : null,
    tipo_obra_id:          initialData?.tipo_obra_id          ?? '',
    estado_id:             initialData?.estado_id             ?? '',
    cliente_id:            initialData?.cliente_id            ?? '',
    fecha_inicio_estimado: toDateInput(initialData?.fecha_inicio_estimado),
    fecha_fin_estimado:    toDateInput(initialData?.fecha_fin_estimado),
    fecha_inicio_real:     toDateInput(initialData?.fecha_inicio_real),
    fecha_fin_real:        toDateInput(initialData?.fecha_fin_real),
    usuario_creador_id:    initialData?.usuario_creador_id    ?? 2,
  };
}

function clienteLabel(c: ClienteOption): string {
  if (c.razon_social) return c.razon_social;
  return `${c.nombre}${c.apellido ? ` ${c.apellido}` : ''}`;
}

export function ObraForm({
  initialData, tiposObra, estados, clientes, onSubmit, isSubmitting = false,
}: ObraFormProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [mapOpen, setMapOpen] = useState(false);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<ObraSchemaValues>({
      resolver: zodResolver(obraSchema),
      defaultValues: toFormDefaults(initialData) as unknown as ObraSchemaValues,
    });

  const ubicacionWatch = watch('ubicacion');
  const latitudWatch   = watch('latitud');
  const longitudWatch  = watch('longitud');

  const latNum      = latitudWatch  != null ? Number(latitudWatch)  : null;
  const lngNum      = longitudWatch != null ? Number(longitudWatch) : null;
  const tieneCoords = latNum != null && !isNaN(latNum) && lngNum != null && !isNaN(lngNum);

  useEffect(() => {
    if (initialData && tiposObra.length > 0 && estados.length > 0) {
      reset(toFormDefaults(initialData) as unknown as ObraSchemaValues);
    }
  }, [initialData, tiposObra, estados, reset]);

  const handleMapConfirm = (result: MapPickerResult) => {
    setValue('ubicacion', result.direccion);
    setValue('latitud',   result.latitud);
    setValue('longitud',  result.longitud);
  };

  const handleClearLocation = () => {
    setValue('ubicacion', '');
    setValue('latitud',   null);
    setValue('longitud',  null);
  };

  const handleFormSubmit = (values: ObraSchemaValues) => {
    onSubmit(values as unknown as ObraFormValues);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2}>

          {/* Nombre */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField
                {...field} fullWidth label={t('obras.form.nombre')}
                error={!!errors.nombre} helperText={errors.nombre?.message ?? ''}
              />
            )} />
          </Grid>

          {/* Ubicación */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="ubicacion" control={control} render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('obras.form.ubicacion')}
                placeholder={t('obras.form.ubicacion_placeholder')}
                error={!!errors.ubicacion}
                helperText={
                  tieneCoords
                    ? t('obras.form.ubicacion_coords', { lat: latNum!.toFixed(5), lng: lngNum!.toFixed(5) })
                    : errors.ubicacion?.message ?? t('obras.form.ubicacion_helper')
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {(ubicacionWatch || tieneCoords) && (
                        <Tooltip title={t('obras.form.limpiar_ubicacion')}>
                          <IconButton size="small" onClick={handleClearLocation} sx={{ mr: 0.5 }}>
                            <X size={14} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t('obras.form.seleccionar_mapa')}>
                        <IconButton
                          size="small"
                          onClick={() => setMapOpen(true)}
                          sx={{
                            bgcolor: tieneCoords ? theme.palette.text.primary : theme.palette.action.hover,
                            color:   tieneCoords ? theme.palette.background.paper : theme.palette.text.secondary,
                            '&:hover': {
                              bgcolor: tieneCoords ? theme.palette.text.secondary : theme.palette.divider,
                            },
                          }}
                        >
                          <MapPin size={16} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            )} />
          </Grid>

          {/* Descripción */}
          <Grid size={{ xs: 12 }}>
            <Controller name="descripcion" control={control} render={({ field }) => (
              <TextField
                {...field} fullWidth multiline minRows={3} label={t('obras.form.descripcion')}
                error={!!errors.descripcion} helperText={errors.descripcion?.message ?? ''}
              />
            )} />
          </Grid>

          {/* Tipo de obra */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="tipo_obra_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label={t('obras.form.tipo_obra')}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.tipo_obra_id} helperText={errors.tipo_obra_id?.message ?? ''}
              >
                <MenuItem value="">{t('obras.form.seleccionar')}</MenuItem>
                {tiposObra.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          {/* Estado */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="estado_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label={t('obras.form.estado')}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.estado_id} helperText={errors.estado_id?.message ?? ''}
              >
                <MenuItem value="">{t('obras.form.seleccionar')}</MenuItem>
                {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          {/* Cliente */}
          <Grid size={{ xs: 12 }}>
            <Controller name="cliente_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label={t('obras.form.cliente')}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                error={!!errors.cliente_id}
                helperText={errors.cliente_id?.message ?? t('obras.form.cliente_helper')}
              >
                <MenuItem value="">{t('obras.form.sin_cliente')}</MenuItem>
                {clientes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {clienteLabel(c)}
                    {c.telefono && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.disabled' }}>
                        · {c.telefono}
                      </Typography>
                    )}
                  </MenuItem>
                ))}
              </TextField>
            )} />
          </Grid>

          {/* Fechas estimadas */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" fontWeight={700}
              sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('obras.form.fechas_estimadas')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_inicio_estimado" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label={t('obras.form.inicio_estimado')}
                InputLabelProps={{ shrink: true }}
                error={!!errors.fecha_inicio_estimado}
                helperText={errors.fecha_inicio_estimado?.message ?? ''}
              />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_fin_estimado" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label={t('obras.form.fin_estimado')}
                InputLabelProps={{ shrink: true }}
                error={!!errors.fecha_fin_estimado}
                helperText={errors.fecha_fin_estimado?.message ?? ''}
              />
            )} />
          </Grid>

          {/* Fechas reales */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" fontWeight={700}
              sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('obras.form.fechas_reales')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_inicio_real" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label={t('obras.form.inicio_real')}
                InputLabelProps={{ shrink: true }}
                error={!!errors.fecha_inicio_real}
                helperText={errors.fecha_inicio_real?.message ?? ''}
              />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_fin_real" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label={t('obras.form.fin_real')}
                InputLabelProps={{ shrink: true }}
                error={!!errors.fecha_fin_real}
                helperText={errors.fecha_fin_real?.message ?? ''}
              />
            )} />
          </Grid>

        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? t('obras.form.guardando') : t('obras.form.guardar')}
          </Button>
        </Stack>
      </Box>

      <MapPickerModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={handleMapConfirm}
        initialLatitud={latNum}
        initialLongitud={lngNum}
        initialDireccion={ubicacionWatch ?? ''}
      />
    </Paper>
  );
}