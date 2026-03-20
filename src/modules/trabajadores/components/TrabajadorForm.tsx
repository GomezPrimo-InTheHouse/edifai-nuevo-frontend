import { useEffect, useState } from 'react';
import {
  Box, Button, Divider, Grid, InputAdornment, MenuItem,
  Paper, Stack, TextField, Typography,
} from '@mui/material';
import { Search } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
    password: '',
    telefono: initialData?.telefono ?? '',
    fecha_ingreso: toDateInput(initialData?.fecha_ingreso),
    especialidad_id: initialData?.especialidad_id ?? '',
    estado_id: initialData?.estado_id ?? '',
    jefe_id: initialData?.jefe_id ?? '',
    usuario_creador_id: initialData?.usuario_creador_id ?? 2,
  };
}

// Hook interno para buscador dentro de un select
function useSelectSearch(items: { id: number; label: string }[]) {
  const [query, setQuery] = useState('');
  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  return { query, setQuery, filtered };
}

export function TrabajadorForm({ initialData, especialidades, onSubmit, isSubmitting = false }: TrabajadorFormProps) {
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<TrabajadorSchemaValues>({
    resolver: zodResolver(trabajadorSchema),
    defaultValues: toFormDefaults(initialData),
  });

  // Observá especialidad_id para ir filtrando jefes disponibles en el select de jefe_id
const especialidadSeleccionada = watch('especialidad_id');


  const { data: estados = [] } = useEstadosGenerales();
  const { data: trabajadores = [] } = useTrabajadoresList();

  // Buscadores por select
  const especialidadesSearch = useSelectSearch(especialidades.map((e) => ({ id: e.id, label: e.nombre })));
  const estadosSearch = useSelectSearch(estados.map((e) => ({ id: e.id, label: e.nombre })));
  
  // Filtrá trabajadores que tengan la misma especialidad Y sean jefes (jefe_id null)
  const jefesDisponibles = trabajadores.filter(
    (t) => t.especialidad_id === especialidadSeleccionada && t.jefe_id === null
  );
  // Actualizá el useSelectSearch de jefes:
  const jefesSearch = useSelectSearch(
    jefesDisponibles.map((t:any) => ({ id: t.id, label: `${t.nombre} ${t.apellido}` }))
  );
  // Re-inicializa cuando llegan datos o especialidades
  useEffect(() => {
    if (especialidades.length > 0) {
      reset(toFormDefaults(initialData));
    }
  }, [initialData, especialidades, reset]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as TrabajadorFormValues))}>

        {/* Sección — Datos personales */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
          DATOS PERSONALES
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nombre" error={!!errors.nombre} helperText={errors.nombre?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="apellido" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Apellido" error={!!errors.apellido} helperText={errors.apellido?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="dni" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="DNI" error={!!errors.dni} helperText={errors.dni?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="telefono" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Teléfono" />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_ingreso" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label="Fecha de ingreso" InputLabelProps={{ shrink: true }} />
            )} />
          </Grid>

          {/* Especialidad con buscador */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="especialidad_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Especialidad"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.especialidad_id} helperText={errors.especialidad_id?.message ?? ''}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                <Box sx={{ px: 1.5, py: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  <TextField
                    size="small" fullWidth placeholder="Buscar..."
                    value={especialidadesSearch.query}
                    onChange={(e) => { e.stopPropagation(); especialidadesSearch.setQuery(e.target.value); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
                  />
                </Box>
                <MenuItem value="">Sin especificar</MenuItem>
                {especialidadesSearch.filtered.map((e) => <MenuItem key={e.id} value={e.id}>{e.label}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          {/* Estado con buscador */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="estado_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Estado"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                <Box sx={{ px: 1.5, py: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  <TextField
                    size="small" fullWidth placeholder="Buscar..."
                    value={estadosSearch.query}
                    onChange={(e) => { e.stopPropagation(); estadosSearch.setQuery(e.target.value); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
                  />
                </Box>
                <MenuItem value="">Seleccionar</MenuItem>
                {estadosSearch.filtered.map((e) => <MenuItem key={e.id} value={e.id}>{e.label}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          {/* Jefe con buscador */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="jefe_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Jefe asignado"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                <Box sx={{ px: 1.5, py: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  <TextField
                    size="small" fullWidth placeholder="Buscar trabajador..."
                    value={jefesSearch.query}
                    onChange={(e) => { e.stopPropagation(); jefesSearch.setQuery(e.target.value); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
                  />
                </Box>
                <MenuItem value="">Sin jefe asignado</MenuItem>
                {jefesSearch.filtered.map((t) => <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Sección — Acceso al sistema */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, color: '#64748B' }}>
          ACCESO AL SISTEMA
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
          Estas credenciales permiten al trabajador iniciar sesión en EDIFAI.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Email" type="email" error={!!errors.email} helperText={errors.email?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="password" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Contraseña" type="password" error={!!errors.password} helperText={errors.password?.message ?? ''} />
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