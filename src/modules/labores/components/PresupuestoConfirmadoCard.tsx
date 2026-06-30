// src/modules/labores/components/PresupuestoConfirmadoCard.tsx
import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { AlertTriangle, Receipt, Ban } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
import { usePresupuestoByLabor, useAnularPresupuesto } from '../../presupuestos/hooks/usePresupuestos';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props {
  labor_id: number;
  esAdmin: boolean;
}

export const PresupuestoConfirmadoCard: React.FC<Props> = ({ labor_id, esAdmin }) => {
  const theme = useTheme();
//   const { t } = useTranslation();
  const notify = useNotify();

  const { data: presupuesto, isLoading } = usePresupuestoByLabor(labor_id);
  const anularMutation = useAnularPresupuesto();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [motivo, setMotivo] = useState('');

  if (isLoading || !presupuesto) return null;
  if (presupuesto.estado_confirmacion === 'anulado') {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid #FEE2E2`, bgcolor: 'background.paper', mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={1}>
            <Ban size={16} color="#DC2626" />
            <Typography variant="h6" fontWeight={700} color="error">
              Presupuesto anulado
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Motivo: {presupuesto.motivo_anulacion}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Anulado el {presupuesto.anulado_at ? new Date(presupuesto.anulado_at).toLocaleDateString('es-AR') : '-'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleAnular = async () => {
    if (!motivo.trim()) {
      notify.error('Indicá un motivo para anular el presupuesto');
      return;
    }
    try {
      await anularMutation.mutateAsync({ id: presupuesto.id, motivo: motivo.trim() });
      notify.success('Presupuesto anulado correctamente');
      setDialogOpen(false);
      setMotivo('');
    } catch {
      notify.error('No se pudo anular el presupuesto');
    }
  };

  return (
    <>
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Receipt size={16} color="#F59E0B" />
              <Typography variant="h6" fontWeight={700}>Presupuesto confirmado</Typography>
              <Chip label="Confirmado" size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: 11 }} />
            </Stack>
            {esAdmin && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<Ban size={14} />}
                onClick={() => setDialogOpen(true)}
              >
                Anular
              </Button>
            )}
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={4} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">Costo mano de obra</Typography>
              <Typography variant="body2" fontWeight={700}>
                ${Number(presupuesto.costo_mano_obra ?? 0).toLocaleString('es-AR')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total estimado</Typography>
              <Typography variant="body2" fontWeight={700} color="success.main">
                ${Number(presupuesto.total_estimado ?? 0).toLocaleString('es-AR')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#DC2626" />
            </Box>
            <Typography fontWeight={700}>Anular presupuesto</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Al anular este presupuesto: el trabajador se desvinculará de la labor, el saldo se recalculará
            y la acción quedará registrada en el historial de auditoría.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Motivo de la anulación"
            placeholder="Ej: Error de carga, el trabajador rechazó el trabajo, presupuesto duplicado..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleAnular}
            disabled={anularMutation.isPending}
          >
            {anularMutation.isPending ? 'Anulando...' : 'Confirmar anulación'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};