import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { ArrowLeft, Mail, MapPin, Pencil, Phone, Building } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { useClienteDetail } from '../hooks/useClientes';
import { ClienteEstadoChip } from '../components/ClienteEstadoChip';


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

export const ClienteDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clienteId = Number(id);
  const { data: cliente, isLoading, isError, refetch } = useClienteDetail(clienteId);

  if (isLoading) return <LoadingState message="Cargando cliente..." />;
  if (isError) return <ErrorState title="Error" message="No se pudo cargar el cliente." onRetry={refetch} />;
  if (!cliente) return <ErrorState title="No encontrado" message="El cliente no existe." />;

  return (
    <AppLayout>
<PageHeader
  title={`${cliente.nombre}${cliente.apellido ? ` ${cliente.apellido}` : ''}`}
  subtitle={
    <Stack direction="row" alignItems="center" gap={1}>
      <Typography variant="body2" color="text.secondary">{cliente.razon_social ?? 'Cliente'}</Typography>
      <ClienteEstadoChip estadoId={cliente.estado_id} />
    </Stack>
  }
  actions={
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/clientes')}>Volver</Button>
      <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/clientes/${clienteId}/editar`)}>Editar</Button>
    </Stack>
  }
/>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Información del cliente</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                {cliente.telefono && <DetailRow icon={<Phone size={16} />} label="Teléfono" value={cliente.telefono} />}
                {cliente.email && <DetailRow icon={<Mail size={16} />} label="Email" value={cliente.email} />}
                {cliente.direccion && <DetailRow icon={<MapPin size={16} />} label="Dirección" value={cliente.direccion} />}
                {cliente.razon_social && <DetailRow icon={<Building size={16} />} label="Razón social" value={cliente.razon_social} />}
                {cliente.dni_cuit && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>DNI / CUIT</Typography>
                    <Chip label={cliente.dni_cuit} size="small" sx={{ bgcolor: '#F1F5F9', mt: 0.5 }} />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Obras asociadas</Typography>
              <Divider sx={{ mb: 2 }} />
              {(!cliente.obras || cliente.obras.length === 0) ? (
                <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', py: 2 }}>
                  Sin obras asociadas
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {cliente.obras.map((obra: any) => (
                    <Box
                      key={obra.id}
                      onClick={() => navigate(`/obras/${obra.id}`)}
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', '&:hover': { bgcolor: '#F1F5F9' } }}
                    >
                      <Typography variant="body2" fontWeight={600}>{obra.nombre}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};