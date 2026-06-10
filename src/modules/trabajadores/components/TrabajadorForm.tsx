
import { useEffect, useState } from 'react';
import {
  Box, Button, Divider, Grid, InputAdornment, MenuItem,
  Paper, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { Search, Lock, User } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { trabajadorSchema, type TrabajadorSchemaValues } from '../schemas/trabajador.schema';
import type { EspecialidadOption, Trabajador, TrabajadorFormValues } from '../types/trabajador.types';
import { useEstadosGenerales } from '../hooks/useEspecialidades';
import { useTrabajadoresList } from '../hooks/useTrabajadores';

interface TrabajadorFormProps {
  initialData?: Trabajador | null;
  especialidades: EspecialidadOption[];
  onSubmit: (values: TrabajadorFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

function toDateInput(value?: string | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

function toFormDefaults(initialData?: Trabajador | null): TrabajadorFormValues {
  return {
    nombre: initialData?.nombre ?? '',
    apellido: initialData?.apellido ?? '',
    dni: initialData?.dni ?? '',
    email: initialData?.email ?? '',
    password: '',
    telefono: initialData?.telefono ?? '',
    fecha_ingreso: toDateInput(initialData?.fecha_ingreso),
    especialidad_id: initialData?.especialidad_id ?? '',
    estado_id: initialData?.estado_id ?? '',
    jefe_id: initialData?.jefe_id ?? '',
    usuario_creador_id: initialData?.usuario_creador_id ?? 2,
    razon_social: initialData?.razon_social ?? '',
    cuit: initialData?.cuit ?? '',
    condicion_iva: initialData?.condicion_iva ?? '',
    direccion_fiscal: initialData?.direccion_fiscal ?? '',
    cbu: initialData?.cbu ?? '',
    alias_cbu: initialData?.alias_cbu ?? '',
  };
}

function useSelectSearch(items: { id: number; label: string }[]) {
  const [query, setQuery] = useState('');
  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  return { query, setQuery, filtered };
}

export function TrabajadorForm({ initialData, especialidades, onSubmit, isSubmitting = false }: TrabajadorFormProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isEdit = Boolean(initialData && initialData.id);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<TrabajadorSchemaValues>({
    resolver: zodResolver(trabajadorSchema),
    defaultValues: toFormDefaults(initialData),
  });

  const especialidadSeleccionada = watch('especialidad_id');
  const { data: estados = [] } = useEstadosGenerales();
  const { data: trabajadores = [] } = useTrabajadoresList();

  const especialidadesSearch = useSelectSearch(especialidades.map((e) => ({ id: e.id, label: e.nombre })));
  const estadosSearch = useSelectSearch(estados.map((e) => ({ id: e.id, label: e.nombre })));

  const jefesDisponibles = trabajadores.filter(
    (t) => t.especialidad_id === especialidadSeleccionada && t.jefe_id === null
  );

  const jefesSearch = useSelectSearch(
    jefesDisponibles.map((t: any) => ({ id: t.id, label: `${t.nombre} ${t.apellido}` }))
  );

  useEffect(() => {
    if (especialidades.length > 0) {
      reset(toFormDefaults(initialData));
    }
  }, [initialData, especialidades, reset]);

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as TrabajadorFormValues))}>

        {/* DATOS PERSONALES */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary', letterSpacing: 1 }}>
          {t('trabajador_form.datos_personales')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('trabajador_form.nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="apellido" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('trabajador_form.apellido')} error={!!errors.apellido} helperText={errors.apellido?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="dni" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('trabajador_form.dni')} error={!!errors.dni} helperText={errors.dni?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="telefono" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('trabajador_form.telefono')} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_ingreso" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label={t('trabajador_form.fecha_ingreso')} InputLabelProps={{ shrink: true }} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="especialidad_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label={t('trabajador_form.especialidad')}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.especialidad_id} helperText={errors.especialidad_id?.message}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                <Box sx={{ px: 1.5, py: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  <TextField
                    size="small" fullWidth placeholder={t('trabajador_form.buscar')}
                    value={especialidadesSearch.query}
                    onChange={(e) => { e.stopPropagation(); especialidadesSearch.setQuery(e.target.value); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
                  />
                </Box>
                <MenuItem value="">{t('trabajador_form.sin_especificar')}</MenuItem>
                {especialidadesSearch.filtered.map((e) => <MenuItem key={e.id} value={e.id}>{e.label}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="estado_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label={t('trabajador_form.estado')}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                <Box sx={{ px: 1.5, py: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  <TextField
                    size="small" fullWidth placeholder={t('trabajador_form.buscar')}
                    value={estadosSearch.query}
                    onChange={(e) => { e.stopPropagation(); estadosSearch.setQuery(e.target.value); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
                  />
                </Box>
                <MenuItem value="">{t('trabajador_form.seleccionar')}</MenuItem>
                {estadosSearch.filtered.map((e) => <MenuItem key={e.id} value={e.id}>{e.label}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="jefe_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label={t('trabajador_form.jefe')}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                <Box sx={{ px: 1.5, py: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  <TextField
                    size="small" fullWidth placeholder={t('trabajador_form.buscar_trabajador')}
                    value={jefesSearch.query}
                    onChange={(e) => { e.stopPropagation(); jefesSearch.setQuery(e.target.value); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
                  />
                </Box>
                <MenuItem value="">{t('trabajador_form.sin_jefe')}</MenuItem>
                {jefesSearch.filtered.map((t) => <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* DATOS DE FACTURACIÓN */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary', letterSpacing: 1 }}>
          {t('trabajador_form.datos_facturacion')}{' '}
          <Typography component="span" variant="caption" sx={{ color: 'text.disabled', fontWeight: 400, ml: 1 }}>
            {t('trabajador_form.opcionales')}
          </Typography>
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="razon_social" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('trabajador_form.razon_social')} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="cuit" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('trabajador_form.cuit')} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="condicion_iva" control={control} render={({ field }) => (
              <TextField select fullWidth label={t('trabajador_form.condicion_iva')} value={field.value} onChange={field.onChange}>
                <MenuItem value="">{t('trabajador_form.sin_especificar')}</MenuItem>
                <MenuItem value="monotributista">{t('trabajador_form.iva.monotributista')}</MenuItem>
                <MenuItem value="responsable_inscripto">{t('trabajador_form.iva.responsable_inscripto')}</MenuItem>
                <MenuItem value="exento">{t('trabajador_form.iva.exento')}</MenuItem>
                <MenuItem value="consumidor_final">{t('trabajador_form.iva.consumidor_final')}</MenuItem>
              </TextField>
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="direccion_fiscal" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('trabajador_form.direccion_fiscal')} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="cbu" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('trabajador_form.cbu')} inputProps={{ maxLength: 22 }} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="alias_cbu" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('trabajador_form.alias_cbu')} />
            )} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* DATOS DE ACCESO */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary', letterSpacing: 1 }}>
          {t('trabajador_form.datos_acceso')}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField
                {...field} fullWidth label={t('trabajador_form.email')}
                disabled={isEdit}
                InputLabelProps={{ shrink: true }}
                slotProps={{
                  input: {
                    readOnly: isEdit,
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={18} color={isEdit ? theme.palette.primary.main : theme.palette.text.secondary} style={{ opacity: isEdit ? 0.8 : 1 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      "&.Mui-disabled": {
                        bgcolor: 'background.paper',
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.divider,
                          borderStyle: 'dashed',
                        },
                      },
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: theme.palette.text.disabled,
                        cursor: 'default',
                      }
                    }
                  }
                }}
              />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="password" control={control} render={({ field }) => (
              <TextField
                {...field} fullWidth label={t('trabajador_form.password')}
                type="password"
                value={isEdit ? "********" : field.value}
                disabled={isEdit}
                InputLabelProps={{ shrink: true }}
                slotProps={{
                  input: {
                    readOnly: isEdit,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={16} color={theme.palette.primary.main} opacity={0.6} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      "&.Mui-disabled": {
                        bgcolor: 'background.paper',
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.divider,
                          borderStyle: 'dashed',
                        },
                      },
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: theme.palette.text.disabled,
                        cursor: 'default',
                      }
                    }
                  }
                }}
              />
            )} />
          </Grid>
        </Grid>

        {isEdit && (
          <Box sx={{
            mt: 3, p: 2,
            bgcolor: 'rgba(170,59,255,0.05)',
            borderRadius: 2,
            border: `1px dashed ${theme.palette.primary.light}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Lock size={14} color={theme.palette.primary.main} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {t('trabajador_form.credenciales_aviso')}
            </Typography>
          </Box>
        )}

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}
            sx={{ borderRadius: 2, px: 6, py: 1.5, fontWeight: 700 }}>
            {isSubmitting ? t('trabajador_form.guardando') : isEdit ? t('trabajador_form.actualizar') : t('trabajador_form.registrar')}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}