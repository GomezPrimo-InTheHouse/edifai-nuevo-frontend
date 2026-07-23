
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Button, Box, Typography, Chip,
} from '@mui/material';
import { Close, Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDeleteCompra } from '../hooks/useCompras';
import { nombreCompletoSector } from '../../obras/types/sector.types';
import type { Compra } from '../types/compra.types';

interface CompraDetailDialogProps {
  open: boolean;
  onClose: () => void;
  compra: Compra | null;
  onEdit: () => void;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export function CompraDetailDialog({ open, onClose, compra, onEdit }: CompraDetailDialogProps) {
  const { t } = useTranslation();
  const deleteCompra = useDeleteCompra(compra?.obra_id);

  const handleDelete = async () => {
    if (!compra) return;
    if (!window.confirm(t('compras.confirm.eliminar_msg'))) return;
    await deleteCompra.mutateAsync(compra.id);
    onClose();
  };

  if (!compra) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {compra.descripcion}
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
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
      </DialogContent>

      <DialogActions>
        <Button color="error" startIcon={<Delete />} onClick={handleDelete} disabled={deleteCompra.isPending}>
          {t('compras.acciones.eliminar')}
        </Button>
        <Button variant="contained" startIcon={<Edit />} onClick={onEdit}>
          {t('compras.acciones.editar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}