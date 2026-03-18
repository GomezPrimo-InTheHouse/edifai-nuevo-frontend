import { useEffect } from 'react';
import { Box, Button, Grid, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trabajadorSchema, type TrabajadorSchemaValues } from '../schemas/trabajador.schema';
import type { EspecialidadOption, Trabajador, TrabajadorFormValues } from '../types/trabajador.types';
import { useEstadosGenerales } from '../hooks/useEspecialidades';

interface TrabajadorFormProps {
  initialData?: Trabajador | null;
  especialidades: EspecialidadOption[];
  onSubmit: (values: TrabajadorFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

// Convierte fecha ISO → "yyyy-MM-dd" para input type="date"
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
    telefono: initialData?.telefono ?? '',
    fecha_ingreso: toDateInput(initialData?.fecha_ingreso),
    especialidad_id: initialData?.especialidad_id ?? '',
    estado_id: initialData?.estado_id ?? '',
    usuario_creador_id: initialData?.usuario_creador_id ?? 2,
  };
}

export function TrabajadorForm({ initialData, especialidades, onSubmit, isSubmitting = false }: TrabajadorFormProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TrabajadorSchemaValues>({
    resolver: zodResolver(trabajadorSchema),
    defaultValues: toFormDefaults(initialData),
  });

  // Carga estados generales para el select
  const { data: estados = [] } = useEstadosGenerales();

  // Re-inicializa cuando llegan datos o especialidades
  useEffect(() => {
    if (especialidades.length > 0) {
      reset(toFormDefaults(initialData));
    }
  }, [initialData, especialidades, reset]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as TrabajadorFormValues))}>
        <Grid container spacing={2}>
          {/* Nombre */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nombre" error={!!errors.nombre} helperText={errors.nombre?.message ?? ''} />
            )} />
          </Grid>

          {/* Apellido */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="apellido" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Apellido" error={!!errors.apellido} helperText={errors.apellido?.message ?? ''} />
            )} />
          </Grid>

          {/* DNI */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="dni" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="DNI" error={!!errors.dni} helperText={errors.dni?.message ?? ''} />
            )} />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Email" type="email" error={!!errors.email} helperText={errors.email?.message ?? ''} />
            )} />
          </Grid>

          {/* Teléfono */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="telefono" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Teléfono" error={!!errors.telefono} helperText={errors.telefono?.message ?? ''} />
            )} />
          </Grid>

          {/* Fecha de ingreso */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_ingreso" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label="Fecha de ingreso" InputLabelProps={{ shrink: true }} />
            )} />
          </Grid>

          {/* Especialidad */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="especialidad_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Especialidad"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.especialidad_id} helperText={errors.especialidad_id?.message ?? ''}
              >
                <MenuItem value="">Seleccionar</MenuItem>
                {especialidades.map((esp) => (
                  <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>
                ))}
              </TextField>
            )} />
          </Grid>

          {/* Estado */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="estado_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Estado"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.estado_id} helperText={errors.estado_id?.message ?? ''}
              >
                <MenuItem value="">Seleccionar</MenuItem>
                {estados.map((estado) => (
                  <MenuItem key={estado.id} value={estado.id}>{estado.nombre}</MenuItem>
                ))}
              </TextField>
            )} />
          </Grid>
        </Grid>

        {/* Botón de envío */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar trabajador'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}