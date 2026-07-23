
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CompraForm } from './CompraForm';
import { useCreateCompra, useUpdateCompra } from '../hooks/useCompras';
import type { CompraFormValues } from '../schemas/compra.schema';
import type { Compra } from '../types/compra.types';

interface CompraFormDialogProps {
  open: boolean;
  onClose: () => void;
  compra?: Compra | null;
}

export function CompraFormDialog({ open, onClose, compra }: CompraFormDialogProps) {
  
  const { t } = useTranslation();
  const createCompra = useCreateCompra();
  const updateCompra = useUpdateCompra();

  const isEdit = Boolean(compra);

  const handleSubmit = async (values: CompraFormValues) => {
    if (isEdit && compra) {
      await updateCompra.mutateAsync({
        id: compra.id,
        obra_id: values.obra_id,
        sector_id: values.sector_id ?? null,
        especialidad_id: values.especialidad_id,
        descripcion: values.descripcion,
        proveedor: values.proveedor,
        monto: values.monto,
        fecha: values.fecha,
        comprobante_url: values.comprobante_url,
      });
    } else {
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
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEdit ? t('compras.title_editar') : t('compras.title_nueva')}
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 3 }}>
        <CompraForm
          defaultValues={
            compra
              ? {
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
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isSubmitting={createCompra.isPending || updateCompra.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}