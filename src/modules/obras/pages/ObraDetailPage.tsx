import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowLeft, Pencil, MapPin, FileText, Calendar, User } from 'lucide-react';

import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { useObraDetail, useEstadosObraOptions, useTiposObraOptions } from '../hooks/useObras';

// Convierte fecha ISO "2025-06-15T03:00:00.000Z" → "15/06/2025" para mostrar en pantalla
function formatDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Fila de detalle reutilizable
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ color: '#94A3B8', mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export const ObraDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const obraId = Number(id);

  const { data: obra, isLoading, isError, refetch } = useObraDetail(obraId);

  // Cargamos estados y tipos para mostrar nombres en lugar de IDs
  const { data: estados = [] } = useEstadosObraOptions();
  const { data: tiposObra = [] } = useTiposObraOptions();

  if (isLoading) return <LoadingState message="Cargando obra..." />;
  if (isError) return <ErrorState title="Error" message="No se pudo cargar la obra." onRetry={refetch} />;
  if (!obra) return <ErrorState title="Obra no encontrada" message="La obra solicitada no existe." />;

  // Resuelve nombre de estado y tipo de obra a partir del ID
  const estadoNombre = estados.find((e) => e.id === obra.estado_id)?.nombre ?? 'Sin estado';
  const tipoNombre = tiposObra.find((t) => t.id === obra.tipo_obra_id)?.nombre ?? 'Sin tipo';

  // Color del chip según el nombre del estado
  const estadoColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    'En proceso': 'success',
    'Pausada': 'warning',
    'Finalizada': 'default',
    'Cancelada': 'error',
  };
  const chipColor = estadoColor[estadoNombre] ?? 'default';

  return (
    <AppLayout>
      <PageHeader
        title={obra.nombre}
        subtitle="Vista detallada de la obra."
        actions={
          <Stack direction="row" spacing={1}>
            {/* Volver al listado */}
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/obras')}
            >
              Volver
            </Button>
            {/* Ir a editar */}
            <Button
              variant="contained"
              startIcon={<Pencil size={16} />}
              onClick={() => navigate(`/obras/${obra.id}/editar`)}
            >
              Editar obra
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Panel principal — información general */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Información general
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5}>
                <DetailRow
                  icon={<MapPin size={16} />}
                  label="Ubicación"
                  value={obra.ubicacion || '-'}
                />
                <DetailRow
                  icon={<FileText size={16} />}
                  label="Descripción"
                  value={obra.descripcion || '-'}
                />
                <DetailRow
                  icon={<User size={16} />}
                  label="Tipo de obra"
                  value={tipoNombre}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Fechas en grid 2x2 */}
              <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
                FECHAS
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <DetailRow
                    icon={<Calendar size={16} />}
                    label="Inicio estimado"
                    value={formatDate(obra.fecha_inicio_estimado)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <DetailRow
                    icon={<Calendar size={16} />}
                    label="Fin estimado"
                    value={formatDate(obra.fecha_fin_estimado)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <DetailRow
                    icon={<Calendar size={16} />}
                    label="Inicio real"
                    value={formatDate(obra.fecha_inicio_real)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <DetailRow
                    icon={<Calendar size={16} />}
                    label="Fin real"
                    value={formatDate(obra.fecha_fin_real)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel lateral — estado */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Estado
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Chip con nombre real del estado */}
              <Chip
                label={estadoNombre}
                color={chipColor}
                sx={{ fontWeight: 700, fontSize: 13 }}
              />

              <Divider sx={{ my: 3 }} />

              {/* Metadatos */}
              <Stack spacing={2}>
                <DetailRow
                  icon={<Calendar size={16} />}
                  label="Fecha de creación"
                  value={formatDate(obra.created_at)}
                />
                <DetailRow
                  icon={<Calendar size={16} />}
                  label="Última actualización"
                  value={formatDate(obra.updated_at)}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};