import { useEffect } from 'react';
import { Box, Button, Grid, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { presupuestoSchema, type PresupuestoSchemaValues } from '../schemas/presupuesto.schema';
import type { Presupuesto, PresupuestoFormValues } from '../types/presupuesto.types';
import { useLaboresList } from '../../labores/hooks/useLabores';
import { useObrasList } from '../../obras/hooks/useObras';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';

interface Props {
  initialData?: Presupuesto | null;
  onSubmit: (values: PresupuestoFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

function toFormDefaults(initialData?: Presupuesto | null): PresupuestoFormValues {
  return {
    nombre: initialData?.nombre ?? '',
    descripcion: initialData?.descripcion ?? '',
    labor_id: initialData?.labor_id ?? '',
    obra_id: initialData?.obra_id ?? '',
    estado_id: initialData?.estado_id ?? '',
    costo_mano_obra: initialData?.costo_mano_obra ?? '',
  };
}

export function PresupuestoForm({ initialData, onSubmit, isSubmitting = false }: Props) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<PresupuestoSchemaValues>({
    resolver: zodResolver(presupuestoSchema),
    defaultValues: toFormDefaults(initialData),
  });

  const { data: labores = [] } = useLaboresList();
  const { data: obras = [] } = useObrasList();
  const { data: todosEstados = [] } = useEstadosGenerales();
  const estados = todosEstados.filter((e) => e.ambito === 'presupuesto');

  useEffect(() => {
    reset(toFormDefaults(initialData));
  }, [initialData, reset]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as unknown as PresupuestoFormValues))}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
          INFORMACIÓN DEL PRESUPUESTO
        </Typography>
        <Grid container spacing={2}>
          {/* Nombre */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nombre del presupuesto" />
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

          {/* Descripción */}
          <Grid size={{ xs: 12 }}>
            <Controller name="descripcion" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Descripción" />
            )} />
          </Grid>

          {/* Labor — obligatoria */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="labor_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Labor asociada *"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.labor_id} helperText={errors.labor_id?.message ?? ''}
              >
                <MenuItem value="">Seleccionar labor</MenuItem>
                {labores.map((l) => <MenuItem key={l.id} value={l.id}>{l.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          {/* Obra — opcional */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="obra_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Obra asociada (opcional)"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <MenuItem value="">Sin obra específica</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          {/* Costo mano de obra */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="costo_mano_obra" control={control} render={({ field }) => (
              <TextField
                {...field}
                fullWidth type="number"
                label="Costo mano de obra ($)"
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            )} />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar presupuesto'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}