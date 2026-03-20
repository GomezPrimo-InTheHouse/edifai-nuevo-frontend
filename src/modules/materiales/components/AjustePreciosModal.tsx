import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle, IconButton,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { useAjustePreciosMasivo } from '../hooks/useHistorialIncrementos';
import { useTiposMaterialList } from '../hooks/useTipoMaterial';
import { useNotify } from '../../../shared/hooks/useNotify';

interface AjustePreciosModalProps {
  open: boolean;
  onClose: () => void;
}

export const AjustePreciosModal: React.FC<AjustePreciosModalProps> = ({ open, onClose }) => {
  const [porcentaje, setPorcentaje] = useState('');
  const [tipoId, setTipoId] = useState<number | ''>('');
  const [motivo, setMotivo] = useState('');
  const notify = useNotify();
  const { data: tipos = [] } = useTiposMaterialList();
  const ajusteMutation = useAjustePreciosMasivo();

  const handleAjuste = async () => {
    if (!porcentaje || Number(porcentaje) === 0) return;
    const confirmed = await notify.confirm({
      title: '¿Aplicar ajuste de precios?',
      message: `Se aplicará un ${porcentaje}% ${tipoId ? 'al tipo seleccionado' : 'a todos los materiales'}. Los presupuestos no confirmados serán recalculados.`,
      confirmLabel: 'Aplicar ajuste',
      severity: 'warning',
    });
    if (!confirmed) return;

    try {
      await ajusteMutation.mutateAsync({
        porcentaje: Number(porcentaje),
        tipo_material_id: tipoId === '' ? undefined : tipoId,
        motivo: motivo.trim() || undefined,
      });
      notify.success('Precios ajustados correctamente.');
      setPorcentaje('');
      setTipoId('');
      setMotivo('');
      onClose();
    } catch {
      notify.error('No se pudo aplicar el ajuste de precios.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Ajuste de precios</Typography>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Aplicá un porcentaje de incremento a todos los materiales o a un tipo específico. Los presupuestos no confirmados serán recalculados automáticamente.
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth label="Porcentaje de aumento (%)" type="number"
            value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)}
            inputProps={{ min: 0.1, step: 0.1 }}
          />
          <TextField
            select fullWidth label="Tipo de material (opcional)"
            value={tipoId} onChange={(e) => setTipoId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <MenuItem value="">Todos los materiales</MenuItem>
            {tipos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth label="Motivo (opcional)"
            value={motivo} onChange={(e) => setMotivo(e.target.value)}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="outlined" onClick={onClose}>Cancelar</Button>
            <Button
              variant="contained" color="warning"
              onClick={handleAjuste}
              disabled={!porcentaje || ajusteMutation.isPending}
            >
              {ajusteMutation.isPending ? 'Aplicando...' : 'Aplicar ajuste'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};