import { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip,
  Grid, Stack, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowLeft, PackageCheck, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { useMisCompras, useAgregarCompraAlInventario, useAgregarStockExistente } from '../hooks/useMisCompras';
import { useNotify } from '../../../shared/hooks/useNotify';
import { ConfirmacionInventarioModal } from '../components/ConfirmacionInventarioModal';
import type { MaterialSimilar, Transaccion } from '../types/market.types';

export const MisComprasPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const notify = useNotify();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: compras = [], isLoading, isError, refetch } = useMisCompras();
  const agregarMutation = useAgregarCompraAlInventario();
  const agregarStockMutation = useAgregarStockExistente();

  const [agregados, setAgregados] = useState<Set<number>>(new Set());
  const [modalConfirmacion, setModalConfirmacion] = useState<{
    open: boolean;
    transaccion_id: number;
    similares: MaterialSimilar[];
    nombre: string;
    cantidad: number;
    unidad: string;
  } | null>(null);

  const handleAgregar = async (compra: Transaccion) => {
    try {
      const result = await agregarMutation.mutateAsync(compra.id);
      if ((result as any)?.requiere_confirmacion) {
        setModalConfirmacion({
          open: true,
          transaccion_id: compra.id,
          similares: (result as any).similares,
          nombre: compra.nombre_material,
          cantidad: Number(compra.cantidad_comprada),
          unidad: compra.unidad,
        });
        return;
      }
      setAgregados((prev) => new Set([...prev, compra.id]));
      notify.success('Material agregado a tu inventario correctamente.');
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo agregar al inventario.');
    }
  };

  const handleAgregarStock = async (material_id: number) => {
    if (!modalConfirmacion) return;
    try {
      await agregarStockMutation.mutateAsync({
        transaccion_id: modalConfirmacion.transaccion_id,
        material_id,
      });
      setAgregados((prev) => new Set([...prev, modalConfirmacion.transaccion_id]));
      setModalConfirmacion(null);
      notify.success('Stock actualizado correctamente.');
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo actualizar el stock.');
    }
  };

  const handleCrearNuevo = async () => {
    if (!modalConfirmacion) return;
    try {
      await agregarMutation.mutateAsync(modalConfirmacion.transaccion_id, true as any);
      setAgregados((prev) => new Set([...prev, modalConfirmacion.transaccion_id]));
      setModalConfirmacion(null);
      notify.success('Material nuevo creado en tu inventario.');
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo crear el material.');
    }
  };

  if (isLoading) return <AppLayout><LoadingState message="Cargando compras..." /></AppLayout>;
  if (isError) return <AppLayout><ErrorState title="Error" message="No se pudieron cargar las compras." onRetry={refetch} /></AppLayout>;

  return (
    <AppLayout>
      <PageHeader
        title="Mis compras"
        subtitle="Materiales que adquiriste en el Market."
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/market')}
            sx={{ minWidth: 0, px: isMobile ? 1.25 : 2 }}
          >
            {isMobile ? '' : 'Volver al Market'}
          </Button>
        }
      />

      {compras.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PackageCheck size={48} color={theme.palette.text.disabled} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Todavía no tenés compras confirmadas
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/market')}>
            Explorar el Market
          </Button>
        </Box>
      ) : (
        <Grid container spacing={isMobile ? 1.5 : 2}>
          {compras.map((compra) => {
            const yaAgregado = agregados.has(compra.id);
            return (
              <Grid key={compra.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card sx={{
                  borderRadius: 3, height: '100%',
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                }}>
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ flex: 1, pr: 1 }}>
                        {compra.nombre_material}
                      </Typography>
                      <Chip
                        label="Comprado"
                        size="small"
                        sx={{ bgcolor: 'rgba(22,163,74,0.12)', color: '#16A34A', fontWeight: 700 }}
                      />
                    </Stack>

                    {/* Detalles */}
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Cantidad comprada</Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {Number(compra.cantidad_comprada).toLocaleString('es-AR')} {compra.unidad}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Precio unitario</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#F59E0B' }}>
                          ${Number(compra.precio_unitario).toLocaleString('es-AR')} / {compra.unidad}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Total pagado</Typography>
                        <Typography variant="body2" fontWeight={800} color="text.primary">
                          ${Number(compra.total).toLocaleString('es-AR')} {compra.moneda}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Vendedor</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {compra.vendedor_nombre}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Fecha</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(compra.created_at).toLocaleDateString('es-AR')}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Botón agregar al inventario */}
                    <Button
                      fullWidth
                      variant={yaAgregado ? 'outlined' : 'contained'}
                      startIcon={yaAgregado ? undefined : <Plus size={16} />}
                      onClick={() => handleAgregar(compra)}
                      disabled={yaAgregado || agregarMutation.isPending}
                      sx={{
                        mt: 'auto',
                        borderRadius: 2,
                        bgcolor: yaAgregado ? 'transparent' : '#F59E0B',
                        color: yaAgregado ? 'text.secondary' : '#0F172A',
                        '&:hover': { bgcolor: yaAgregado ? 'transparent' : '#D97706' },
                      }}
                    >
                      {yaAgregado ? '✅ Agregado al inventario' : 'Agregar a mi inventario'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {modalConfirmacion && (
        <ConfirmacionInventarioModal
          open={modalConfirmacion.open}
          onClose={() => setModalConfirmacion(null)}
          similares={modalConfirmacion.similares}
          nombreMaterial={modalConfirmacion.nombre}
          cantidad={modalConfirmacion.cantidad}
          unidad={modalConfirmacion.unidad}
          onAgregarStock={handleAgregarStock}
          onCrearNuevo={handleCrearNuevo}
          cargando={agregarStockMutation.isPending || agregarMutation.isPending}
        />
      )}
    </AppLayout>
  );
};