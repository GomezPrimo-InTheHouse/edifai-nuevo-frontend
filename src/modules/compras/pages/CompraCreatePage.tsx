import { Box, Paper, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CompraForm } from '../components/CompraFormDialog';
import { useCreateCompra } from '../hooks/useCompras';
import type { CompraFormValues } from '../schemas/compra.schema';

export function CompraCreatePage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createCompra = useCreateCompra();

  const handleSubmit = async (values: CompraFormValues) => {
    await createCompra.mutateAsync({
      obra_id: values.obra_id,
      sector_id: values.sector_id ?? null,
      especialidad_id: values.especialidad_id,
      descripcion: values.descripcion,
      proveedor: values.proveedor,
      monto: values.monto,
      fecha: values.fecha,
      comprobante_url: values.comprobante_url,
      material_id: values.es_compra_material ? values.material_id : null,
      cantidad: values.es_compra_material ? values.cantidad : null,
    });
    navigate('/compras');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
        {t('compras.title_nueva')}
      </Typography>
      <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
        <CompraForm onSubmit={handleSubmit} isSubmitting={createCompra.isPending} />
      </Paper>
    </Box>
  );
}