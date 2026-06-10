// import React, { useState } from 'react';
// import {
//   Box, Button, Card, CardContent, Chip, Divider, IconButton,
//   Stack, Table, TableBody, TableCell, TableHead, TableRow,
//   Typography, useTheme,
// } from '@mui/material';
// import { CheckCircle, ClipboardList, Plus, Trash2 } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
// import {
//   useLaborPresupuestos,
//   useSeleccionarPresupuesto,
//   useDeleteLaborPresupuesto,
// } from '../hooks/useLaborPresupuestos';
// import { AgregarPresupuestoModal } from './AgregarPresupuestoModal';
// import type { LaborPresupuesto } from '../types/labor.types';
// import { useNotify } from '../../../shared/hooks/useNotify';

// interface Props {
//   labor_id: number;
//   estado_id?: number | null;
//   onPresupuestoConfirmado?: () => void;
// }

// const ESTADO_SIN_ASIGNAR = 29;

// function getCalidadColor(calidad?: string | null) {
//   if (calidad === 'alta') return { bg: '#F0FDF4', color: '#15803D' };
//   if (calidad === 'media') return { bg: '#FFFBEB', color: '#B45309' };
//   if (calidad === 'baja') return { bg: '#FEF2F2', color: '#DC2626' };
//   return { bg: 'transparent', color: 'inherit' };
// }

// function EstadoChip({ estado }: { estado: string }) {
//   const theme = useTheme();
//   if (estado === 'seleccionado') return <Chip label="Seleccionado" size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: 11 }} />;
//   if (estado === 'no_seleccionado') return <Chip label="No seleccionado" size="small" sx={{ bgcolor: theme.palette.action.hover, color: 'text.secondary', fontWeight: 700, fontSize: 11 }} />;
//   return <Chip label="Pendiente" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: 11 }} />;
// }

// export const LaborPresupuestosPanel: React.FC<Props> = ({ labor_id, estado_id, onPresupuestoConfirmado }) => {
//   const theme = useTheme();
//   const { t } = useTranslation();
//   const notify = useNotify();
//   const [modalOpen, setModalOpen] = useState(false);

//   const { data: presupuestos = [], isLoading } = useLaborPresupuestos(labor_id);
//   const seleccionarMutation = useSeleccionarPresupuesto(labor_id);
//   const eliminarMutation = useDeleteLaborPresupuesto(labor_id);

//   const puedeConfirmar = estado_id === ESTADO_SIN_ASIGNAR;
//   const haySeleccionado = presupuestos.some((p) => p.estado === 'seleccionado');

//   const handleSeleccionar = async (presupuesto: LaborPresupuesto) => {
//     try {
//       await seleccionarMutation.mutateAsync(presupuesto.id);
//       notify.success(t('labor_presupuestos.confirmado_ok'));
//       onPresupuestoConfirmado?.();
//     } catch {
//       notify.error(t('labor_presupuestos.confirmado_error'));
//     }
//   };

//   const handleEliminar = async (id: number) => {
//     try {
//       await eliminarMutation.mutateAsync(id);
//       notify.success(t('labor_presupuestos.eliminado_ok'));
//     } catch {
//       notify.error(t('labor_presupuestos.eliminado_error'));
//     }
//   };

//   const cardBorder = `1px solid ${theme.palette.divider}`;

//   return (
//     <>
//       <Card elevation={0} sx={{ borderRadius: 3, border: cardBorder, bgcolor: 'background.paper', mt: 3 }}>
//         <CardContent sx={{ p: 3 }}>
//           <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
//             <Stack direction="row" alignItems="center" gap={1}>
//               <ClipboardList size={16} color="#F59E0B" />
//               <Typography variant="h6" fontWeight={700}>{t('labor_presupuestos.titulo')}</Typography>
//               {presupuestos.length > 0 && (
//                 <Chip label={presupuestos.length} size="small" sx={{ bgcolor: theme.palette.action.hover, fontWeight: 700 }} />
//               )}
//             </Stack>
//             {puedeConfirmar && !haySeleccionado && (
//               <Button variant="outlined" size="small" startIcon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
//                 {t('labor_presupuestos.agregar')}
//               </Button>
//             )}
//           </Stack>
//           <Divider sx={{ mb: 2 }} />

//           {isLoading && (
//             <Typography variant="body2" color="text.secondary">{t('labor_presupuestos.cargando')}</Typography>
//           )}

//           {!isLoading && presupuestos.length === 0 && (
//             <Box sx={{ py: 4, textAlign: 'center' }}>
//               <Typography variant="body2" color="text.secondary">{t('labor_presupuestos.empty')}</Typography>
//             </Box>
//           )}

//           {!isLoading && presupuestos.length > 0 && (
//             <Box sx={{ overflowX: 'auto' }}>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
//                     <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_proveedor')}</TableCell>
//                     <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_precio')}</TableCell>
//                     <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_plazo')}</TableCell>
//                     <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_calidad')}</TableCell>
//                     <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_garantia')}</TableCell>
//                     <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_estado')}</TableCell>
//                     <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_acciones')}</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {presupuestos.map((p) => {
//                     const calidadStyle = getCalidadColor(p.calidad);
//                     const nombre = p.trabajador_nombre ?? p.proveedor_nombre ?? '-';
//                     return (
//                       <TableRow key={p.id} sx={{
//                         bgcolor: p.estado === 'seleccionado' ? 'rgba(22,163,74,0.04)' : 'transparent',
//                         opacity: p.estado === 'no_seleccionado' ? 0.6 : 1,
//                       }}>
//                         <TableCell>
//                           <Typography variant="body2" fontWeight={600}>{nombre}</Typography>
//                           {p.notas && (
//                             <Typography variant="caption" color="text.secondary">{p.notas}</Typography>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <Typography variant="body2" fontWeight={700}>
//                             ${Number(p.precio_unitario).toLocaleString('es-AR')}
//                           </Typography>
//                         </TableCell>
//                         <TableCell>
//                           <Typography variant="body2">
//                             {p.plazo_dias ? `${p.plazo_dias} días` : '-'}
//                           </Typography>
//                         </TableCell>
//                         <TableCell>
//                           {p.calidad ? (
//                             <Chip label={p.calidad} size="small" sx={{ bgcolor: calidadStyle.bg, color: calidadStyle.color, fontWeight: 700, fontSize: 11 }} />
//                           ) : '-'}
//                         </TableCell>
//                         <TableCell>
//                           <Typography variant="body2">{p.garantia ?? '-'}</Typography>
//                         </TableCell>
//                         <TableCell>
//                           <EstadoChip estado={p.estado} />
//                         </TableCell>
//                         <TableCell>
//                           <Stack direction="row" spacing={0.5}>
//                             {puedeConfirmar && p.estado === 'pendiente' && (
//                               <IconButton
//                                 size="small" color="success"
//                                 disabled={seleccionarMutation.isPending}
//                                 onClick={() => handleSeleccionar(p)}
//                                 title={t('labor_presupuestos.confirmar')}
//                               >
//                                 <CheckCircle size={16} />
//                               </IconButton>
//                             )}
//                             {p.estado === 'pendiente' && (
//                               <IconButton
//                                 size="small" color="error"
//                                 disabled={eliminarMutation.isPending}
//                                 onClick={() => handleEliminar(p.id)}
//                                 title={t('labor_presupuestos.eliminar')}
//                               >
//                                 <Trash2 size={16} />
//                               </IconButton>
//                             )}
//                           </Stack>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </Box>
//           )}
//         </CardContent>
//       </Card>

//       <AgregarPresupuestoModal
//         open={modalOpen}
//         labor_id={labor_id}
//         onClose={() => setModalOpen(false)}
//       />
//     </>
//   );
// };

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Divider, IconButton,
  Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, useTheme,
} from '@mui/material';
import { CheckCircle, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useLaborPresupuestos,
  useSeleccionarPresupuesto,
  useDeleteLaborPresupuesto,
  useUnidadesMedida,
} from '../hooks/useLaborPresupuestos';
import { AgregarPresupuestoModal } from './AgregarPresupuestoModal';
import type { Labor, LaborPresupuesto } from '../types/labor.types';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props {
  labor_id: number;
  estado_id?: number | null;
  labor?: Labor | null;
  onPresupuestoConfirmado?: () => void;
}

const ESTADO_SIN_ASIGNAR = 29;

function getCalidadColor(calidad?: string | null) {
  if (calidad === 'alta') return { bg: '#F0FDF4', color: '#15803D' };
  if (calidad === 'media') return { bg: '#FFFBEB', color: '#B45309' };
  if (calidad === 'baja') return { bg: '#FEF2F2', color: '#DC2626' };
  return { bg: 'transparent', color: 'inherit' };
}

function EstadoChip({ estado }: { estado: string }) {
  const theme = useTheme();
  if (estado === 'seleccionado') return <Chip label="Seleccionado" size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: 11 }} />;
  if (estado === 'no_seleccionado') return <Chip label="No seleccionado" size="small" sx={{ bgcolor: theme.palette.action.hover, color: 'text.secondary', fontWeight: 700, fontSize: 11 }} />;
  return <Chip label="Pendiente" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: 11 }} />;
}

export const LaborPresupuestosPanel: React.FC<Props> = ({ labor_id, estado_id, labor, onPresupuestoConfirmado }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const notify = useNotify();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: presupuestos = [], isLoading } = useLaborPresupuestos(labor_id);
  const { data: unidades = [] } = useUnidadesMedida();
  const seleccionarMutation = useSeleccionarPresupuesto(labor_id);
  const eliminarMutation = useDeleteLaborPresupuesto(labor_id);

  const puedeConfirmar = estado_id === ESTADO_SIN_ASIGNAR;
  const haySeleccionado = presupuestos.some((p) => p.estado === 'seleccionado');
  const unidadLabor = unidades.find((u) => u.id === labor?.unidad_id);

  const handleSeleccionar = async (presupuesto: LaborPresupuesto) => {
    try {
      await seleccionarMutation.mutateAsync(presupuesto.id);
      notify.success(t('labor_presupuestos.confirmado_ok'));
      onPresupuestoConfirmado?.();
    } catch {
      notify.error(t('labor_presupuestos.confirmado_error'));
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await eliminarMutation.mutateAsync(id);
      notify.success(t('labor_presupuestos.eliminado_ok'));
    } catch {
      notify.error(t('labor_presupuestos.eliminado_error'));
    }
  };

  const cardBorder = `1px solid ${theme.palette.divider}`;

  return (
    <>
      <Card elevation={0} sx={{ borderRadius: 3, border: cardBorder, bgcolor: 'background.paper', mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <ClipboardList size={16} color="#F59E0B" />
              <Typography variant="h6" fontWeight={700}>{t('labor_presupuestos.titulo')}</Typography>
              {presupuestos.length > 0 && (
                <Chip label={presupuestos.length} size="small" sx={{ bgcolor: theme.palette.action.hover, fontWeight: 700 }} />
              )}
              {/* Referencia de medición */}
              {(labor?.cantidad || unidadLabor) && (
                <Chip
                  label={`${labor?.cantidad ?? ''} ${unidadLabor?.simbolo ?? ''}`.trim()}
                  size="small"
                  sx={{ bgcolor: theme.palette.action.hover, fontWeight: 600, fontSize: 11 }}
                />
              )}
            </Stack>
            {puedeConfirmar && !haySeleccionado && (
              <Button variant="outlined" size="small" startIcon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
                {t('labor_presupuestos.agregar')}
              </Button>
            )}
          </Stack>
          <Divider sx={{ mb: 2 }} />

          {isLoading && (
            <Typography variant="body2" color="text.secondary">{t('labor_presupuestos.cargando')}</Typography>
          )}

          {!isLoading && presupuestos.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">{t('labor_presupuestos.empty')}</Typography>
            </Box>
          )}

          {!isLoading && presupuestos.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_proveedor')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_precio_unitario')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_cantidad')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_precio_total')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_plazo')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_calidad')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_estado')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('labor_presupuestos.col_acciones')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {presupuestos.map((p) => {
                    const calidadStyle = getCalidadColor(p.calidad);
                    const nombre = p.trabajador_nombre ?? p.proveedor_nombre ?? '-';
                    return (
                      <TableRow key={p.id} sx={{
                        bgcolor: p.estado === 'seleccionado' ? 'rgba(22,163,74,0.04)' : 'transparent',
                        opacity: p.estado === 'no_seleccionado' ? 0.6 : 1,
                      }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{nombre}</Typography>
                          {p.notas && (
                            <Typography variant="caption" color="text.secondary">{p.notas}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            ${Number(p.precio_unitario).toLocaleString('es-AR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {p.cantidad ? `${p.cantidad} ${unidadLabor?.simbolo ?? ''}` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="success.main">
                            ${Number(p.precio_total).toLocaleString('es-AR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {p.plazo_dias ? `${p.plazo_dias} días` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {p.calidad ? (
                            <Chip label={p.calidad} size="small" sx={{ bgcolor: calidadStyle.bg, color: calidadStyle.color, fontWeight: 700, fontSize: 11 }} />
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <EstadoChip estado={p.estado} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {puedeConfirmar && p.estado === 'pendiente' && (
                              <IconButton size="small" color="success"
                                disabled={seleccionarMutation.isPending}
                                onClick={() => handleSeleccionar(p)}
                                title={t('labor_presupuestos.confirmar')}>
                                <CheckCircle size={16} />
                              </IconButton>
                            )}
                            {p.estado === 'pendiente' && (
                              <IconButton size="small" color="error"
                                disabled={eliminarMutation.isPending}
                                onClick={() => handleEliminar(p.id)}
                                title={t('labor_presupuestos.eliminar')}>
                                <Trash2 size={16} />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <AgregarPresupuestoModal
        open={modalOpen}
        labor_id={labor_id}
        labor={labor}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};