import {
  Box, Button, Card, Chip, Dialog, DialogContent,
  DialogTitle, Divider, Stack, Typography, useTheme,
} from '@mui/material';
import { Package, Plus, RefreshCw } from 'lucide-react';
import type { MaterialSimilar } from '../types/market.types';

interface Props {
  open: boolean;
  onClose: () => void;
  similares: MaterialSimilar[];
  nombreMaterial: string;
  cantidad: number;
  unidad: string;
  onAgregarStock: (material_id: number) => void;
  onCrearNuevo: () => void;
  cargando: boolean;
}

export const ConfirmacionInventarioModal: React.FC<Props> = ({
  open, onClose, similares, nombreMaterial, cantidad, unidad,
  onAgregarStock, onCrearNuevo, cargando,
}) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Package size={20} color="#F59E0B" />
          <Typography variant="h6" fontWeight={700}>Material similar encontrado</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Encontramos materiales en tu inventario similares a <strong>"{nombreMaterial}"</strong>.
          ¿Querés sumar las {Number(cantidad).toLocaleString('es-AR')} {unidad} al stock existente o crear un material nuevo?
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>

          {/* Materiales similares */}
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            MATERIALES SIMILARES EN TU INVENTARIO
          </Typography>

          {similares.map((mat) => (
            <Card key={mat.id} sx={{
              borderRadius: 2, boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.action.hover,
            }}>
              <Box sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {mat.nombre}
                  </Typography>
                  <Chip
                    label={`Stock: ${Number(mat.stock_actual).toLocaleString('es-AR')} ${mat.unidad}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(22,163,74,0.12)', color: '#16A34A', fontWeight: 700 }}
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    ${Number(mat.precio_unitario).toLocaleString('es-AR')} / {mat.unidad}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<RefreshCw size={14} />}
                    onClick={() => onAgregarStock(mat.id)}
                    disabled={cargando}
                    sx={{
                      bgcolor: '#F59E0B', color: '#0F172A',
                      '&:hover': { bgcolor: '#D97706' },
                      borderRadius: 2,
                    }}
                  >
                    Sumar al stock
                  </Button>
                </Stack>
              </Box>
            </Card>
          ))}

          <Divider>
            <Typography variant="caption" color="text.disabled">O</Typography>
          </Divider>

          {/* Crear nuevo */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={onCrearNuevo}
            disabled={cargando}
            sx={{ borderRadius: 2 }}
          >
            Crear material nuevo en el inventario
          </Button>

          <Button fullWidth variant="text" onClick={onClose} disabled={cargando}>
            Cancelar
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};