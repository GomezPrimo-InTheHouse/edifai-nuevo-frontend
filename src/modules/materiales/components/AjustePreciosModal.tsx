// import React, { useState } from 'react';
// import {
//   Box, Button, Dialog, DialogContent, DialogTitle, IconButton,
//   MenuItem, Stack, TextField, Typography,
// } from '@mui/material';
// import { X } from 'lucide-react';
// import { useAjustePreciosMasivo } from '../hooks/useHistorialIncrementos';
// import { useTiposMaterialList } from '../hooks/useTipoMaterial';
// import { useNotify } from '../../../shared/hooks/useNotify';

// interface AjustePreciosModalProps {
//   open: boolean;
//   onClose: () => void;
// }

// export const AjustePreciosModal: React.FC<AjustePreciosModalProps> = ({ open, onClose }) => {
//   const [porcentaje, setPorcentaje] = useState('');
//   const [tipoId, setTipoId] = useState<number | ''>('');
//   const [motivo, setMotivo] = useState('');
//   const notify = useNotify();
//   const { data: tipos = [] } = useTiposMaterialList();
//   const ajusteMutation = useAjustePreciosMasivo();

//   const handleAjuste = async () => {
//     if (!porcentaje || Number(porcentaje) === 0) return;
//     const confirmed = await notify.confirm({
//       title: '¿Aplicar ajuste de precios?',
//       message: `Se aplicará un ${porcentaje}% ${tipoId ? 'al tipo seleccionado' : 'a todos los materiales'}. Los presupuestos no confirmados serán recalculados.`,
//       confirmLabel: 'Aplicar ajuste',
//       severity: 'warning',
//     });
//     if (!confirmed) return;

//     try {
//       await ajusteMutation.mutateAsync({
//         porcentaje: Number(porcentaje),
//         tipo_material_id: tipoId === '' ? undefined : tipoId,
//         motivo: motivo.trim() || undefined,
//       });
//       notify.success('Precios ajustados correctamente.');
//       setPorcentaje('');
//       setTipoId('');
//       setMotivo('');
//       onClose();
//     } catch {
//       notify.error('No se pudo aplicar el ajuste de precios.');
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableEnforceFocus>
//       <DialogTitle>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Typography variant="h6" fontWeight={700}>Ajuste de precios</Typography>
//           <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
//         </Box>
//       </DialogTitle>
//       <DialogContent>
//         <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//           Aplicá un porcentaje de incremento a todos los materiales o a un tipo específico. Los presupuestos no confirmados serán recalculados automáticamente.
//         </Typography>
//         <Stack spacing={2}>
//           <TextField
//             fullWidth label="Porcentaje de aumento (%)" type="number"
//             value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)}
//             inputProps={{ min: 0.1, step: 0.1 }}
//           />
//           <TextField
//             select fullWidth label="Tipo de material (opcional)"
//             value={tipoId} onChange={(e) => setTipoId(e.target.value === '' ? '' : Number(e.target.value))}
//           >
//             <MenuItem value="">Todos los materiales</MenuItem>
//             {tipos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
//           </TextField>
//           <TextField
//             fullWidth label="Motivo (opcional)"
//             value={motivo} onChange={(e) => setMotivo(e.target.value)}
//           />
//           <Stack direction="row" justifyContent="flex-end" spacing={1}>
//             <Button variant="outlined" onClick={onClose}>Cancelar</Button>
//             <Button
//               variant="contained" color="warning"
//               onClick={handleAjuste}
//               disabled={!porcentaje || ajusteMutation.isPending}
//             >
//               {ajusteMutation.isPending ? 'Aplicando...' : 'Aplicar ajuste'}
//             </Button>
//           </Stack>
//         </Stack>
//       </DialogContent>
//     </Dialog>
//   );
// };
import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle, IconButton,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query'; // Importante para el refresco automático
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
  
  const queryClient = useQueryClient(); // Instanciamos el cliente para invalidar queries
  const notify = useNotify();
  const { data: tipos = [] } = useTiposMaterialList();
  const ajusteMutation = useAjustePreciosMasivo();

  const handleAjuste = async () => {
    if (!porcentaje || Number(porcentaje) <= 0) {
      notify.error('Ingresá un porcentaje válido.');
      return;
    }

    const confirmed = await notify.confirm({
      title: '¿Aplicar ajuste de precios?',
      message: `Se aplicará un ${porcentaje}% ${tipoId ? 'al tipo seleccionado' : 'a todos los materiales'}. Los presupuestos no confirmados serán recalculados automáticamente.`,
      confirmLabel: 'Aplicar ajuste',
      severity: 'warning',
    });

    if (!confirmed) return;

    try {
      // Ejecutamos la mutación
      await ajusteMutation.mutateAsync({
        porcentaje: Number(porcentaje),
        tipo_material_id: tipoId === '' ? undefined : tipoId,
        motivo: motivo.trim() || undefined,
      });

      // --- REFRESCAR DATOS SIN RECARGAR PÁGINA ---
      // Invalidamos las claves para que React Query pida los datos nuevos
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['materiales'] }),
        queryClient.invalidateQueries({ queryKey: ['materiales-estadisticas'] }),
        queryClient.invalidateQueries({ queryKey: ['historial-incrementos'] }) // Si tienes este hook también
      ]);

      notify.success('Precios ajustados y estadísticas actualizadas correctamente.');
      
      // Limpiar estado y cerrar
      setPorcentaje('');
      setTipoId('');
      setMotivo('');
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'No se pudo aplicar el ajuste de precios.';
      notify.error(errorMsg);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm" 
      disableEnforceFocus
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>Ajuste masivo de precios</Typography>
        <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Esta acción modificará el precio unitario de los materiales seleccionados. 
          Los cambios se verán reflejados inmediatamente en las estadísticas y presupuestos pendientes.
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            fullWidth 
            label="Porcentaje de aumento (%)" 
            type="number"
            value={porcentaje} 
            onChange={(e) => setPorcentaje(e.target.value)}
            inputProps={{ min: 0.1, step: 0.1 }}
            placeholder="Ej: 12.5"
            variant="outlined"
          />

          <TextField
            select 
            fullWidth 
            label="Tipo de material"
            value={tipoId} 
            onChange={(e) => setTipoId(e.target.value === '' ? '' : Number(e.target.value))}
            helperText="Si no seleccionas uno, se aplicará a TODO el catálogo."
          >
            <MenuItem value="">Todos los materiales</MenuItem>
            {tipos.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth 
            label="Motivo o referencia"
            placeholder="Ej: Actualización mensual de proveedores"
            value={motivo} 
            onChange={(e) => setMotivo(e.target.value)}
            multiline
            rows={2}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
            <Button 
              variant="outlined" 
              onClick={onClose} 
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained" 
              color="warning"
              onClick={handleAjuste}
              disabled={!porcentaje || ajusteMutation.isPending}
              sx={{ 
                borderRadius: 2, 
                px: 4, 
                textTransform: 'none',
                fontWeight: 700 
              }}
            >
              {ajusteMutation.isPending ? 'Aplicando ajuste...' : 'Confirmar aumento'}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};