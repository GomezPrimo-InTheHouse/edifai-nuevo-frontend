import { useEffect, useState } from 'react';
import {
  Box, Button, Divider, Grid, InputAdornment, MenuItem,
  Paper, Stack, TextField, Typography,
} from '@mui/material';
import { Search, Lock, User } from 'lucide-react';
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

function useSelectSearch(items: { id: number; label: string }[]) {
  const [query, setQuery] = useState('');
  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  return { query, setQuery, filtered };
}

export function TrabajadorForm({ initialData, especialidades, onSubmit, isSubmitting = false }: TrabajadorFormProps) {
  // 1. Variable isEdit: detecta si hay datos iniciales para bloquear campos
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
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid var(--border)', boxShadow: 'none' }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as TrabajadorFormValues))}>

        {/* SECCIÓN: DATOS PERSONALES */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B', letterSpacing: 1 }}>
          DATOS PERSONALES
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nombre" error={!!errors.nombre} helperText={errors.nombre?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="apellido" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Apellido" error={!!errors.apellido} helperText={errors.apellido?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="dni" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="DNI" error={!!errors.dni} helperText={errors.dni?.message} />
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

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="especialidad_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Especialidad"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.especialidad_id} helperText={errors.especialidad_id?.message}
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

        <Divider sx={{ my: 4 }} />

                {/* SECCIÓN: DATOS PERSONALES */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B', letterSpacing: 1 }}>
          DATOS ACCESO AL SISTEMA
        </Typography>

        <Grid container spacing={3}>
          {/* Campo: Correo Electrónico */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Correo Electrónico"
                  disabled={isEdit}
                  InputLabelProps={{ shrink: true }}
                  slotProps={{
                    input: {
                      readOnly: isEdit,
                      startAdornment: (
              <InputAdornment position="start">
                <User size={18} color={isEdit ? "var(--accent)" : "#64748B"} style={{ opacity: isEdit ? 0.8 : 1 }} />
              </InputAdornment>
            ),
                      
                      sx: {
                        borderRadius: 2,
                        // 1. Fondo blanco puro
                        bgcolor: '#ffffff',
                        // 2. Quitamos la opacidad y el gris de 'disabled'
                        "&.Mui-disabled": {
                          bgcolor: '#ffffff',
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: 'var(--border)', // Mantiene el color del borde normal
                            borderStyle: 'dashed', // Opcional: un toque visual de "no editable"
                          },
                        },
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: '#8a8888', // Texto en negro/oscuro legible
                          cursor: 'default',
                        }
                      }
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* Campo: Contraseña */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Contraseña"
                  type="password"
                  value={isEdit ? "********" : field.value}
                  disabled={isEdit}
                  InputLabelProps={{ shrink: true }}
                  slotProps={{
                    input: {
                      readOnly: isEdit,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={16} color="var(--accent)" opacity={0.6} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        bgcolor: '#ffffff',
                        "&.Mui-disabled": {
                          bgcolor: '#ffffff',
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: 'var(--border)',
                            borderStyle: 'dashed',
                          },
                        },
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: '#8a8888',
                          cursor: 'default',
                        }
                      }
                    }
                  }}
                />
              )}
            />
            
          </Grid>
          
        </Grid>
        {isEdit && (
  <Box sx={{ 
    mt: 3, 
    p: 2, 
    bgcolor: 'rgba(170, 59, 255, 0.05)', 
    borderRadius: 2, 
    border: '1px dashed var(--accent-border)',
    display: 'flex',
    alignItems: 'center',
    gap: 1.5
  }}>
    <Lock size={14} color="#aa3bff" />
    <Typography variant="caption" sx={{ color: 'var(--accent)', fontWeight: 600 }}>
      Próximamente podrás gestionar credenciales desde el módulo de Usuarios.
    </Typography>
  </Box>
)}
        



        {/* BOTONES DE ACCIÓN */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ borderRadius: 2, px: 6, py: 1.5, fontWeight: 700 }}
          >
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar Trabajador' : 'Registrar Trabajador'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}