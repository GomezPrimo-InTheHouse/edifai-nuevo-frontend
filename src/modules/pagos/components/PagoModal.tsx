import React from 'react';
import { Dialog, DialogContent, DialogTitle, Box, IconButton, Typography } from '@mui/material';
import { X } from 'lucide-react';
import { PagoForm } from './PagoForm';
import { useCreatePago } from '../hooks/usePagos';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useQueryClient } from '@tanstack/react-query';
import { pagosQueryKeys } from '../hooks/usePagos';

interface Props {
  open: boolean;
  onClose: () => void;
  presupuestoId?: number;
  trabajadorId?: number;
}

export const PagoModal: React.FC<Props> = ({ open, onClose, presupuestoId, trabajadorId }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const createMutation = useCreatePago();

  const handleSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        presupuesto_id: Number(values.presupuesto_id),
        trabajador_id: Number(values.trabajador_id),
        monto: Number(values.monto),
        fecha: values.fecha,
        motivo: values.motivo || null,
        forma_pago_id: values.forma_pago_id === '' ? null : Number(values.forma_pago_id),
        estado: values.estado,
      });
      notify.success('Pago registrado.');
      queryClient.invalidateQueries({ queryKey: pagosQueryKeys.all });
      if (presupuestoId) queryClient.invalidateQueries({ queryKey: pagosQueryKeys.byPresupuesto(presupuestoId) });
      onClose();
    } catch {
      notify.error('No se pudo registrar el pago.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Registrar pago</Typography>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <PagoForm
            presupuestoIdFijo={presupuestoId}
            trabajadorIdFijo={trabajadorId}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};