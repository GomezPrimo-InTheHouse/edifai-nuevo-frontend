// src/modules/gastosImprevistos/pages/GastosImprevistosPage.tsx

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, IconButton, MenuItem,
  Stack, TextField, Typography,
} from '@mui/material';
import { Plus, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import {
  useGastosImprevistosList,
  useCrearGastoImprevisto,
  useActualizarEstadoGasto,
  useEliminarGastoImprevisto,
} from '../hooks/useGastosImprevistos';
import type { CreateGastoImprevistoPayload, GastoImprevisto } from '../types/gastosImprevisto.types';
import { useAuthStore } from '../../../app/store/auth.store';

// ── Estado chip ──────────────────────────────────────────────
const ESTADO_CONFIG: Record<string, { label: string; color: 'warning' | 'info' | 'success' }> = {
  pendiente:            { label: 'Pendiente',           color: 'warning' },
  parcialmente_pagado:  { label: 'Parcialmente pagado', color: 'info'    },
  saldado:              { label: 'Saldado',             color: 'success' },
};

const EstadoChip: React.FC<{ estadoNombre?: string }> = ({ estadoNombre }) => {
  const cfg = estadoNombre ? ESTADO_CONFIG[estadoNombre] : null;
  if (!cfg) return null;
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
};

// ── Formulario vacío ─────────────────────────────────────────
const EMPTY_FORM: CreateGastoImprevistoPayload = {
  obra_id:        0,
  especialidad_id: 0,
  descripcion:    '',
  motivo:         '',
  monto:          0,
  forma_pago_id:  0,
  pagado_por_id:  undefined,
  fecha:          new Date().toISOString().split('T')[0],
};

// ── Página principal ─────────────────────────────────────────
export const GastosImprevistosPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.rol_id === 1;

  const { data: gastos = [], isLoading, isError, refetch } = useGastosImprevistosList() as { data: GastoImprevisto[]; isLoading: boolean; isError: boolean; refetch: () => void };
  const crearMutation    = useCrearGastoImprevisto();
  const estadoMutation   = useActualizarEstadoGasto();
  const eliminarMutation = useEliminarGastoImprevisto();

  const [openCrear,    setOpenCrear]    = useState(false);
  const [openEstado,   setOpenEstado]   = useState<GastoImprevisto | null>(null);
  const [openEliminar, setOpenEliminar] = useState<number | null>(null);
  const [form,         setForm]         = useState<CreateGastoImprevistoPayload>(EMPTY_FORM);
  const [nuevoEstado,  setNuevoEstado]  = useState<number>(0);
  const [errors,       setErrors]       = useState<string[]>([]);

  if (isLoading) return <LoadingState message="Cargando gastos imprevistos..." />;
  if (isError)   return <ErrorState title="Error" message="No se pudieron cargar los gastos imprevistos." onRetry={refetch} />;

  // ── Handlers ────────────────────────────────────────────────
  const handleCrear = async () => {
    const errs: string[] = [];
    if (!form.obra_id)         errs.push('obra_id');
    if (!form.especialidad_id) errs.push('especialidad_id');
    if (!form.descripcion)     errs.push('descripcion');
    if (!form.motivo)          errs.push('motivo');
    if (!form.monto || form.monto <= 0) errs.push('monto');
    if (!form.forma_pago_id)   errs.push('forma_pago_id');
    if (!form.fecha)           errs.push('fecha');
    if (!form.pagado_por_id && !form.pagado_por_nombre) errs.push('pagado_por');

    if (errs.length > 0) { setErrors(errs); return; }

    await crearMutation.mutateAsync(form);
    setOpenCrear(false);
    setForm(EMPTY_FORM);
    setErrors([]);
  };

  const handleEstado = async () => {
    if (!openEstado || !nuevoEstado) return;
    await estadoMutation.mutateAsync({ id: openEstado.id, payload: { estado_id: nuevoEstado } });
    setOpenEstado(null);
  };

  const handleEliminar = async () => {
    if (!openEliminar) return;
    await eliminarMutation.mutateAsync(openEliminar);
    setOpenEliminar(null);
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <AppLayout>
      <PageHeader
        title="Gastos Imprevistos"
        subtitle={`${gastos.length} gasto${gastos.length !== 1 ? 's' : ''} registrado${gastos.length !== 1 ? 's' : ''}`}
        actions={
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpenCrear(true)}>
            Nuevo gasto
          </Button>
        }
      />

      {gastos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">No hay gastos imprevistos registrados</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenCrear(true)}>
            Registrar el primero
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {gastos.map((gasto) => (
            <Grid key={gasto.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        ${gasto.monto.toLocaleString('es-AR')}
                      </Typography>
                      <EstadoChip estadoNombre={gasto.estado_nombre} />
                    </Box>
                    {isAdmin && (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => { setOpenEstado(gasto); setNuevoEstado(gasto.estado_id); }}>
                          <RefreshCw size={16} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setOpenEliminar(gasto.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>{gasto.descripcion}</Typography>
                    <Typography variant="caption" color="text.secondary">{gasto.motivo}</Typography>
                    {gasto.obra_nombre && (
                      <Chip label={gasto.obra_nombre} size="small" sx={{ width: 'fit-content', bgcolor: '#F1F5F9' }} />
                    )}
                    {gasto.especialidad_nombre && (
                      <Typography variant="caption" color="text.secondary">
                        {gasto.especialidad_nombre} · {gasto.forma_pago_nombre}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(gasto.fecha).toLocaleDateString('es-AR')}
                    </Typography>
                    {gasto.deudor_automatico && (
                      <Chip label="Deudor automático" size="small" color="warning" sx={{ width: 'fit-content' }} />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Modal Crear ── */}
      <Dialog open={openCrear} onClose={() => { setOpenCrear(false); setErrors([]); }} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar gasto imprevisto</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errors.length > 0 && (
              <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'error.main' }}>
                <AlertCircle size={16} />
                <Typography variant="caption">Campos requeridos: {errors.join(', ')}</Typography>
              </Stack>
            )}
            <TextField
              label="Obra ID" type="number" fullWidth size="small"
              error={errors.includes('obra_id')}
              value={form.obra_id || ''}
              onChange={e => setForm(f => ({ ...f, obra_id: Number(e.target.value) }))}
            />
            <TextField
              label="Especialidad ID" type="number" fullWidth size="small"
              error={errors.includes('especialidad_id')}
              value={form.especialidad_id || ''}
              onChange={e => setForm(f => ({ ...f, especialidad_id: Number(e.target.value) }))}
            />
            <TextField
              label="Descripción" fullWidth size="small"
              error={errors.includes('descripcion')}
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            />
            <TextField
              label="Motivo" fullWidth size="small"
              error={errors.includes('motivo')}
              value={form.motivo}
              onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
            />
            <TextField
              label="Monto" type="number" fullWidth size="small"
              error={errors.includes('monto')}
              value={form.monto || ''}
              onChange={e => setForm(f => ({ ...f, monto: Number(e.target.value) }))}
            />
            <TextField
              label="Forma de pago ID" type="number" fullWidth size="small"
              error={errors.includes('forma_pago_id')}
              value={form.forma_pago_id || ''}
              onChange={e => setForm(f => ({ ...f, forma_pago_id: Number(e.target.value) }))}
            />
            <TextField
              label="Pagado por (ID)" type="number" fullWidth size="small"
              error={errors.includes('pagado_por')}
              value={form.pagado_por_id || ''}
              onChange={e => setForm(f => ({ ...f, pagado_por_id: Number(e.target.value) }))}
            />
            <TextField
              label="Deudor cliente ID (opcional)" type="number" fullWidth size="small"
              value={form.deudor_cliente_id || ''}
              onChange={e => setForm(f => ({ ...f, deudor_cliente_id: Number(e.target.value) || undefined }))}
            />
            <TextField
              label="Fecha" type="date" fullWidth size="small"
              error={errors.includes('fecha')}
              value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenCrear(false); setErrors([]); }}>Cancelar</Button>
          <Button variant="contained" onClick={handleCrear} disabled={crearMutation.isPending}>
            {crearMutation.isPending ? 'Registrando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal Cambiar Estado (solo Admin) ── */}
      <Dialog open={!!openEstado} onClose={() => setOpenEstado(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar estado</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth size="small" label="Nuevo estado" sx={{ mt: 1 }}
            value={nuevoEstado}
            onChange={e => setNuevoEstado(Number(e.target.value))}
          >
            <MenuItem value={16}>Activo / Pendiente</MenuItem>
            <MenuItem value={17}>Parcialmente pagado</MenuItem>
            <MenuItem value={18}>Saldado</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEstado(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEstado} disabled={estadoMutation.isPending}>
            {estadoMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal Confirmar Eliminar (solo Admin) ── */}
      <Dialog open={!!openEliminar} onClose={() => setOpenEliminar(null)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar gasto imprevisto?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEliminar(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleEliminar} disabled={eliminarMutation.isPending}>
            {eliminarMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};