
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CompraForm } from '../components/CompraFormDialog';
import { useCompraDetail, useUpdateCompra } from '../hooks/useCompras';
import type { CompraFormValues } from '../schemas/compra.schema';

export function CompraEditPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const compraId = Number(id);

  const { data: compra, isLoading } = useCompraDetail(compraId);
  const updateCompra = useUpdateCompra();

  const handleSubmit = async (values: CompraFormValues) => {
    await updateCompra.mutateAsync({
      id: compraId,
      obra_id: values.obra_id,
      sector_id: values.sector_id ?? null,
      especialidad_id: values.especialidad_id,
      descripcion: values.descripcion,
      proveedor: values.proveedor,
      monto: values.monto,
      fecha: values.fecha,
      comprobante_url: values.comprobante_url,
    });
    navigate(`/compras/${compraId}`);
  };

  if (isLoading || !compra) return null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
        {t('compras.title_editar')}
      </Typography>
      <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
        <CompraForm
          defaultValues={{
            obra_id: compra.obra_id,
            sector_id: compra.sector_id,
            especialidad_id: compra.especialidad_id,
            descripcion: compra.descripcion,
            proveedor: compra.proveedor ?? '',
            monto: compra.monto,
            fecha: compra.fecha.slice(0, 10),
            comprobante_url: compra.comprobante_url ?? '',
            es_compra_material: Boolean(compra.material_id),
            material_id: compra.material_id,
            cantidad: compra.cantidad,
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateCompra.isPending}
        />
      </Paper>
    </Box>
  );
}