

import { Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography, Alert } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioEditSchema, usuarioSchema, type UsuarioEditSchemaValues, type UsuarioSchemaValues } from '../schemas/usuario.schema';
import type { Usuario, UsuarioFormValues } from '../types/usuario.types';
import { usuarioApi } from '../../../services/api/usuario.api';

interface Props {
  initialData?: Usuario | null;
  onSubmit: (values: UsuarioFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

// const ROLES: any[] = await usuarioApi.getRolesUsuarios();

const ROLES_ADMIN = [1, 3, 6]; // administrador, técnico, asistente
const ALL_ROLES: any[] = await usuarioApi.getRolesUsuarios();
const ROLES = ALL_ROLES.filter((r) => ROLES_ADMIN.includes(r.id));

// Roles que corresponden a trabajadores
const ROLES_TRABAJADOR = [7, 8];

function toFormDefaults(initialData?: Usuario | null): UsuarioFormValues {
  return {
    nombre: initialData?.nombre ?? '',
    email:  initialData?.email  ?? '',
    password: '',
    rol_id: initialData?.rol_id ?? '',
    usuario_creador_id: initialData?.usuario_creador_id ?? null,
  };
}

export function UsuarioForm({ initialData, onSubmit, isSubmitting = false, isEdit = false }: Props) {

  // Si es edición y el rol es trabajador, modo restringido
  const esTrabajador = isEdit && ROLES_TRABAJADOR.includes(Number(initialData?.rol_id));

  const { control, handleSubmit, formState: { errors } } = useForm<UsuarioSchemaValues | UsuarioEditSchemaValues>({
    resolver: zodResolver(isEdit ? usuarioEditSchema : usuarioSchema) as any,
    defaultValues: initialData ? {
      nombre:   initialData.nombre,
      email:    initialData.email,
      rol_id:   initialData.rol_id as any,
      password: '',
    } : {
      nombre: '', email: '', password: '', rol_id: '',
    },
  });

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as unknown as UsuarioFormValues))}>

        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
          DATOS DEL USUARIO
        </Typography>

        {/* Aviso para usuarios trabajadores */}
        {esTrabajador && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Este usuario es un <strong>trabajador</strong>. Solo podés modificar su email y contraseña de acceso.
            Para editar nombre, apellido y especialidad, hacelo desde el módulo de <strong>Trabajadores</strong>.
          </Alert>
        )}

        <Grid container spacing={2}>

          {/* Nombre — solo visible si NO es trabajador */}
          {!esTrabajador && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller name="nombre" control={control} render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nombre"
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message ?? ''}
                />
              )} />
            </Grid>
          )}

          {/* Email — siempre visible */}
          <Grid size={{ xs: 12, md: esTrabajador ? 12 : 6 }}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message ?? ''}
              />
            )} />
          </Grid>

          {/* Password — solo en creación o si es trabajador en edición */}
          {(!isEdit || esTrabajador) && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller name="password" control={control} render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={esTrabajador ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                  type="password"
                  error={!!(errors as any).password}
                  helperText={(errors as any).password?.message ?? ''}
                />
              )} />
            </Grid>
          )}

          {/* Rol — bloqueado si es trabajador en edición */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="rol_id" control={control} render={({ field }) => (
              <TextField
                select
                fullWidth
                label="Rol"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.rol_id}
                helperText={
                  esTrabajador
                    ? 'El rol de un trabajador no puede modificarse'
                    : (errors.rol_id?.message ?? '')
                }
                disabled={esTrabajador} // ← bloqueado para trabajadores
              >
                <MenuItem value="">Seleccionar</MenuItem>
                {ROLES.map((r) => <MenuItem key={r.id} value={r.id}>{r.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

        </Grid>

        {/* Aviso TOTP solo en creación */}
        {!isEdit && (
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Typography variant="caption" sx={{ color: '#B45309' }}>
              ⚠️ Al crear el usuario se generará automáticamente un código QR para configurar la autenticación TOTP.
              Asegurate de que el usuario lo escanee antes de cerrar la ventana.
            </Typography>
          </Box>
        )}

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar usuario' : 'Crear usuario'}
          </Button>
        </Stack>

      </Box>
    </Paper>
  );
}