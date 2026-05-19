import { useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, LinearProgress,
  MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { User, CreditCard, Phone, Briefcase, Star, CalendarCheck } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { laborSchema, type LaborSchemaValues } from '../schemas/labor.schema';
import type { Labor, LaborFormValues } from '../types/labor.types';
import { useObrasList } from '../../obras/hooks/useObras';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { usePagosByTrabajador } from '../../pagos/hooks/usePagos';
import { usePresupuestosList } from '../../presupuestos/hooks/usePresupuestos';
import { useLaboresList } from '../hooks/useLabores';
import { PagoEstadoChip } from '../../pagos/components/PagoEstadoChip';
import { estadoApi } from '../../../services/api/estado.api';
import { useQuery } from '@tanstack/react-query';

interface LaborFormProps {
  initialData?: Labor | null;
  obraIdFijo?: number;
  onSubmit: (values: LaborFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const PROGRESO_MAP: Record<string, number> = {
  'Planificada': 0, 'Labor en proceso': 25,
  'Avanzada': 50, 'Muy avanzada': 75, 'Finalizada': 100,
};

function getProgressColor(progreso: number): string {
  if (progreso === 100) return '#16A34A';
  if (progreso >= 75) return '#2563EB';
  if (progreso >= 50) return '#F59E0B';
  if (progreso >= 25) return '#EA580C';
  return '#94A3B8';
}

function getAsistenciaColor(pct: number): string {
  if (pct >= 80) return '#16A34A';
  if (pct >= 50) return '#F59E0B';
  return '#DC2626';
}

function toDateInput(value?: string | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

function toFormDefaults(initialData?: Labor | null, obraIdFijo?: number): LaborFormValues {
  return {
    nombre: initialData?.nombre ?? '',
    descripcion: initialData?.descripcion ?? '',
    obra_id: initialData?.obra_id ?? obraIdFijo ?? '',
    trabajador_id: initialData?.trabajador_id ?? '',
    especialidad_id: initialData?.especialidad_id ?? '',
    estado_id: initialData?.estado_id ?? '',
    fecha_inicio_estimada: toDateInput(initialData?.fecha_inicio_estimada),
    fecha_fin_estimada: toDateInput(initialData?.fecha_fin_estimada),
    fecha_inicio_real: toDateInput(initialData?.fecha_inicio_real),
    fecha_fin_real: toDateInput(initialData?.fecha_fin_real),
    usuario_creador_id: initialData?.usuario_creador_id ?? 2,
  };
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ color: '#F59E0B', mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

export function LaborForm({ initialData, obraIdFijo, onSubmit, isSubmitting = false }: LaborFormProps) {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<LaborSchemaValues>({
    resolver: zodResolver(laborSchema),
    defaultValues: toFormDefaults(initialData, obraIdFijo),
  });

  const { data: obras = [] } = useObrasList();
  const { data: todosLosTrabajadores = [] } = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: labores = [] } = useLaboresList();
  const { data: todosPresupuestos = [] } = usePresupuestosList();

  const { data: estadosLabor = [] } = useQuery({
    queryKey: ['estados', 'labor'],
    queryFn: () => estadoApi.getByAmbito('labor'),
  });

  const trabajadores = todosLosTrabajadores.filter((t) => t.jefe_id === null);

  const trabajadorIdSeleccionado = watch('trabajador_id');
  const estadoIdSeleccionado = watch('estado_id');

  const trabajadorSeleccionado = trabajadores.find((t) => t.id === Number(trabajadorIdSeleccionado));
  const especialidadNombre = especialidades.find((e) => e.id === trabajadorSeleccionado?.especialidad_id)?.nombre;
  const estadoSeleccionado = estadosLabor.find((e) => e.id === Number(estadoIdSeleccionado));
  const progreso = PROGRESO_MAP[estadoSeleccionado?.nombre ?? ''] ?? 0;
  const progressColor = getProgressColor(progreso);

  const asistenciaPct = Number(trabajadorSeleccionado?.porcentaje_asistencia_mes ?? 0);
  const asistenciaColor = getAsistenciaColor(asistenciaPct);
  const puntos = trabajadorSeleccionado?.puntos ?? 0;

  const { data: pagosRaw } = usePagosByTrabajador(
    trabajadorSeleccionado ? Number(trabajadorIdSeleccionado) : 0
  );
  const pagosDelTrabajador = pagosRaw?.data ?? [];

  const laborasDelTrabajador = labores.filter(
    (l) => l.trabajador_id === Number(trabajadorIdSeleccionado)
  );
  const presupuestosDelTrabajador = todosPresupuestos.filter((p) =>
    laborasDelTrabajador.some((l) => l.id === p.labor_id)
  );

  const totalPresupuestado = presupuestosDelTrabajador.reduce(
    (acc, p) => acc + Number(p.total_estimado ?? 0), 0
  );
  const totalPagado = pagosDelTrabajador
    .filter((p) => p.estado === 'Pagado')
    .reduce((acc, p) => acc + Number(p.monto), 0);
  const saldoPendiente = Math.max(0, totalPresupuestado - totalPagado);

  useEffect(() => {
    if (trabajadorSeleccionado?.especialidad_id) {
      setValue('especialidad_id', trabajadorSeleccionado.especialidad_id);
    } else {
      setValue('especialidad_id', '');
    }
  }, [trabajadorIdSeleccionado, trabajadorSeleccionado, setValue]);

  useEffect(() => {
    if (obras.length > 0) reset(toFormDefaults(initialData, obraIdFijo));
  }, [initialData, obras, reset, obraIdFijo]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as LaborFormValues))}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nombre de la labor" error={!!errors.nombre} helperText={errors.nombre?.message ?? ''} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="obra_id" control={control} render={({ field }) => (
              <TextField select fullWidth label="Obra" value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={!!obraIdFijo}>
                <MenuItem value="">Seleccionar</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller name="descripcion" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Descripción" />
            )} />
          </Grid>

          {/* Selector de trabajador con badges */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="trabajador_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label="Trabajador jefe asignado"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 320 } } } }}
              >
                <MenuItem value="">Sin asignar</MenuItem>
                {trabajadores.map((t) => {
                  const pct = Number(t.porcentaje_asistencia_mes ?? 0);
                  const pts = t.puntos ?? 0;
                  const espNombre = especialidades.find((e) => e.id === t.especialidad_id)?.nombre;
                  return (
                    <MenuItem key={t.id} value={t.id}>
                      <Box sx={{ width: '100%' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={600}>
                            {t.nombre} {t.apellido}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            <Chip
                              label={`${pct}%`} size="small"
                              icon={<CalendarCheck size={10} />}
                              sx={{
                                height: 18, fontSize: 10, fontWeight: 700,
                                bgcolor: `${getAsistenciaColor(pct)}18`,
                                color: getAsistenciaColor(pct),
                              }}
                            />
                            <Chip
                              label={`${pts} pts`} size="small"
                              icon={<Star size={10} />}
                              sx={{
                                height: 18, fontSize: 10, fontWeight: 700,
                                bgcolor: 'rgba(245,158,11,0.1)',
                                color: '#B45309',
                              }}
                            />
                          </Stack>
                        </Stack>
                        {espNombre && (
                          <Typography variant="caption" color="text.secondary">
                            {espNombre}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="estado_id" control={control} render={({ field }) => (
              <TextField select fullWidth label="Estado de la labor" value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}>
                <MenuItem value="">Seleccionar</MenuItem>
                {estadosLabor.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
              </TextField>
            )} />

            {estadoIdSeleccionado !== '' && estadoIdSeleccionado !== undefined && (
              <Box sx={{ mt: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Progreso de la labor
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: progressColor }}>
                    {progreso}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progreso} sx={{
                  height: 8, borderRadius: 4, backgroundColor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: progressColor },
                }} />
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_inicio_estimada" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label="Inicio estimado" InputLabelProps={{ shrink: true }} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="fecha_fin_estimada" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="date" label="Fin estimado" InputLabelProps={{ shrink: true }} />
            )} />
          </Grid>

          {initialData && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="fecha_inicio_real" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth type="date" label="Inicio real" InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="fecha_fin_real" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth type="date" label="Fin real" InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
            </>
          )}
        </Grid>

        {/* Cards informativas del trabajador seleccionado */}
        {trabajadorSeleccionado && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
              INFORMACIÓN DEL TRABAJADOR
            </Typography>

            {/* Badges resumen */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                icon={<CalendarCheck size={14} />}
                label={`Asistencia este mes: ${asistenciaPct}%`}
                sx={{
                  fontWeight: 700, fontSize: 12,
                  bgcolor: `${asistenciaColor}18`, color: asistenciaColor,
                }}
              />
              <Chip
                icon={<Star size={14} />}
                label={`${puntos} puntos acumulados`}
                sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'rgba(245,158,11,0.1)', color: '#B45309' }}
              />
              {especialidadNombre && (
                <Chip
                  icon={<Briefcase size={14} />}
                  label={especialidadNombre}
                  sx={{ fontWeight: 700, fontSize: 12, bgcolor: '#EFF6FF', color: '#1D4ED8' }}
                />
              )}
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
                      DATOS PERSONALES
                    </Typography>
                    <Stack spacing={1.5}>
                      <InfoCard icon={<User size={14} />} label="Nombre completo" value={`${trabajadorSeleccionado.nombre} ${trabajadorSeleccionado.apellido}`} />
                      <InfoCard icon={<CreditCard size={14} />} label="DNI" value={trabajadorSeleccionado.dni} />
                      <InfoCard icon={<Phone size={14} />} label="Teléfono" value={trabajadorSeleccionado.telefono || '-'} />
                      <InfoCard icon={<Briefcase size={14} />} label="Especialidad" value={especialidadNombre || '-'} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
                      ESTADO ADMINISTRATIVO
                    </Typography>
                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Total presupuestado</Typography>
                        <Typography variant="body2" fontWeight={700}>${totalPresupuestado.toLocaleString('es-AR')}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Total pagado</Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main">${totalPagado.toLocaleString('es-AR')}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Saldo pendiente</Typography>
                        <Typography variant="body2" fontWeight={700} color={saldoPendiente > 0 ? 'warning.main' : 'success.main'}>
                          ${saldoPendiente.toLocaleString('es-AR')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Pagos registrados</Typography>
                        <Typography variant="body2" fontWeight={700}>{pagosDelTrabajador.length}</Typography>
                      </Box>
                    </Stack>

                    {pagosDelTrabajador.length > 0 && (
                      <>
                        <Divider sx={{ mb: 1.5 }} />
                        <Typography variant="caption" fontWeight={700} sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                          ÚLTIMOS PAGOS
                        </Typography>
                        <Stack spacing={1}>
                          {pagosDelTrabajador.slice(0, 3).map((p) => (
                            <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="caption" fontWeight={600}>${Number(p.monto).toLocaleString('es-AR')}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{new Date(p.fecha).toLocaleDateString('es-AR')}</Typography>
                              </Box>
                              <PagoEstadoChip estado={p.estado} />
                            </Box>
                          ))}
                        </Stack>
                      </>
                    )}

                    {pagosDelTrabajador.length === 0 && (
                      <Typography variant="caption" color="text.secondary">Sin pagos registrados.</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar labor'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}