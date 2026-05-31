// import React, { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import {
//   Box, Button, Card, CardContent, Paper,
//   Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
// } from '@mui/material';
// import { ArrowLeft, Plus } from 'lucide-react';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { PagoEstadoChip } from '../components/PagoEstadoChip';
// import { PagoModal } from '../components/PagoModal';
// import { usePagosByTrabajador } from '../hooks/usePagos';
// import { useTrabajadorDetail } from '../../trabajadores/hooks/useTrabajadores';

// export const PagosByTrabajadorPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { trabajador_id } = useParams<{ trabajador_id: string }>();
//   const trabajadorId = Number(trabajador_id);
//   const [pagoModalOpen, setPagoModalOpen] = useState(false);

//   const { data: trabajador } = useTrabajadorDetail(trabajadorId);
//   const { data: pagosData, isLoading } = usePagosByTrabajador(trabajadorId);
//   const pagos = pagosData?.data ?? [];

//   const totalPagado = pagosData?.resumen?.total_pagado ?? 0;
//   const totalPendiente = pagosData?.resumen?.saldo_pendiente ?? 0;

//   if (isLoading) return <LoadingState message="Cargando pagos..." />;

//   return (
//     <AppLayout>
//       <PageHeader
//         title={`Pagos — ${trabajador?.nombre ?? ''} ${trabajador?.apellido ?? ''}`}
//         subtitle="Historial de pagos del trabajador."
//         actions={
//           <Stack direction="row" spacing={1}>
//             <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/pagos')}>Volver</Button>
//             <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setPagoModalOpen(true)}>Nuevo pago</Button>
//           </Stack>
//         }
//       />

//       {/* Resumen */}
//       <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
//         <Card sx={{ borderRadius: 3, flex: 1 }}>
//           <CardContent sx={{ p: 2.5 }}>
//             <Typography variant="caption" color="text.secondary">Total pagado</Typography>
//             <Typography variant="h5" fontWeight={800} color="success.main">${totalPagado.toLocaleString('es-AR')}</Typography>
//           </CardContent>
//         </Card>
//         <Card sx={{ borderRadius: 3, flex: 1 }}>
//           <CardContent sx={{ p: 2.5 }}>
//             <Typography variant="caption" color="text.secondary">Saldo pendiente</Typography>
//             <Typography variant="h5" fontWeight={800} color="warning.main">${totalPendiente.toLocaleString('es-AR')}</Typography>
//           </CardContent>
//         </Card>
//         <Card sx={{ borderRadius: 3, flex: 1 }}>
//           <CardContent sx={{ p: 2.5 }}>
//             <Typography variant="caption" color="text.secondary">Total pagos</Typography>
//             <Typography variant="h5" fontWeight={800}>{pagos.length}</Typography>
//           </CardContent>
//         </Card>
//       </Stack>

//       {pagos.length === 0 && (
//         <Box sx={{ py: 6, textAlign: 'center', color: '#94A3B8' }}>
//           <Typography>No hay pagos registrados para este trabajador.</Typography>
//         </Box>
//       )}

//       {pagos.length > 0 && (
//         <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Presupuesto</TableCell>
//                 <TableCell>Monto</TableCell>
//                 <TableCell>Fecha</TableCell>
//                 <TableCell>Forma de pago</TableCell>
//                 <TableCell>Motivo</TableCell>
//                 <TableCell>Estado</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {pagos.map((p) => (
//                 <TableRow key={p.id} hover onClick={() => navigate(`/pagos/${p.id}`)} sx={{ cursor: 'pointer' }}>
//                   <TableCell>{p.presupuesto_nombre || `#${p.presupuesto_id}`}</TableCell>
//                   <TableCell><Typography fontWeight={700}>${Number(p.monto).toLocaleString('es-AR')}</Typography></TableCell>
//                   <TableCell>{new Date(p.fecha).toLocaleDateString('es-AR')}</TableCell>
//                   <TableCell>{p.forma_pago_nombre || '-'}</TableCell>
//                   <TableCell>{p.motivo || '-'}</TableCell>
//                   <TableCell><PagoEstadoChip estado={p.estado} /></TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Paper>
//       )}

//       <PagoModal open={pagoModalOpen} onClose={() => setPagoModalOpen(false)} trabajadorId={trabajadorId} />
//     </AppLayout>
//   );
// };

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Paper,
  Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme,
} from '@mui/material';
import { ArrowLeft, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { PagoEstadoChip } from '../components/PagoEstadoChip';
import { PagoModal } from '../components/PagoModal';
import { usePagosByTrabajador } from '../hooks/usePagos';
import { useTrabajadorDetail } from '../../trabajadores/hooks/useTrabajadores';

export const PagosByTrabajadorPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const { trabajador_id } = useParams<{ trabajador_id: string }>();
  const trabajadorId = Number(trabajador_id);
  const [pagoModalOpen, setPagoModalOpen] = useState(false);

  const { data: trabajador } = useTrabajadorDetail(trabajadorId);
  const { data: pagosData, isLoading } = usePagosByTrabajador(trabajadorId);
  const pagos = pagosData?.data ?? [];

  const totalPagado    = pagosData?.resumen?.total_pagado   ?? 0;
  const totalPendiente = pagosData?.resumen?.saldo_pendiente ?? 0;

  if (isLoading) return <LoadingState message={t('pagos.loading')} />;

  return (
    <AppLayout>
      <PageHeader
        title={`${t('pagos.title')} — ${trabajador?.nombre ?? ''} ${trabajador?.apellido ?? ''}`}
        subtitle={t('pagos_trabajador.subtitle')}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/pagos')}>
              {t('pagos_trabajador.volver')}
            </Button>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setPagoModalOpen(true)}>
              {t('pagos_trabajador.nuevo')}
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ borderRadius: 3, flex: 1, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary">{t('pagos_trabajador.total_pagado')}</Typography>
            <Typography variant="h5" fontWeight={800} color="success.main">
              ${totalPagado.toLocaleString('es-AR')}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 3, flex: 1, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary">{t('pagos_trabajador.saldo_pendiente')}</Typography>
            <Typography variant="h5" fontWeight={800} color="warning.main">
              ${totalPendiente.toLocaleString('es-AR')}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 3, flex: 1, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary">{t('pagos_trabajador.total_pagos')}</Typography>
            <Typography variant="h5" fontWeight={800}>{pagos.length}</Typography>
          </CardContent>
        </Card>
      </Stack>

      {pagos.length === 0 && (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.disabled">{t('pagos_trabajador.sin_pagos')}</Typography>
        </Box>
      )}

      {pagos.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.presupuesto')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.monto')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.fecha')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.forma_pago')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('pagos_trabajador.motivo')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.estado')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagos.map((p) => (
                <TableRow key={p.id} hover onClick={() => navigate(`/pagos/${p.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{p.presupuesto_nombre || `#${p.presupuesto_id}`}</TableCell>
                  <TableCell><Typography fontWeight={700}>${Number(p.monto).toLocaleString('es-AR')}</Typography></TableCell>
                  <TableCell>{new Date(p.fecha).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell>{p.forma_pago_nombre || '-'}</TableCell>
                  <TableCell>{p.motivo || '-'}</TableCell>
                  <TableCell><PagoEstadoChip estado={p.estado} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <PagoModal open={pagoModalOpen} onClose={() => setPagoModalOpen(false)} trabajadorId={trabajadorId} />
    </AppLayout>
  );
};