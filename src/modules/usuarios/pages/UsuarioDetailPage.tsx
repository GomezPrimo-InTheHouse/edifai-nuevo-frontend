import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider, Grid, Stack, Typography,
} from '@mui/material';
import { ArrowLeft, Key, Mail, Pencil, Shield, User } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { UsuarioEstadoChip } from '../components/UsuarioEstadoChip';
import { CambiarPasswordModal } from '../components/CambiarPasswordModal';
import { useDarDeBajaUsuario, useUsuarioDetail } from '../hooks/useUsuarios';
import { useNotify } from '../../../shared/hooks/useNotify';

function formatDate(v?: string | null) {
  if (!v) return '-';
  return new Date(v).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ color: '#94A3B8', mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

export const UsuarioDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const usuarioId = Number(id);
  const notify = useNotify();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const { data: usuario, isLoading, isError, refetch } = useUsuarioDetail(usuarioId);
  const darDeBajaMutation = useDarDeBajaUsuario();

  if (isLoading) return <LoadingState message="Cargando usuario..." />;
  if (isError) return <ErrorState title="Error" message="No se pudo cargar el usuario." onRetry={refetch} />;
  if (!usuario) return <ErrorState title="No encontrado" message="El usuario no existe." />;

  const handleDarDeBaja = async () => {
    const confirmed = await notify.confirm({
      title: '¿Dar de baja este usuario?',
      message: 'El usuario perderá acceso al sistema.',
      confirmLabel: 'Dar de baja',
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await darDeBajaMutation.mutateAsync(usuarioId);
      notify.success('Usuario dado de baja.');
      navigate('/usuarios');
    } catch {
      notify.error('No se pudo dar de baja.');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={usuario.nombre}
        subtitle="Vista detallada del usuario."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/usuarios')}>Volver</Button>
            <Button variant="outlined" startIcon={<Key size={16} />} onClick={() => setPasswordModalOpen(true)}>Cambiar contraseña</Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}>Editar</Button>
            <Button variant="outlined" color="error" onClick={handleDarDeBaja} disabled={darDeBajaMutation.isPending}>Dar de baja</Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Información del usuario</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <DetailRow icon={<User size={16} />} label="Nombre" value={usuario.nombre} />
                <DetailRow icon={<Mail size={16} />} label="Email" value={usuario.email} />
                <DetailRow icon={<Shield size={16} />} label="Rol" value={usuario.rol_nombre ?? '-'} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Estado</Typography>
              <Divider sx={{ mb: 3 }} />
              <UsuarioEstadoChip estado={usuario.estado_nombre} />
              <Divider sx={{ my: 3 }} />
              <Stack spacing={2}>
                <DetailRow icon={<User size={16} />} label="Creado" value={formatDate(usuario.created_at)} />
                <DetailRow icon={<User size={16} />} label="Actualizado" value={formatDate(usuario.updated_at)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CambiarPasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} usuarioId={usuarioId} />
    </AppLayout>
  );
};