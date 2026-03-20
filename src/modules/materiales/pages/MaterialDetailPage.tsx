import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider,
  Grid, Stack, Typography, Table, TableHead,
  TableRow, TableCell, TableBody, Paper,
} from '@mui/material';
import { ArrowLeft, Pencil, Package, DollarSign, TrendingUp, Calendar, Image } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { StockBadge } from '../components/StockBadge';
import { useMaterialDetail } from '../hooks/useMateriales';
import { useHistorialByMaterial } from '../hooks/useHistorialIncrementos';
import { useTiposMaterialList } from '../hooks/useTipoMaterial';

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

export const MaterialDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const materialId = Number(id);

  const { data: material, isLoading, isError, refetch } = useMaterialDetail(materialId);
  const { data: historial = [] } = useHistorialByMaterial(materialId);
  const { data: tipos = [] } = useTiposMaterialList();

  if (isLoading) return <LoadingState message="Cargando material..." />;
  if (isError) return <ErrorState title="Error" message="No se pudo cargar el material." onRetry={refetch} />;
  if (!material) return <ErrorState title="No encontrado" message="El material no existe." />;

  const tipoNombre = tipos.find((t) => t.id === material.tipo_material_id)?.nombre ?? '-';

  return (
    <AppLayout>
      <PageHeader
        title={material.nombre}
        subtitle="Vista detallada del material."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/materiales')}>Volver</Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/materiales/${material.id}/editar`)}>Editar</Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Panel principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Información general</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <DetailRow icon={<Package size={16} />} label="Tipo de material" value={tipoNombre} />
                <DetailRow icon={<Package size={16} />} label="Descripción" value={material.descripcion || '-'} />
                <DetailRow icon={<Package size={16} />} label="Unidad de medida" value={material.unidad} />
                {material.imagen_url && (
                  <DetailRow icon={<Image size={16} />} label="Imagen" value={material.imagen_url} />
                )}
              </Stack>

              <Divider sx={{ my: 3 }} />
              <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>STOCK Y PRECIOS</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <DetailRow icon={<Package size={16} />} label="Stock actual" value={`${material.stock_actual} ${material.unidad}`} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <DetailRow icon={<DollarSign size={16} />} label="Precio unitario" value={`$${Number(material.precio_unitario).toLocaleString('es-AR')}`} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <DetailRow icon={<TrendingUp size={16} />} label="% aumento mensual estimado" value={material.porcentaje_aumento_mensual ? `${material.porcentaje_aumento_mensual}%` : '-'} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Historial de incrementos */}
          {historial.length > 0 && (
            <Card sx={{ borderRadius: 3, mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Historial de precios</Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Precio anterior</TableCell>
                        <TableCell>Precio nuevo</TableCell>
                        <TableCell>% aplicado</TableCell>
                        <TableCell>Motivo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historial.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell>{formatDate(h.created_at)}</TableCell>
                          <TableCell>${Number(h.precio_anterior).toLocaleString('es-AR')}</TableCell>
                          <TableCell>${Number(h.precio_nuevo).toLocaleString('es-AR')}</TableCell>
                          <TableCell>{h.porcentaje_aplicado}%</TableCell>
                          <TableCell>{h.motivo || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Panel lateral */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Estado</Typography>
              <Divider sx={{ mb: 3 }} />
              <StockBadge stock={Number(material.stock_actual)} unidad={material.unidad} />
              <Divider sx={{ my: 3 }} />
              <Stack spacing={2}>
                <DetailRow icon={<Calendar size={16} />} label="Creado" value={formatDate(material.created_at)} />
                <DetailRow icon={<Calendar size={16} />} label="Actualizado" value={formatDate(material.updated_at)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};