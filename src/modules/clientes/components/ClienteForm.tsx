import { Box, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema, type ClienteSchemaValues } from '../schemas/cliente.schema';
import type { Cliente, ClienteFormValues } from '../types/cliente.types';

interface Props {
  initialData?: Cliente | null;
  onSubmit: (values: ClienteFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

function toFormDefaults(initialData?: Cliente | null): ClienteFormValues {
  return {
    nombre:       initialData?.nombre       ?? '',
    apellido:     initialData?.apellido     ?? '',
    razon_social: initialData?.razon_social ?? '',
    dni_cuit:     initialData?.dni_cuit     ?? '',
    telefono:     initialData?.telefono     ?? '',
    direccion:    initialData?.direccion    ?? '',
    email:        initialData?.email        ?? '',
  };
}

export function ClienteForm({ initialData, onSubmit, isSubmitting = false, isEdit = false }: Props) {
  const { control, handleSubmit, formState: { errors } } = useForm<ClienteSchemaValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: toFormDefaults(initialData),
  });

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as ClienteFormValues))}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
          DATOS DEL CLIENTE
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nombre *"
                error={!!errors.nombre} helperText={errors.nombre?.message ?? ''} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="apellido" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Apellido" />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="razon_social" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Razón social" />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="dni_cuit" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="DNI / CUIT" />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="telefono" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Teléfono *"
                error={!!errors.telefono} helperText={errors.telefono?.message ?? ''} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Email" type="email"
                error={!!errors.email} helperText={errors.email?.message ?? ''} />
            )} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller name="direccion" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Dirección" />
            )} />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar cliente' : 'Crear cliente'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}