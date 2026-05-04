import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider, Grid,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { ArrowLeft, Download } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { PagoEstadoChip } from '../components/PagoEstadoChip';
import { useCambiarEstadoPago, usePagoDetail } from '../hooks/usePagos';
import { useNotify } from '../../../shared/hooks/useNotify';

const ESTADOS = ['Pendiente', 'Pagado', 'Parcial', 'Cancelado'];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: '1px solid #F1F5F9' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value}</Typography>
    </Stack>
  );
}

export const PagoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pagoId = Number(id);
  const notify = useNotify();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: pago, isLoading, isError, refetch } = usePagoDetail(pagoId);
  const cambiarEstadoMutation = useCambiarEstadoPago();

  if (isLoading) return <LoadingState message="Cargando pago..." />;
  if (isError) return <ErrorState title="Error" message="No se pudo cargar el pago." onRetry={refetch} />;
  if (!pago) return <ErrorState title="No encontrado" message="El pago no existe." />;

  const handleCambiarEstado = async (estado: string) => {
    try {
      await cambiarEstadoMutation.mutateAsync({ id: pagoId, estado });
      notify.success('Estado actualizado.');
    } catch {
      notify.error('No se pudo cambiar el estado.');
    }
  };

  // Exportar PDF usando print
  const handleExportPDF = () => {
    const contenido = printRef.current?.innerHTML;
    if (!contenido) return;
    const ventana = window.open('', '_blank');
    if (!ventana) return;
    ventana.document.write(`
      <html>
        <head>
          <title>Comprobante de Pago #${pago.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #0F172A; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            p { color: #64748B; margin: 0 0 24px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
            td:last-child { text-align: right; font-weight: 600; }
            .total { font-size: 20px; font-weight: 800; color: #0F172A; }
            .estado { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; background: #F0FDF4; color: #16A34A; }
          </style>
        </head>
        <body>${contenido}</body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  };

  return (
    <AppLayout>
      <PageHeader
        title={`Comprobante de pago #${pago.id}`}
        subtitle="Detalle del pago registrado."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/pagos')}>Volver</Button>
            <Button variant="contained" startIcon={<Download size={16} />} onClick={handleExportPDF}>Exportar PDF</Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Comprobante */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Contenido imprimible */}
              <div ref={printRef}>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>EdifAI — Comprobante de Pago</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>#{pago.id} — {new Date(pago.fecha).toLocaleDateString('es-AR')}</Typography>
                <Divider sx={{ mb: 3 }} />
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr><td style={{ color: '#64748B', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Trabajador</td><td style={{ textAlign: 'right', fontWeight: 600, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>{pago.trabajador_nombre} {pago.trabajador_apellido}</td></tr>
                    <tr><td style={{ color: '#64748B', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Presupuesto</td><td style={{ textAlign: 'right', fontWeight: 600, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>{pago.presupuesto_nombre || `#${pago.presupuesto_id}`}</td></tr>
                    <tr><td style={{ color: '#64748B', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Forma de pago</td><td style={{ textAlign: 'right', fontWeight: 600, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>{pago.forma_pago_nombre || '-'}</td></tr>
                    <tr><td style={{ color: '#64748B', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Motivo</td><td style={{ textAlign: 'right', fontWeight: 600, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>{pago.motivo || '-'}</td></tr>
                    <tr><td style={{ color: '#64748B', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Fecha</td><td style={{ textAlign: 'right', fontWeight: 600, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>{new Date(pago.fecha).toLocaleDateString('es-AR')}</td></tr>
                    <tr><td style={{ color: '#64748B', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Estado</td><td style={{ textAlign: 'right', fontWeight: 600, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>{pago.estado}</td></tr>
                    <tr>
                      <td style={{ padding: '16px 0', fontSize: 18, fontWeight: 800 }}>TOTAL</td>
                      <td style={{ textAlign: 'right', fontSize: 24, fontWeight: 800, padding: '16px 0' }}>${Number(pago.monto).toLocaleString('es-AR')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel lateral */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Estado del pago</Typography>
              <Divider sx={{ mb: 3 }} />
              <PagoEstadoChip estado={pago.estado} />
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#64748B' }}>CAMBIAR ESTADO</Typography>
                <TextField
                  select fullWidth size="small"
                  value={pago.estado}
                  onChange={(e) => handleCambiarEstado(e.target.value)}
                  disabled={cambiarEstadoMutation.isPending}
                >
                  {ESTADOS.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                </TextField>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0F172A', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>MONTO</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF' }}>
                  ${Number(pago.monto).toLocaleString('es-AR')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};