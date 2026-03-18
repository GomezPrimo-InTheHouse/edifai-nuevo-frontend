import { useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { obraSchema, type ObraSchemaValues } from '../schemas/obra.schema';
import type {
  EstadoOption,
  Obra,
  ObraFormValues,
  TipoObraOption,
} from '../types/obra.types';

interface ObraFormProps {
  initialData?: Obra | null;
  tiposObra: TipoObraOption[];
  estados: EstadoOption[];
  onSubmit: (values: ObraFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

function toFormDefaults(initialData?: Obra | null): ObraFormValues {
  return {
    nombre: initialData?.nombre ?? '',
    descripcion: initialData?.descripcion ?? '',
    ubicacion: initialData?.ubicacion ?? '',
    tipo_obra_id: initialData?.tipo_obra_id ?? '',
    estado_id: initialData?.estado_id ?? '',
    fecha_inicio_estimado: initialData?.fecha_inicio_estimado ?? '',
    fecha_fin_estimado: initialData?.fecha_fin_estimado ?? '',
    fecha_inicio_real: initialData?.fecha_inicio_real ?? '',
    fecha_fin_real: initialData?.fecha_fin_real ?? '',
    usuario_creador_id: initialData?.usuario_creador_id ?? 1,
  };
}

export function ObraForm({
  initialData,
  tiposObra,
  estados,
  onSubmit,
  isSubmitting = false,
}: ObraFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ObraSchemaValues>({
    resolver: zodResolver(obraSchema),
    defaultValues: toFormDefaults(initialData),
  });

  useEffect(() => {
    reset(toFormDefaults(initialData));
  }, [initialData, reset]);

  const handleFormSubmit = (values: ObraSchemaValues) => {
    onSubmit(values as ObraFormValues);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nombre de la obra"
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message ?? ''}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="ubicacion"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Ubicación"
                  error={!!errors.ubicacion}
                  helperText={errors.ubicacion?.message ?? ''}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={4}
                  label="Descripción"
                  error={!!errors.descripcion}
                  helperText={errors.descripcion?.message ?? ''}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="tipo_obra_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Tipo de obra"
                  value={field.value}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === '' ? '' : Number(value));
                  }}
                  error={!!errors.tipo_obra_id}
                  helperText={errors.tipo_obra_id?.message ?? ''}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  {(Array.isArray(tiposObra) ? tiposObra : []).map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="estado_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Estado"
                  value={field.value}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === '' ? '' : Number(value));
                  }}
                  error={!!errors.estado_id}
                  helperText={errors.estado_id?.message ?? ''}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  {(Array.isArray(estados) ? estados : []).map((estado) => (
                   
                    <MenuItem key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="fecha_inicio_estimado"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Inicio estimado"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="fecha_fin_estimado"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Fin estimado"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="fecha_inicio_real"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Inicio real"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="fecha_fin_real"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Fin real"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar obra'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}