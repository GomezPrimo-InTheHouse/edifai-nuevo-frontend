import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Divider, IconButton,
  MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, useTheme,
} from '@mui/material';
import { CheckCircle, ClipboardList, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useLaborPresupuestos,
  useSeleccionarPresupuesto,
  useDeleteLaborPresupuesto,
  useUpdateLaborPresupuesto,
  useUnidadesMedida,
} from '../hooks/useLaborPresupuestos';
import { AgregarPresupuestoModal } from './AgregarPresupuestoModal';
import { RegistrarTrabajadorModal } from './RegistrarTrabajadorModal';
import type { Labor, LaborPresupuesto } from '../types/labor.types';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props {
  labor_id: number;
  estado_id?: number | null;
  labor?: Labor | null;
  onPresupuestoConfirmado?: () => void;
}

const ESTADO_SIN_ASIGNAR = 29;
const CALIDAD_OPTIONS = ['alta', 'media', 'baja'];

interface EditState {
  precio_unitario: string;
  cantidad: string;
  plazo_dias: string;
  calidad: string;
  notas: string;
}

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
  const [registrarOpen, setRegistrarOpen] = useState(false);
  const [proveedorNombre, setProveedorNombre] = useState<string | null>(null);
  const [proveedorExternoId, setProveedorExternoId] = useState<number | null>(null);

  // Edición inline — id del presupuesto en edición
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({
    precio_unitario: '',
    cantidad: '',
    plazo_dias: '',
    calidad: '',
    notas: '',
  });

  const { data: presupuestos = [], isLoading } = useLaborPresupuestos(labor_id);
  const { data: unidades = [] } = useUnidadesMedida();
  const seleccionarMutation = useSeleccionarPresupuesto(labor_id);
  const eliminarMutation = useDeleteLaborPresupuesto(labor_id);
  const updateMutation = useUpdateLaborPresupuesto(labor_id);

  const puedeConfirmar = estado_id === ESTADO_SIN_ASIGNAR;
  const haySeleccionado = presupuestos.some((p) => p.estado === 'seleccionado');
  const unidadLabor = unidades.find((u) => u.id === labor?.unidad_id);

  const handleSeleccionar = async (presupuesto: LaborPresupuesto) => {
    try {
      const result = await seleccionarMutation.mutateAsync(presupuesto.id);
      notify.success(t('labor_presupuestos.confirmado_ok'));
      onPresupuestoConfirmado?.();
      if (result?.es_proveedor_externo && !presupuesto.trabajador_id) {
        setProveedorNombre(result.proveedor_nombre ?? null);
        setProveedorExternoId(presupuesto.proveedor_externo_id ?? null);
        setRegistrarOpen(true);
      }
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

  const handleIniciarEdicion = (p: LaborPresupuesto) => {
    setEditandoId(p.id);
    setEditState({
      precio_unitario: String(p.precio_unitario ?? ''),
      cantidad: String(p.cantidad ?? ''),
      plazo_dias: String(p.plazo_dias ?? ''),
      calidad: p.calidad ?? '',
      notas: p.notas ?? '',
    });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
  };

  const handleGuardarEdicion = async (id: number) => {
    try {
      await updateMutation.mutateAsync({
        id,
        precio_unitario: editState.precio_unitario ? Number(editState.precio_unitario) : undefined,
        cantidad: editState.cantidad ? Number(editState.cantidad) : undefined,
        plazo_dias: editState.plazo_dias ? Number(editState.plazo_dias) : null,
        calidad: editState.calidad || null,
        notas: editState.notas || null,
      });
      notify.success(t('labor_presupuestos.actualizado_ok'));
      setEditandoId(null);
    } catch {
      notify.error(t('labor_presupuestos.actualizado_error'));
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
                    const enEdicion = editandoId === p.id;
                    const calidadStyle = getCalidadColor(enEdicion ? editState.calidad : p.calidad);
                    const nombre = p.trabajador_nombre ?? p.proveedor_nombre ?? '-';

                    // Precio total calculado en tiempo real durante edición
                    const precioUnitarioEdit = Number(editState.precio_unitario) || 0;
                    const cantidadEdit = Number(editState.cantidad) || 0;
                    const precioTotalEdit = precioUnitarioEdit > 0 && cantidadEdit > 0
                      ? precioUnitarioEdit * cantidadEdit
                      : precioUnitarioEdit;

                    return (
                      <TableRow
                        key={p.id}
                        sx={{
                          bgcolor: p.estado === 'seleccionado' ? 'rgba(22,163,74,0.04)' : enEdicion ? `${theme.palette.primary.main}08` : 'transparent',
                          opacity: p.estado === 'no_seleccionado' ? 0.6 : 1,
                          verticalAlign: enEdicion ? 'top' : 'middle',
                        }}
                      >
                        {/* Proveedor / Notas */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{nombre}</Typography>
                          {enEdicion ? (
                            <TextField
                              size="small" fullWidth multiline maxRows={2}
                              placeholder={t('labor_presupuestos.col_notas')}
                              value={editState.notas}
                              onChange={(e) => setEditState((prev) => ({ ...prev, notas: e.target.value }))}
                              sx={{ mt: 0.5, '& .MuiInputBase-root': { fontSize: 12 } }}
                            />
                          ) : (
                            p.notas && <Typography variant="caption" color="text.secondary">{p.notas}</Typography>
                          )}
                        </TableCell>

                        {/* Precio unitario */}
                        <TableCell>
                          {enEdicion ? (
                            <TextField
                              size="small" type="number" sx={{ width: 110 }}
                              value={editState.precio_unitario}
                              onChange={(e) => setEditState((prev) => ({ ...prev, precio_unitario: e.target.value }))}
                              inputProps={{ min: 0 }}
                            />
                          ) : (
                            <Typography variant="body2" fontWeight={700}>
                              ${Number(p.precio_unitario).toLocaleString('es-AR')}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Cantidad */}
                        <TableCell>
                          {enEdicion ? (
                            <TextField
                              size="small" type="number" sx={{ width: 90 }}
                              value={editState.cantidad}
                              onChange={(e) => setEditState((prev) => ({ ...prev, cantidad: e.target.value }))}
                              inputProps={{ min: 0, step: 1 }}
                            />
                          ) : (
                            <Typography variant="body2">
                              {p.cantidad ? `${p.cantidad} ${unidadLabor?.simbolo ?? ''}` : '-'}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Precio total */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="success.main">
                            ${enEdicion
                              ? precioTotalEdit.toLocaleString('es-AR')
                              : Number(p.precio_total).toLocaleString('es-AR')}
                          </Typography>
                          {enEdicion && precioUnitarioEdit > 0 && cantidadEdit > 0 && (
                            <Typography variant="caption" color="text.disabled">
                              {precioUnitarioEdit.toLocaleString('es-AR')} × {cantidadEdit}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Plazo */}
                        <TableCell>
                          {enEdicion ? (
                            <TextField
                              size="small" type="number" sx={{ width: 80 }}
                              value={editState.plazo_dias}
                              onChange={(e) => setEditState((prev) => ({ ...prev, plazo_dias: e.target.value }))}
                              inputProps={{ min: 0 }}
                            />
                          ) : (
                            <Typography variant="body2">
                              {p.plazo_dias ? `${p.plazo_dias} días` : '-'}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Calidad */}
                        <TableCell>
                          {enEdicion ? (
                            <TextField
                              select size="small" sx={{ width: 100 }}
                              value={editState.calidad}
                              onChange={(e) => setEditState((prev) => ({ ...prev, calidad: e.target.value }))}
                            >
                              <MenuItem value="">-</MenuItem>
                              {CALIDAD_OPTIONS.map((c) => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                              ))}
                            </TextField>
                          ) : (
                            p.calidad ? (
                              <Chip label={p.calidad} size="small" sx={{ bgcolor: calidadStyle.bg, color: calidadStyle.color, fontWeight: 700, fontSize: 11 }} />
                            ) : '-'
                          )}
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          <EstadoChip estado={p.estado} />
                        </TableCell>

                        {/* Acciones */}
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {enEdicion ? (
                              <>
                                <IconButton size="small" color="primary"
                                  disabled={updateMutation.isPending}
                                  onClick={() => handleGuardarEdicion(p.id)}
                                  title={t('labor_presupuestos.guardar')}>
                                  <Save size={15} />
                                </IconButton>
                                <IconButton size="small"
                                  onClick={handleCancelarEdicion}
                                  title={t('labor_presupuestos.cancelar_edicion')}>
                                  <X size={15} />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                {p.estado === 'pendiente' && (
                                  <IconButton size="small" color="default"
                                    onClick={() => handleIniciarEdicion(p)}
                                    title={t('labor_presupuestos.editar')}>
                                    <Pencil size={15} />
                                  </IconButton>
                                )}
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
                              </>
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

      <RegistrarTrabajadorModal
        open={registrarOpen}
        nombreSugerido={proveedorNombre}
        proveedorExternoId={proveedorExternoId}
        laborId={labor_id}
        onClose={() => setRegistrarOpen(false)}
        onTrabajadorCreado={() => {
          setRegistrarOpen(false);
          notify.success(t('labor_presupuestos.trabajador_registrado_ok'));
          onPresupuestoConfirmado?.();
        }}
      />
    </>
  );
};