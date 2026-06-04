

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Grid, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { Plus, Eye, Pencil, Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { useClientesList } from '../hooks/useClientes';
import { ClienteEstadoChip } from '../components/ClienteEstadoChip';

export const ClientesListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: clientes = [], isLoading, isError, refetch } = useClientesList();

  if (isLoading) return <LoadingState message={t('clientes.loading')} />;
  if (isError) return <ErrorState title="Error" message={t('clientes.error')} onRetry={refetch} />;

  return (
    <AppLayout>
      <PageHeader
        title={t('clientes.title')}
        subtitle={t('clientes.subtitle', { count: clientes.length })}
        actions={
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/clientes/crear')}>
            {t('clientes.nuevo')}
          </Button>
        }
      />

      {clientes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">{t('clientes.empty.title')}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/clientes/crear')}>
            {t('clientes.empty.crear')}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {clientes.map((cliente) => (
            <Grid key={cliente.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {cliente.nombre} {cliente.apellido}
                      </Typography>
                      <ClienteEstadoChip estadoId={cliente.estado_id} />
                      {cliente.razon_social && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{cliente.razon_social}</Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                    // Ver cliente
                      <IconButton size="small" onClick={() => navigate(`/clientes/${cliente.id}`, {
                        state: { breadcrumbLabel: cliente.razon_social ?? `${cliente.nombre}${cliente.apellido ? ` ${cliente.apellido}` : ''}` }
                      })}>
                        <Eye size={16} />
                      </IconButton>

                  // Editar cliente
                      <IconButton size="small" onClick={() => navigate(`/clientes/${cliente.id}/editar`, {
                        state: { breadcrumbLabel: cliente.razon_social ?? `${cliente.nombre}${cliente.apellido ? ` ${cliente.apellido}` : ''}` }
                      })}>
                        <Pencil size={16} />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    {cliente.telefono && (
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Phone size={14} color={theme.palette.text.disabled} />
                        <Typography variant="body2" color="text.secondary">{cliente.telefono}</Typography>
                      </Stack>
                    )}
                    {cliente.email && (
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Mail size={14} color={theme.palette.text.disabled} />
                        <Typography variant="body2" color="text.secondary">{cliente.email}</Typography>
                      </Stack>
                    )}
                    {cliente.direccion && (
                      <Stack direction="row" alignItems="center" gap={1}>
                        <MapPin size={14} color={theme.palette.text.disabled} />
                        <Typography variant="body2" color="text.secondary">{cliente.direccion}</Typography>
                      </Stack>
                    )}
                    {cliente.dni_cuit && (
                      <Chip
                        label={`DNI/CUIT: ${cliente.dni_cuit}`}
                        size="small"
                        sx={{ width: 'fit-content', bgcolor: theme.palette.action.hover }}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </AppLayout>
  );
};