import { useEffect } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Divider, Grid,
  InputAdornment, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Briefcase, Building2, CreditCard, Mail, Package, Phone, User, Users } from 'lucide-react';
import { pagoSchema, type PagoSchemaValues } from '../schemas/pago.schema';
import type { Pago, PagoFormValues, PagoResumen } from '../types/pago.types';
import { usePresupuestosList, usePresupuestoContextoPago } from '../../presupuestos/hooks/usePresupuestos';
import { useFormasPagoList } from '../hooks/useFormasPago';
import { usePagosByTrabajador } from '../hooks/usePagos';

interface Props {
  initialData?: Pago | null;
  presupuestoIdFijo?: number;
  trabajadorIdFijo?: number;
  onSubmit: (values: PagoFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

// Estado ID = 5 → Confirmado (único estado que permite pagos)
const ESTADO_ID_CONFIRMADO = 5;

const ESTADOS = ['Pendiente', 'Pagado', 'Parcial', 'Cancelado'];

function toFormDefaults(
  initialData?: Pago | null,
  presupuestoIdFijo?: number,
  trabajadorIdFijo?: number,
): PagoFormValues {
  return {
    presupuesto_id: initialData?.presupuesto_id ?? presupuestoIdFijo ?? '',
    trabajador_id:  initialData?.trabajador_id  ?? trabajadorIdFijo  ?? '',
    monto:          initialData?.monto          ?? '',
    fecha:          initialData?.fecha
      ? initialData.fecha.split('T')[0]
      : new Date().toISOString().split('T')[0],
    motivo:         initialData?.motivo         ?? '',
    forma_pago_id:  initialData?.forma_pago_id  ?? '',
    estado:         initialData?.estado         ?? 'Pendiente',
  };
}

function estadoChipStyles(estado: string) {
  switch (estado) {
    case 'Pagado':    return { bgcolor: '#DCFCE7', color: '#15803D' };
    case 'Parcial':   return { bgcolor: '#FEF9C3', color: '#A16207' };
    case 'Pendiente': return { bgcolor: '#FEE2E2', color: '#DC2626' };
    default:          return { bgcolor: '#F1F5F9', color: '#475569' };
  }
}

function laborEstadoStyles(estadoNombre?: string | null) {
  switch (estadoNombre) {
    case 'Completada': return { bgcolor: '#DCFCE7', color: '#15803D' };
    case 'En curso':   return { bgcolor: '#DBEAFE', color: '#1D4ED8' };
    case 'Pausada':    return { bgcolor: '#FEF9C3', color: '#A16207' };
    case 'Cancelada':  return { bgcolor: '#FEE2E2', color: '#DC2626' };
    default:           return { bgcolor: '#F1F5F9', color: '#475569' };
  }
}

export function PagoForm({
  initialData,
  presupuestoIdFijo,
  trabajadorIdFijo,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PagoSchemaValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: toFormDefaults(initialData, presupuestoIdFijo, trabajadorIdFijo) as unknown as PagoSchemaValues,
  });

  const { data: presupuestos = [] } = usePresupuestosList();
  const { data: formasPago = [] }   = useFormasPagoList();

  // Solo presupuestos en estado Confirmado (id = 5)
  const presupuestosHabilitados = presupuestoIdFijo
    ? presupuestos  // si viene fijo, no filtramos (ya fue validado upstream)
    : presupuestos.filter((p) => p.estado_id === ESTADO_ID_CONFIRMADO);

  const presupuestoIdWatch = useWatch({ control, name: 'presupuesto_id' });
  const trabajadorIdWatch  = useWatch({ control, name: 'trabajador_id' });
  const montoWatch         = useWatch({ control, name: 'monto' });

  const { data: contexto, isLoading: isLoadingContexto } = usePresupuestoContextoPago(
    Number(presupuestoIdWatch) || 0,
  );

  const { data: historialData, isLoading: isLoadingHistorial } = usePagosByTrabajador(
    Number(trabajadorIdWatch) || 0,
  );

  const historial       = historialData?.data ?? [];
  const resumen: PagoResumen | undefined = historialData?.resumen;
  const saldoPendiente  = resumen?.saldo_pendiente ?? 0;
  const presupuestoCancelado =
    Number(trabajadorIdWatch) > 0 &&
    !isLoadingHistorial &&
    saldoPendiente === 0 &&
    historial.length > 0;

  // Validación dinámica: monto no puede superar el saldo pendiente
  useEffect(() => {
    const monto = Number(montoWatch);
    if (!monto || saldoPendiente === 0) return;
    if (monto > saldoPendiente) {
      setError('monto', {
        type: 'manual',
        message: `El monto supera el saldo pendiente ($${saldoPendiente.toLocaleString('es-AR')})`,
      });
    } else {
      clearErrors('monto');
    }
  }, [montoWatch, saldoPendiente, setError, clearErrors]);

  // Auto-setear trabajador cuando cambia el presupuesto
  useEffect(() => {
    if (contexto?.trabajador?.id && !trabajadorIdFijo) {
      setValue('trabajador_id', contexto.trabajador.id);
    }
  }, [contexto, trabajadorIdFijo, setValue]);

  useEffect(() => {
    reset(toFormDefaults(initialData, presupuestoIdFijo, trabajadorIdFijo) as unknown as PagoSchemaValues);
  }, [initialData, presupuestoIdFijo, trabajadorIdFijo, reset]);

  const handleFormSubmit = (v: PagoSchemaValues) => {
    const monto = Number(v.monto);
    if (saldoPendiente > 0 && monto > saldoPendiente) {
      setError('monto', {
        type: 'manual',
        message: `El monto supera el saldo pendiente ($${saldoPendiente.toLocaleString('es-AR')})`,
      });
      return;
    }
    onSubmit(v as unknown as PagoFormValues);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>

        {/* ── PASO 1: SELECCIÓN DE PRESUPUESTO ── */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1, color: '#64748B' }}>
          1 · SELECCIONÁ EL PRESUPUESTO
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
          Solo se muestran presupuestos <strong>Confirmados</strong>. El sistema completará
          automáticamente el trabajador, labor, equipo y cliente asociados.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="presupuesto_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Presupuesto *"
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  disabled={!!presupuestoIdFijo}
                  error={!!errors.presupuesto_id}
                  helperText={
                    errors.presupuesto_id?.message ??
                    (presupuestosHabilitados.length === 0
                      ? 'No hay presupuestos confirmados disponibles'
                      : '')
                  }
                >
                  <MenuItem value="">Seleccionar presupuesto</MenuItem>
                  {presupuestosHabilitados.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nombre || `Presupuesto #${p.id}`}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        </Grid>

        {/* ── CONTEXTO AUTOCOMPLETADO ── */}
        {Number(presupuestoIdWatch) > 0 && (
          <Box sx={{ mb: 3 }}>
            {isLoadingContexto ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              contexto && (
                <Grid container spacing={2}>

                  {/* Labor */}
                  {contexto.labor && (
                    <Grid size={{ xs: 12, md: contexto.cliente ? 6 : 12 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', height: '100%' }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <Briefcase size={13} color="#64748B" />
                          <Typography variant="caption" fontWeight={700} sx={{ color: '#64748B' }}>LABOR</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={600}>{contexto.labor.nombre ?? '-'}</Typography>
                          <Chip
                            label={contexto.labor.estado_nombre ?? 'Sin estado'}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.65rem', ...laborEstadoStyles(contexto.labor.estado_nombre) }}
                          />
                        </Stack>
                        {contexto.obra && (
                          <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
                            Obra: {contexto.obra.nombre}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Cliente */}
                  {contexto.cliente && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', height: '100%' }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <Building2 size={13} color="#64748B" />
                          <Typography variant="caption" fontWeight={700} sx={{ color: '#64748B' }}>CLIENTE</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
                          {contexto.cliente.nombre} {contexto.cliente.apellido}
                        </Typography>
                        <Stack spacing={0.4}>
                          {contexto.cliente.telefono && (
                            <Stack direction="row" alignItems="center" gap={0.75}>
                              <Phone size={11} color="#94A3B8" />
                              <Typography variant="caption" sx={{ color: '#64748B' }}>{contexto.cliente.telefono}</Typography>
                            </Stack>
                          )}
                          {contexto.cliente.email && (
                            <Stack direction="row" alignItems="center" gap={0.75}>
                              <Mail size={11} color="#94A3B8" />
                              <Typography variant="caption" sx={{ color: '#64748B' }}>{contexto.cliente.email}</Typography>
                            </Stack>
                          )}
                          {contexto.cliente.dni_cuit && (
                            <Stack direction="row" alignItems="center" gap={0.75}>
                              <CreditCard size={11} color="#94A3B8" />
                              <Typography variant="caption" sx={{ color: '#64748B' }}>{contexto.cliente.dni_cuit}</Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  )}

                  {/* Trabajador jefe */}
                  {contexto.trabajador && (
                    <Grid size={{ xs: 12, md: contexto.equipo.length > 0 ? 4 : 12 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', height: '100%' }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <User size={13} color="#64748B" />
                          <Typography variant="caption" fontWeight={700} sx={{ color: '#64748B' }}>RESPONSABLE</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Typography variant="caption" fontWeight={700} sx={{ color: '#fff' }}>
                              {contexto.trabajador.nombre?.[0]}{contexto.trabajador.apellido?.[0]}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {contexto.trabajador.nombre} {contexto.trabajador.apellido}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              {contexto.trabajador.especialidad ?? 'Sin especialidad'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>
                  )}

                  {/* Equipo */}
                  {contexto.equipo.length > 0 && (
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', height: '100%' }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <Users size={13} color="#64748B" />
                          <Typography variant="caption" fontWeight={700} sx={{ color: '#64748B' }}>
                            EQUIPO ({contexto.equipo.length})
                          </Typography>
                        </Stack>
                        <Stack spacing={0.75} sx={{ maxHeight: 130, overflowY: 'auto' }}>
                          {contexto.equipo.map((m: any) => (
                            <Stack key={m.id} direction="row" alignItems="center" gap={1}>
                              <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: '#475569', fontSize: '0.6rem' }}>
                                  {m.nombre[0]}{m.apellido?.[0]}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.2 }}>
                                  {m.nombre} {m.apellido}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>{m.especialidad ?? '-'}</Typography>
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                  )}

                  {/* Materiales */}
                  {contexto.materiales.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <Package size={13} color="#64748B" />
                          <Typography variant="caption" fontWeight={700} sx={{ color: '#64748B' }}>
                            MATERIALES ({contexto.materiales.length})
                          </Typography>
                        </Stack>
                        <Stack spacing={0.5} sx={{ maxHeight: 160, overflowY: 'auto' }}>
                          {contexto.materiales.map((m: any) => (
                            <Stack
                              key={m.id}
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ p: 1, borderRadius: 1.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}
                            >
                              <Typography variant="body2" fontWeight={500}>{m.material_nombre}</Typography>
                              <Stack direction="row" alignItems="center" gap={2}>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>{m.cantidad} {m.unidad}</Typography>
                                <Typography variant="body2" fontWeight={600}>${Number(m.subtotal).toLocaleString('es-AR')}</Typography>
                              </Stack>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                  )}

                </Grid>
              )
            )}
          </Box>
        )}

        {/* ── SITUACIÓN FINANCIERA ── */}
        {Number(trabajadorIdWatch) > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
              SITUACIÓN FINANCIERA
            </Typography>

            {isLoadingHistorial ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {presupuestoCancelado && (
                  <Alert
                    icon={<CheckCircle2 size={18} />}
                    severity="success"
                    sx={{ mb: 2, borderRadius: 2, fontWeight: 600 }}
                  >
                    Presupuesto cancelado en su totalidad — no quedan saldos pendientes.
                  </Alert>
                )}

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#DCFCE7', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontWeight: 600 }}>PAGADO</Typography>
                      <Typography variant="body1" fontWeight={800} sx={{ color: '#15803D' }}>
                        ${(resumen?.total_pagado ?? 0).toLocaleString('es-AR')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF9C3', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#854D0E', display: 'block', fontWeight: 600 }}>PARCIAL</Typography>
                      <Typography variant="body1" fontWeight={800} sx={{ color: '#A16207' }}>
                        ${(resumen?.total_parcial ?? 0).toLocaleString('es-AR')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{
                      p: 1.5, borderRadius: 2, textAlign: 'center',
                      bgcolor: saldoPendiente === 0 ? '#F1F5F9' : '#FEE2E2',
                    }}>
                      <Typography variant="caption" sx={{ color: saldoPendiente === 0 ? '#475569' : '#991B1B', display: 'block', fontWeight: 600 }}>
                        SALDO PENDIENTE
                      </Typography>
                      <Typography variant="body1" fontWeight={800} sx={{ color: saldoPendiente === 0 ? '#475569' : '#DC2626' }}>
                        ${saldoPendiente.toLocaleString('es-AR')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0F172A', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontWeight: 600 }}>COBRADO</Typography>
                      <Typography variant="body1" fontWeight={800} sx={{ color: '#FFFFFF' }}>
                        ${(resumen?.total_cobrado ?? 0).toLocaleString('es-AR')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="caption" fontWeight={600} sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                  ÚLTIMOS PAGOS ({historial.length})
                </Typography>

                {historial.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', py: 1 }}>
                    Sin pagos registrados
                  </Typography>
                ) : (
                  <Stack spacing={1} sx={{ maxHeight: 240, overflowY: 'auto' }}>
                    {historial.map((p) => (
                      <Box
                        key={p.id}
                        sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          p: 1.5, borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                            {p.presupuesto_nombre ?? `Presupuesto #${p.presupuesto_id}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            {new Date(p.fecha).toLocaleDateString('es-AR')} · {p.forma_pago_nombre ?? 'Sin forma de pago'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={700}>
                            ${Number(p.monto).toLocaleString('es-AR')}
                          </Typography>
                          <Chip
                            label={p.estado}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.65rem', ...estadoChipStyles(p.estado) }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </>
            )}
          </Box>
        )}

        {/* ── PASO 2: DATOS DEL PAGO — solo si hay saldo pendiente ── */}
        {!presupuestoCancelado && Number(presupuestoIdWatch) > 0 && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1, color: '#64748B' }}>
              2 · DATOS DEL PAGO
            </Typography>
            {saldoPendiente > 0 && (
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
                Saldo disponible:{' '}
                <strong style={{ color: '#DC2626' }}>${saldoPendiente.toLocaleString('es-AR')}</strong>
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="monto"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Monto *"
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      inputProps={{ max: saldoPendiente > 0 ? saldoPendiente : undefined, min: 1 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      error={!!errors.monto}
                      helperText={
                        errors.monto?.message ??
                        (saldoPendiente > 0 ? `Máximo: $${saldoPendiente.toLocaleString('es-AR')}` : '')
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="fecha"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Fecha *"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.fecha}
                      helperText={errors.fecha?.message ?? ''}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Estado"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.estado}
                      helperText={errors.estado?.message ?? ''}
                    >
                      {ESTADOS.map((e) => (
                        <MenuItem key={e} value={e}>{e}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="forma_pago_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Forma de pago"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? '' : Number(e.target.value))
                      }
                    >
                      <MenuItem value="">Sin especificar</MenuItem>
                      {formasPago.map((f) => (
                        <MenuItem key={f.id} value={f.id}>{f.nombre}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="motivo"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Motivo" />
                  )}
                />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  isSubmitting ||
                  (saldoPendiente > 0 && Number(montoWatch) > saldoPendiente)
                }
              >
                {isSubmitting ? 'Guardando...' : 'Guardar pago'}
              </Button>
            </Stack>
          </>
        )}

      </Box>
    </Paper>
  );
}