import { Box, Paper, Typography, Chip, Button, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Edit, Delete } from '@mui/icons-material';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { useCompraDetail, useDeleteCompra } from '../hooks/useCompras';
import { nombreCompletoSector } from '../../obras/types/sector.types';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export function CompraDetailPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const compraId = Number(id);

  const { data: compra, isLoading } = useCompraDetail(compraId);
  const deleteCompra = useDeleteCompra(compra?.obra_id);

  const handleDelete = async () => {
    if (!window.confirm(t('compras.confirm.eliminar_msg'))) return;
    await deleteCompra.mutateAsync(compraId);
    navigate('/compras');
  };

  if (isLoading || !compra) {
    return (
      <AppLayout>
        <LoadingState message={t('compras.loading')} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={compra.descripcion}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<Edit />} onClick={() => navigate(`/compras/${compraId}/editar`)}>
              {t('compras.acciones.editar')}
            </Button>
            <Button color="error" startIcon={<Delete />} onClick={handleDelete}>
              {t('compras.acciones.eliminar')}
            </Button>
          </Box>
        }
      />

      <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography><b>{t('compras.tabla.obra')}:</b> {compra.obra_nombre}</Typography>
          {compra.sector_valor && compra.sector_tipo && (
            <Typography>
              <b>{t('compras.form.sector')}:</b>{' '}
              {nombreCompletoSector({ tipo: compra.sector_tipo, valor: compra.sector_valor })}
            </Typography>
          )}
          <Typography><b>{t('compras.tabla.especialidad')}:</b> {compra.especialidad_nombre}</Typography>
          <Typography><b>{t('compras.tabla.monto')}:</b> {formatMoney(compra.monto)}</Typography>
          <Typography><b>{t('compras.form.fecha')}:</b> {new Date(compra.fecha).toLocaleDateString('es-AR')}</Typography>
          {compra.proveedor && <Typography><b>{t('compras.form.proveedor')}:</b> {compra.proveedor}</Typography>}
          {compra.material_id && (
            <Chip label={`${compra.material_nombre} — ${compra.cantidad} unidades`} sx={{ alignSelf: 'flex-start' }} />
          )}
          {compra.comprobante_url && (
            <Button href={compra.comprobante_url} target="_blank" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
              {t('compras.acciones.ver_comprobante')}
            </Button>
          )}
        </Box>
      </Paper>
    </AppLayout>
  );
}