import { useEffect } from 'react';
import { Box, Button, Grid, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { laborSchema, type LaborSchemaValues } from '../schemas/labor.schema';
import type { Labor, LaborFormValues } from '../types/labor.types';
import { useObrasList } from '../../obras/hooks/useObras';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useEspecialidadesList, useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';

interface LaborFormProps {
  initialData?: Labor | null;
  obraIdFijo?: number; // si viene desde el detalle de una obra
  onSubmit: (values: LaborFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

function toDateInput(value?: string | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

function toFormDefaults(initialData?: Labor | null, obraIdFijo?: number): LaborFormValues {
  return {
    nombre: initialData?.nombre ?? '',
    descripcion: initialData?.descripcion ?? '',
    obra_id: initialData?.obra_id ?? obraIdFijo ?? '',
    trabajador_id: initialData?.trabajador_id ?? '',
    especialidad_id: initialData?.especialidad_id ?? '',
    estado_id: initialData?.estado_id ?? '',
    fecha_inicio_estimada: toDateInput(initialData?.fecha_inicio_estimada),
    fecha_fin_estimada: toDateInput(initialData?.fecha_fin_estimada),
    fecha_inicio_real: toDateInput(initialData?.fecha_inicio_real),
    fecha_fin_real: toDateInput(initialData?.fecha_fin_real),
    usuario_creador_id: initialData?.usuario_creador_id ?? 2,
  };
}

export function LaborForm({ initialData, obraIdFijo, onSubmit, isSubmitting = false }: LaborFormProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<LaborSchemaValues>({
    resolver: zodResolver(laborSchema),
    defaultValues: toFormDefaults(initialData, obraIdFijo),
  });

  const { data: obras = [] } = useObrasList();
  const { data: todosLosTrabajadores = [] } = useTrabajadoresList();

// Solo jefes — trabajadores sin jefe asignado
const trabajadores = todosLosTrabajadores.filter((t) => t.jefe_id === null);
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: estados = [] } = useEstadosGenerales();

  // Re-inicializa cuando cargan los datos y las opciones
  useEffect(() => {
    if (obras.length > 0) {
      reset(toFormDefaults(initialData, obraIdFijo));
    }
  }, [initialData, obras, reset, obraIdFijo]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as LaborFormValues))}>
        <Grid container spacing={2}>
          {/* Nombre */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nombre de la labor" error={!!errors.nombre} helperText={errors.nombre?.message ?? ''} />
            )} />
          </Grid>

          {/* Obra — deshabilitado si viene fijo */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="obra_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Obra"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={!!obraIdFijo}
                error={!!errors.obra_id} helperText={errors.obra_id?.message ?? ''}
              >
                <MenuItem value="">Seleccionar</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          {/* Descripción */}
          <Grid size={{ xs: 12 }}>
            <Controller name="descripcion" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Descripción" />
            )} />
          </Grid>

          {/* Trabajador */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="trabajador_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Trabajador asignado"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <MenuItem value="">Sin asignar</MenuItem>
                {trabajadores.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.nombre} {t.apellido}</MenuItem>
                ))}
              </TextField>
            )} />
          </Grid>

          {/* Especialidad */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="especialidad_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Especialidad requerida"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <MenuItem value="">Sin especificar</MenuItem>
                {especialidades.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
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
              >
                <MenuItem value="">Seleccionar</MenuItem>
                {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          {/* Fechas estimadas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_inicio_estimada" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label="Inicio estimado" InputLabelProps={{ shrink: true }} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_fin_estimada" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label="Fin estimado" InputLabelProps={{ shrink: true }} />
            )} />
          </Grid>

          {/* Fechas reales — solo en edición */}
          {initialData && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="fecha_inicio_real" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth type="date" label="Inicio real" InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="fecha_fin_real" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth type="date" label="Fin real" InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
            </>
          )}
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar labor'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}