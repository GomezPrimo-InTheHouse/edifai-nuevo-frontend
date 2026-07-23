import React from 'react';
import { Button, Box, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Plus, FileScan } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { useComprasList } from '../hooks/useCompras';
import { ComprasTable } from '../components/ComprasTable';
import { CompraFormDialog } from '../components/CompraFormDialog';
import { CompraDetailDialog } from '../components/CompraDetailDialog';
import { ComprobanteMultiItemDialog } from '../components/ComprobanteMultiItemDialog';
import type { Compra } from '../types/compra.types';

export function ComprasListPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: compras = [], isLoading } = useComprasList();

  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [multiItemOpen, setMultiItemOpen] = React.useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = React.useState<Compra | null>(null);

  const handleNueva = () => {
    setCompraSeleccionada(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (compra: Compra) => {
    setCompraSeleccionada(compra);
    setFormDialogOpen(true);
  };

  const handleView = (compra: Compra) => {
    setCompraSeleccionada(compra);
    setDetailDialogOpen(true);
  };

  const handleEditFromDetail = () => {
    setDetailDialogOpen(false);
    setFormDialogOpen(true);
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('compras.title')}
        actions={
          <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="outlined"
              fullWidth={isMobile}
              startIcon={<FileScan size={18} />}
              onClick={() => setMultiItemOpen(true)}
            >
              {t('compras.multi_item.boton')}
            </Button>
            <Button
              variant="contained"
              fullWidth={isMobile}
              startIcon={<Plus size={18} />}
              onClick={handleNueva}
            >
              {t('compras.nueva')}
            </Button>
          </Box>
        }
      />

      {isLoading && <LoadingState message={t('compras.loading')} />}

      {!isLoading && compras.length === 0 && (
        <EmptyState
          title={t('compras.empty.title')}
          description={t('compras.empty.desc')}
          action={<Button variant="contained" onClick={handleNueva}>{t('compras.nueva')}</Button>}
        />
      )}

      {!isLoading && compras.length > 0 && (
        <ComprasTable
          compras={compras}
          isLoading={isLoading}
          isMobile={isMobile}
          onView={handleView}
          onEdit={handleEdit}
        />
      )}

      <CompraFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        compra={compraSeleccionada}
      />

      <CompraDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        compra={compraSeleccionada}
        onEdit={handleEditFromDetail}
      />

      <ComprobanteMultiItemDialog open={multiItemOpen} onClose={() => setMultiItemOpen(false)} />
    </AppLayout>
  );
}