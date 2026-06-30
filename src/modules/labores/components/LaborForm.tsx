
// import { useEffect } from 'react';
// import {
//   Box, Button, Card, CardContent, Chip, Divider, Grid, LinearProgress,
//   MenuItem, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup,
//   Typography, useTheme,
// } from '@mui/material';
// import { User, CreditCard, Phone, Briefcase, Star, CalendarCheck, Zap, ClipboardList, Lock } from 'lucide-react';
// import { Controller, useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useTranslation } from 'react-i18next';
// import { laborSchema, type LaborSchemaValues } from '../schemas/labor.schema';
// import type { Labor, LaborFormValues } from '../types/labor.types';
// import { useObrasList } from '../../obras/hooks/useObras';
// import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
// import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
// import { usePagosByTrabajador } from '../../pagos/hooks/usePagos';
// import { usePresupuestosList } from '../../presupuestos/hooks/usePresupuestos';
// import { useLaboresList } from '../hooks/useLabores';
// import { useUnidadesMedida, useLaborPresupuestos } from '../hooks/useLaborPresupuestos';
// import { PagoEstadoChip } from '../../pagos/components/PagoEstadoChip';
// import { estadoApi } from '../../../services/api/estado.api';
// import { useQuery } from '@tanstack/react-query';

// const ESTADO_SIN_ASIGNAR = 29;

// interface LaborFormProps {
//   initialData?: Labor | null;
//   obraIdFijo?: number;
//   onSubmit: (values: LaborFormValues) => void | Promise<void>;
//   isSubmitting?: boolean;
// }

// const PROGRESO_MAP: Record<string, number> = {
//   'Planificada': 0, 'Labor en proceso': 25,
//   'Avanzada': 50, 'Muy avanzada': 75, 'Finalizada': 100,
// };

// function getProgressColor(progreso: number): string {
//   if (progreso === 100) return '#16A34A';
//   if (progreso >= 75) return '#2563EB';
//   if (progreso >= 50) return '#F59E0B';
//   if (progreso >= 25) return '#EA580C';
//   return '#94A3B8';
// }

// function getAsistenciaColor(pct: number): string {
//   if (pct >= 80) return '#16A34A';
//   if (pct >= 50) return '#F59E0B';
//   return '#DC2626';
// }

// function toDateInput(value?: string | null): string {
//   if (!value) return '';
//   return value.split('T')[0];
// }

// function toFormDefaults(initialData?: Labor | null, obraIdFijo?: number): LaborSchemaValues {
//   return {
//     nombre: initialData?.nombre ?? '',
//     descripcion: initialData?.descripcion ?? '',
//     obra_id: initialData?.obra_id ?? obraIdFijo ?? '',
//     trabajador_id: initialData?.trabajador_id ?? '',
//     especialidad_id: initialData?.especialidad_id ?? '',
//     estado_id: initialData?.estado_id ?? '',
//     modo: (initialData?.modo as 'rapido' | 'cotizacion') ?? 'rapido',
//     unidad_id: initialData?.unidad_id ?? '',
//     cantidad: initialData?.cantidad ? Math.round(Number(initialData.cantidad)) : '',
//     fecha_inicio_estimada: toDateInput(initialData?.fecha_inicio_estimada),
//     fecha_fin_estimada: toDateInput(initialData?.fecha_fin_estimada),
//     fecha_inicio_real: toDateInput(initialData?.fecha_inicio_real),
//     fecha_fin_real: toDateInput(initialData?.fecha_fin_real),
//     usuario_creador_id: initialData?.usuario_creador_id ?? 2,
//   };
// }

// function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
//   return (
//     <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
//       <Box sx={{ color: '#F59E0B', mt: 0.3 }}>{icon}</Box>
//       <Box>
//         <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{label}</Typography>
//         <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>{value}</Typography>
//       </Box>
//     </Box>
//   );
// }

// export function LaborForm({ initialData, obraIdFijo, onSubmit, isSubmitting = false }: LaborFormProps) {
//   const theme = useTheme();
//   const { t } = useTranslation();
//   const esEdicion = Boolean(initialData);

//   const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<LaborSchemaValues>({
//     resolver: zodResolver(laborSchema),
//     defaultValues: toFormDefaults(initialData, obraIdFijo),
//   });

//   const { data: obras = [] } = useObrasList();
//   const { data: todosLosTrabajadores = [] } = useTrabajadoresList();
//   const { data: especialidades = [] } = useEspecialidadesList();
//   const { data: labores = [] } = useLaboresList();
//   const { data: todosPresupuestos = [] } = usePresupuestosList();
//   const { data: unidades = [] } = useUnidadesMedida();

//   const { data: presupuestosExistentes = [] } = useLaborPresupuestos(initialData?.id ?? 0);
//   const modoBloquado = esEdicion && (
//     initialData?.estado_id === ESTADO_SIN_ASIGNAR ||
//     presupuestosExistentes.length > 0
//   );
//   const obraBloquada = !!obraIdFijo || (esEdicion && presupuestosExistentes.length > 0);

//   const { data: estadosLabor = [] } = useQuery({
//     queryKey: ['estados', 'labor'],
//     queryFn: () => estadoApi.getByAmbito('labor'),
//   });

//   const trabajadores = todosLosTrabajadores.filter((tr) => tr.jefe_id === null);

//   const modoSeleccionado = watch('modo');
//   const trabajadorIdSeleccionado = watch('trabajador_id');
//   const estadoIdSeleccionado = watch('estado_id');
//   const especialidadIdSeleccionada = watch('especialidad_id');

//   const trabajadorSeleccionado = trabajadores.find((tr) => tr.id === Number(trabajadorIdSeleccionado));
//   const especialidadNombre = especialidades.find((e) => e.id === (trabajadorSeleccionado?.especialidad_id ?? Number(especialidadIdSeleccionada)))?.nombre;
//   const estadoSeleccionado = estadosLabor.find((e) => e.id === Number(estadoIdSeleccionado));
//   const progreso = PROGRESO_MAP[estadoSeleccionado?.nombre ?? ''] ?? 0;
//   const progressColor = getProgressColor(progreso);

//   const asistenciaPct = Number(trabajadorSeleccionado?.porcentaje_asistencia_mes ?? 0);
//   const asistenciaColor = getAsistenciaColor(asistenciaPct);
//   const puntos = trabajadorSeleccionado?.puntos ?? 0;

//   const { data: pagosRaw } = usePagosByTrabajador(
//     trabajadorSeleccionado ? Number(trabajadorIdSeleccionado) : 0
//   );
//   const pagosDelTrabajador = pagosRaw?.data ?? [];

//   const laborasDelTrabajador = labores.filter(
//     (l: Labor) => l.trabajador_id === Number(trabajadorIdSeleccionado)
//   );
//   const presupuestosDelTrabajador = todosPresupuestos.filter((p) =>
//     laborasDelTrabajador.some((l: Labor) => l.id === p.labor_id)
//   );

//   const totalPresupuestado = presupuestosDelTrabajador.reduce(
//     (acc, p) => acc + Number(p.total_estimado ?? 0), 0
//   );
//   const totalPagado = pagosDelTrabajador
//     .filter((p) => p.estado === 'Pagado')
//     .reduce((acc, p) => acc + Number(p.monto), 0);
//   const saldoPendiente = Math.max(0, totalPresupuestado - totalPagado);

//   // Auto-cargar especialidad desde trabajador — pero permite edición manual
//   useEffect(() => {
//     if (trabajadorSeleccionado?.especialidad_id) {
//       setValue('especialidad_id', trabajadorSeleccionado.especialidad_id);
//     }
//     // No limpiamos si no tiene especialidad — el usuario puede haberla seteado manualmente
//   }, [trabajadorIdSeleccionado, trabajadorSeleccionado, setValue]);

//   useEffect(() => {
//     if (obras.length > 0) reset(toFormDefaults(initialData, obraIdFijo));
//   }, [initialData, obras, reset, obraIdFijo]);

//   useEffect(() => {
//     if (!esEdicion && modoSeleccionado === 'cotizacion') {
//       setValue('trabajador_id', '');
//       setValue('estado_id', '');
//     }
//   }, [modoSeleccionado, setValue, esEdicion]);

//   const selectorModo = (
//     <Grid size={{ xs: 12 }}>
//       <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
//         {t('labor_form.modo_titulo')}
//       </Typography>
//       <Controller name="modo" control={control} render={({ field }) => (
//         <ToggleButtonGroup
//           exclusive
//           value={field.value}
//           onChange={(_, val) => { if (val && !modoBloquado) field.onChange(val); }}
//           sx={{ width: '100%', opacity: modoBloquado ? 0.7 : 1 }}
//         >
//           <ToggleButton value="rapido" sx={{ flex: 1, gap: 1, py: 1.5 }} disabled={modoBloquado}>
//             <Zap size={16} />
//             <Box textAlign="left">
//               <Typography variant="body2" fontWeight={700}>{t('labor_form.modo_rapido')}</Typography>
//               <Typography variant="caption" color="text.secondary">{t('labor_form.modo_rapido_desc')}</Typography>
//             </Box>
//           </ToggleButton>
//           <ToggleButton value="cotizacion" sx={{ flex: 1, gap: 1, py: 1.5 }} disabled={modoBloquado}>
//             <ClipboardList size={16} />
//             <Box textAlign="left">
//               <Typography variant="body2" fontWeight={700}>{t('labor_form.modo_cotizacion')}</Typography>
//               <Typography variant="caption" color="text.secondary">{t('labor_form.modo_cotizacion_desc')}</Typography>
//             </Box>
//           </ToggleButton>
//         </ToggleButtonGroup>
//       )} />
//       {modoBloquado && (
//         <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.75 }}>
//           <Lock size={11} color={theme.palette.text.disabled} />
//           <Typography variant="caption" color="text.disabled">
//             {presupuestosExistentes.length > 0
//               ? t('labor_form.modo_bloqueado_presupuestos')
//               : t('labor_form.modo_bloqueado_sin_asignar')}
//           </Typography>
//         </Stack>
//       )}
//       <Divider sx={{ mt: 2 }} />
//     </Grid>
//   );

//   return (
//     <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
//       <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as LaborFormValues))}>
//         <Grid container spacing={2}>

//           {selectorModo}

//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="nombre" control={control} render={({ field }) => (
//               <TextField {...field} fullWidth label={t('labor_form.nombre')}
//                 error={!!errors.nombre} helperText={errors.nombre?.message ?? ''} />
//             )} />
//           </Grid>

//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="obra_id" control={control} render={({ field }) => (
//               <TextField select fullWidth label={t('labor_form.obra')} value={field.value}
//                 onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
//                 disabled={obraBloquada}>
//                 <MenuItem value="">{t('labor_form.seleccionar')}</MenuItem>
//                 {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
//               </TextField>
//             )} />
//             {esEdicion && presupuestosExistentes.length > 0 && (
//               <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
//                 <Lock size={11} color={theme.palette.text.disabled} />
//                 <Typography variant="caption" color="text.disabled">
//                   {t('labor_form.obra_bloqueada')}
//                 </Typography>
//               </Stack>
//             )}
//           </Grid>

//           <Grid size={{ xs: 12 }}>
//             <Controller name="descripcion" control={control} render={({ field }) => (
//               <TextField {...field} fullWidth multiline minRows={3} label={t('labor_form.descripcion')} />
//             )} />
//           </Grid>

//           {/* Especialidad — siempre visible, pre-cargada desde trabajador en modo rápido */}
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="especialidad_id" control={control} render={({ field }) => (
//               <TextField
//                 select fullWidth
//                 label={t('labor_form.especialidad')}
//                 value={field.value}
//                 onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
//               >
//                 <MenuItem value="">{t('labor_form.sin_especialidad')}</MenuItem>
//                 {especialidades.map((e) => (
//                   <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
//                 ))}
//               </TextField>
//             )} />
//             {modoSeleccionado === 'rapido' && trabajadorSeleccionado?.especialidad_id && (
//               <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
//                 <Briefcase size={11} color={theme.palette.text.disabled} />
//                 <Typography variant="caption" color="text.disabled">
//                   {t('labor_form.especialidad_heredada')}
//                 </Typography>
//               </Stack>
//             )}
//           </Grid>

//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="unidad_id" control={control} render={({ field }) => (
//               <TextField select fullWidth label={t('labor_form.unidad')}
//                 value={field.value}
//                 onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}>
//                 <MenuItem value="">{t('labor_form.sin_unidad')}</MenuItem>
//                 {unidades.map((u) => (
//                   <MenuItem key={u.id} value={u.id}>{u.nombre} ({u.simbolo})</MenuItem>
//                 ))}
//               </TextField>
//             )} />
//           </Grid>

//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="cantidad" control={control} render={({ field }) => (
//               <TextField
//                 fullWidth type="number"
//                 label={t('labor_form.cantidad')}
//                 value={field.value}
//                 inputProps={{ min: 0, step: 1 }}
//                 onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
//               />
//             )} />
//           </Grid>

//           {/* Trabajador */}
//           {(modoSeleccionado === 'rapido' || esEdicion) && (
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Controller name="trabajador_id" control={control} render={({ field }) => (
//                 <TextField
//                   select fullWidth
//                   label={modoSeleccionado === 'cotizacion'
//                     ? t('labor_form.trabajador_asignado_cotizacion')
//                     : t('labor_form.trabajador')}
//                   value={field.value}
//                   error={!!errors.trabajador_id}
//                   helperText={errors.trabajador_id?.message ?? ''}
//                   onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
//                   SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 320 } } } }}
//                 >
//                   <MenuItem value="">{t('labor_form.sin_asignar')}</MenuItem>
//                   {trabajadores.map((tr) => {
//                     const pct = Number(tr.porcentaje_asistencia_mes ?? 0);
//                     const pts = tr.puntos ?? 0;
//                     const espNombre = especialidades.find((e) => e.id === tr.especialidad_id)?.nombre;
//                     return (
//                       <MenuItem key={tr.id} value={tr.id}>
//                         <Box sx={{ width: '100%' }}>
//                           <Stack direction="row" alignItems="center" justifyContent="space-between">
//                             <Typography variant="body2" fontWeight={600}>
//                               {tr.nombre} {tr.apellido}
//                             </Typography>
//                             <Stack direction="row" spacing={0.5}>
//                               <Chip label={`${pct}%`} size="small" icon={<CalendarCheck size={10} />}
//                                 sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: `${getAsistenciaColor(pct)}18`, color: getAsistenciaColor(pct) }} />
//                               <Chip label={`${pts} pts`} size="small" icon={<Star size={10} />}
//                                 sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(245,158,11,0.1)', color: '#B45309' }} />
//                             </Stack>
//                           </Stack>
//                           {espNombre && (
//                             <Typography variant="caption" color="text.secondary">{espNombre}</Typography>
//                           )}
//                         </Box>
//                       </MenuItem>
//                     );
//                   })}
//                 </TextField>
//               )} />
//             </Grid>
//           )}

//           {/* Estado */}
//           {modoSeleccionado === 'rapido' && (
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Controller name="estado_id" control={control} render={({ field }) => (
//                 <TextField select fullWidth label={t('labor_form.estado')} value={field.value}
//                   onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}>
//                   <MenuItem value="">{t('labor_form.seleccionar')}</MenuItem>
//                   {estadosLabor
//                     .filter((e) => e.nombre !== 'Sin asignar')
//                     .map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
//                 </TextField>
//               )} />
//               {estadoIdSeleccionado !== '' && estadoIdSeleccionado !== undefined && (
//                 <Box sx={{ mt: 1.5 }}>
//                   <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
//                     <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       {t('labor_form.progreso')}
//                     </Typography>
//                     <Typography variant="caption" fontWeight={700} sx={{ color: progressColor }}>
//                       {progreso}%
//                     </Typography>
//                   </Stack>
//                   <LinearProgress variant="determinate" value={progreso} sx={{
//                     height: 8, borderRadius: 4,
//                     backgroundColor: theme.palette.action.hover,
//                     '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: progressColor },
//                   }} />
//                 </Box>
//               )}
//             </Grid>
//           )}

//           {/* Info modo cotización — solo en creación */}
//           {modoSeleccionado === 'cotizacion' && !esEdicion && (
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
//                 <Stack direction="row" gap={1} alignItems="flex-start">
//                   <ClipboardList size={16} color={theme.palette.text.secondary} style={{ marginTop: 2 }} />
//                   <Box>
//                     <Typography variant="body2" fontWeight={700} color="text.primary">
//                       {t('labor_form.cotizacion_info_titulo')}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       {t('labor_form.cotizacion_info_desc')}
//                     </Typography>
//                   </Box>
//                 </Stack>
//               </Box>
//             </Grid>
//           )}

//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="fecha_inicio_estimada" control={control} render={({ field }) => (
//               <TextField {...field} fullWidth type="date" label={t('labor_form.inicio_estimado')}
//                 InputLabelProps={{ shrink: true }} />
//             )} />
//           </Grid>
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="fecha_fin_estimada" control={control} render={({ field }) => (
//               <TextField {...field} fullWidth type="date" label={t('labor_form.fin_estimado')}
//                 InputLabelProps={{ shrink: true }} />
//             )} />
//           </Grid>

//           {initialData && (
//             <>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Controller name="fecha_inicio_real" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth type="date" label={t('labor_form.inicio_real')}
//                     InputLabelProps={{ shrink: true }} />
//                 )} />
//               </Grid>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Controller name="fecha_fin_real" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth type="date" label={t('labor_form.fin_real')}
//                     InputLabelProps={{ shrink: true }} />
//                 )} />
//               </Grid>
//             </>
//           )}
//         </Grid>

//         {/* Info trabajador seleccionado — solo modo rápido */}
//         {modoSeleccionado === 'rapido' && trabajadorSeleccionado && (
//           <>
//             <Divider sx={{ my: 3 }} />
//             <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
//               {t('labor_form.info_trabajador')}
//             </Typography>
//             <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
//               <Chip icon={<CalendarCheck size={14} />} label={t('labor_form.asistencia_mes', { pct: asistenciaPct })}
//                 sx={{ fontWeight: 700, fontSize: 12, bgcolor: `${asistenciaColor}18`, color: asistenciaColor }} />
//               <Chip icon={<Star size={14} />} label={t('labor_form.puntos_acumulados', { puntos })}
//                 sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'rgba(245,158,11,0.1)', color: '#B45309' }} />
//               {especialidadNombre && (
//                 <Chip icon={<Briefcase size={14} />} label={especialidadNombre}
//                   sx={{ fontWeight: 700, fontSize: 12, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
//               )}
//             </Stack>
//             <Grid container spacing={2}>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
//                   <CardContent sx={{ p: 2 }}>
//                     <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
//                       {t('labor_form.datos_personales')}
//                     </Typography>
//                     <Stack spacing={1.5}>
//                       <InfoCard icon={<User size={14} />} label={t('labor_form.nombre_completo')} value={`${trabajadorSeleccionado.nombre} ${trabajadorSeleccionado.apellido}`} />
//                       <InfoCard icon={<CreditCard size={14} />} label={t('labor_form.dni')} value={trabajadorSeleccionado.dni} />
//                       <InfoCard icon={<Phone size={14} />} label={t('labor_form.telefono')} value={trabajadorSeleccionado.telefono || '-'} />
//                       <InfoCard icon={<Briefcase size={14} />} label={t('labor_form.especialidad')} value={especialidadNombre || '-'} />
//                     </Stack>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
//                   <CardContent sx={{ p: 2 }}>
//                     <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
//                       {t('labor_form.estado_admin')}
//                     </Typography>
//                     <Stack spacing={1.5} sx={{ mb: 2 }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography variant="body2" color="text.secondary">{t('labor_form.total_presupuestado')}</Typography>
//                         <Typography variant="body2" fontWeight={700}>${totalPresupuestado.toLocaleString('es-AR')}</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography variant="body2" color="text.secondary">{t('labor_form.total_pagado')}</Typography>
//                         <Typography variant="body2" fontWeight={700} color="success.main">${totalPagado.toLocaleString('es-AR')}</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography variant="body2" color="text.secondary">{t('labor_form.saldo_pendiente')}</Typography>
//                         <Typography variant="body2" fontWeight={700} color={saldoPendiente > 0 ? 'warning.main' : 'success.main'}>
//                           ${saldoPendiente.toLocaleString('es-AR')}
//                         </Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography variant="body2" color="text.secondary">{t('labor_form.pagos_registrados')}</Typography>
//                         <Typography variant="body2" fontWeight={700}>{pagosDelTrabajador.length}</Typography>
//                       </Box>
//                     </Stack>
//                     {pagosDelTrabajador.length > 0 && (
//                       <>
//                         <Divider sx={{ mb: 1.5 }} />
//                         <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
//                           {t('labor_form.ultimos_pagos')}
//                         </Typography>
//                         <Stack spacing={1}>
//                           {pagosDelTrabajador.slice(0, 3).map((p) => (
//                             <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                               <Box>
//                                 <Typography variant="caption" fontWeight={600}>${Number(p.monto).toLocaleString('es-AR')}</Typography>
//                                 <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{new Date(p.fecha).toLocaleDateString('es-AR')}</Typography>
//                               </Box>
//                               <PagoEstadoChip estado={p.estado} />
//                             </Box>
//                           ))}
//                         </Stack>
//                       </>
//                     )}
//                     {pagosDelTrabajador.length === 0 && (
//                       <Typography variant="caption" color="text.secondary">{t('labor_form.sin_pagos')}</Typography>
//                     )}
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </>
//         )}

//         <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
//           <Button type="submit" variant="contained" disabled={isSubmitting}>
//             {isSubmitting ? t('labor_form.guardando') : t('labor_form.guardar')}
//           </Button>
//         </Stack>
//       </Box>
//     </Paper>
//   );
// }

import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, LinearProgress,
  MenuItem, Paper, Stack, TextField, Typography, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  User, CreditCard, Phone, Briefcase, Star, CalendarCheck,
  Zap, ClipboardList, Lock, AlertTriangle, Bot,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { laborSchema, type LaborSchemaValues } from '../schemas/labor.schema';
import type { Labor, LaborFormValues } from '../types/labor.types';
import { useObrasList } from '../../obras/hooks/useObras';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { usePagosByTrabajador } from '../../pagos/hooks/usePagos';
import { usePresupuestosList } from '../../presupuestos/hooks/usePresupuestos';
import { useLaboresList } from '../hooks/useLabores';
import { useUnidadesMedida, useLaborPresupuestos } from '../hooks/useLaborPresupuestos';
import { PagoEstadoChip } from '../../pagos/components/PagoEstadoChip';
import { estadoApi } from '../../../services/api/estado.api';
import { useQuery } from '@tanstack/react-query';
import { useAsistenteStore } from '../../asistenteIA/store/useAsistenteStore';

const ESTADO_SIN_ASIGNAR = 29;

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

function toFormDefaults(initialData?: Labor | null, obraIdFijo?: number): LaborSchemaValues {
  return {
    nombre: initialData?.nombre ?? '',
    descripcion: initialData?.descripcion ?? '',
    obra_id: initialData?.obra_id ?? obraIdFijo ?? '',
    trabajador_id: initialData?.trabajador_id ?? '',
    especialidad_id: initialData?.especialidad_id ?? '',
    estado_id: initialData?.estado_id ?? '',
    modo: (initialData?.modo as 'rapido' | 'cotizacion') ?? 'rapido',
    unidad_id: initialData?.unidad_id ?? '',
    cantidad: initialData?.cantidad ? Math.round(Number(initialData.cantidad)) : '',
    costo_estimado: initialData?.costo_estimado ? Number(initialData.costo_estimado) : '',
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
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

// ── Tarjeta de modo seleccionable ─────────────────────────────
function ModoCard({
  selected, onClick, icon, titulo, descripcion, detalles, color, disabled,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
  detalles: string[];
  color: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        flex: 1,
        p: 2.5,
        borderRadius: 3,
        border: `2px solid ${selected ? color : theme.palette.divider}`,
        bgcolor: selected ? `${color}0D` : 'background.paper',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        '&:hover': !disabled ? { borderColor: color, bgcolor: `${color}08` } : {},
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          bgcolor: selected ? `${color}20` : theme.palette.action.hover,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: selected ? color : theme.palette.text.secondary,
          transition: 'all 0.2s',
        }}>
          {icon}
        </Box>
        <Typography variant="body1" fontWeight={700} color={selected ? color : 'text.primary'}>
          {titulo}
        </Typography>
        {selected && (
          <Box sx={{
            ml: 'auto', width: 20, height: 20, borderRadius: '50%',
            bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</Typography>
          </Box>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
        {descripcion}
      </Typography>
      <Stack spacing={0.5}>
        {detalles.map((d, i) => (
          <Stack key={i} direction="row" alignItems="flex-start" gap={0.75}>
            <Typography sx={{ color, fontSize: 10, mt: 0.4, flexShrink: 0 }}>●</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>{d}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// ── Sección con animación de aparición ────────────────────────
function SeccionAnimada({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  if (!visible) return null;
  return (
    <Box sx={{
      animation: 'fadeSlideIn 0.3s ease-out',
      '@keyframes fadeSlideIn': {
        from: { opacity: 0, transform: 'translateY(8px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
    }}>
      {children}
    </Box>
  );
}

export function LaborForm({ initialData, obraIdFijo, onSubmit, isSubmitting = false }: LaborFormProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const esEdicion = Boolean(initialData);
  const { abrirConMensaje } = useAsistenteStore();
  const [dialogAdvertencia, setDialogAdvertencia] = useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] = useState<LaborFormValues | null>(null);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<LaborSchemaValues>({
    resolver: zodResolver(laborSchema),
    defaultValues: toFormDefaults(initialData, obraIdFijo),
  });

  const { data: obras = [] } = useObrasList();
  const { data: todosLosTrabajadores = [] } = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: labores = [] } = useLaboresList();
  const { data: todosPresupuestos = [] } = usePresupuestosList();
  const { data: unidades = [] } = useUnidadesMedida();
  const { data: presupuestosExistentes = [] } = useLaborPresupuestos(initialData?.id ?? 0);

  const modoBloquado = esEdicion && (
    initialData?.estado_id === ESTADO_SIN_ASIGNAR ||
    presupuestosExistentes.length > 0
  );
  const obraBloquada = !!obraIdFijo || (esEdicion && presupuestosExistentes.length > 0);

  const { data: estadosLabor = [] } = useQuery({
    queryKey: ['estados', 'labor'],
    queryFn: () => estadoApi.getByAmbito('labor'),
  });

  const trabajadores = todosLosTrabajadores.filter((tr) => tr.jefe_id === null);

  const modoSeleccionado = watch('modo');
  const obraIdSeleccionada = watch('obra_id');
  const nombreWatch = watch('nombre');
  const trabajadorIdSeleccionado = watch('trabajador_id');
  const estadoIdSeleccionado = watch('estado_id');
  const especialidadIdSeleccionada = watch('especialidad_id');
  const costoEstimado = watch('costo_estimado');

  // Visibilidad progresiva de secciones
  const mostrarObra = true;
  const mostrarNombre = !!modoSeleccionado;
  const mostrarDescripcion = !!nombreWatch && nombreWatch.length >= 3;
  const mostrarEspecialidad = mostrarDescripcion;
  const mostrarTrabajador = mostrarEspecialidad && modoSeleccionado === 'rapido';
  const mostrarCosto = mostrarEspecialidad && modoSeleccionado === 'rapido';
  // const mostrarUnidadCantidad = mostrarEspecialidad;
  const mostrarEstado = mostrarTrabajador && !!trabajadorIdSeleccionado;
  const mostrarFechas = esEdicion ? true : mostrarEspecialidad;
  const mostrarInfoCotizacion = modoSeleccionado === 'cotizacion' && mostrarDescripcion && !esEdicion;

  const trabajadorSeleccionado = trabajadores.find((tr) => tr.id === Number(trabajadorIdSeleccionado));
  const especialidadNombre = especialidades.find((e) => e.id === (trabajadorSeleccionado?.especialidad_id ?? Number(especialidadIdSeleccionada)))?.nombre;
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
    (l: Labor) => l.trabajador_id === Number(trabajadorIdSeleccionado)
  );
  const presupuestosDelTrabajador = todosPresupuestos.filter((p) =>
    laborasDelTrabajador.some((l: Labor) => l.id === p.labor_id)
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
    }
  }, [trabajadorIdSeleccionado, trabajadorSeleccionado, setValue]);

  useEffect(() => {
    if (obras.length > 0) reset(toFormDefaults(initialData, obraIdFijo));
  }, [initialData, obras, reset, obraIdFijo]);

  useEffect(() => {
    if (!esEdicion && modoSeleccionado === 'cotizacion') {
      setValue('trabajador_id', '');
      setValue('estado_id', '');
    }
  }, [modoSeleccionado, setValue, esEdicion]);

  // ── Submit con verificación de costo estimado ─────────────
  const handleFormSubmit = (values: LaborFormValues) => {
    if (modoSeleccionado === 'rapido' && !values.costo_estimado) {
      setPendingSubmitValues(values);
      setDialogAdvertencia(true);
      return;
    }
    onSubmit(values);
  };

  const handleConfirmarSinCosto = () => {
    setDialogAdvertencia(false);
    if (pendingSubmitValues) onSubmit(pendingSubmitValues);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>

      {/* ── Dialog advertencia costo estimado ── */}
      <Dialog open={dialogAdvertencia} onClose={() => setDialogAdvertencia(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#F59E0B" />
            </Box>
            <Typography fontWeight={700}>Costo estimado sin completar</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No ingresaste un costo estimado para esta labor. Este dato es importante porque:
          </Typography>
          <Stack spacing={1} sx={{ mb: 2.5 }}>
            {[
              'El dashboard no podrá mostrar el impacto financiero real de esta labor',
              'El saldo del trabajador no reflejará este trabajo',
              'Los reportes de ejecución presupuestaria quedarán incompletos',
            ].map((item, i) => (
              <Stack key={i} direction="row" alignItems="flex-start" gap={1}>
                <Typography sx={{ color: '#F59E0B', fontSize: 10, mt: 0.5, flexShrink: 0 }}>●</Typography>
                <Typography variant="body2" color="text.secondary">{item}</Typography>
              </Stack>
            ))}
          </Stack>
          <Box sx={{
            p: 2, borderRadius: 2,
            bgcolor: theme.palette.action.hover,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Bot size={16} color="#F59E0B" />
              <Typography variant="body2" fontWeight={600}>
                ¿No sabés cuánto cargar?
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 1 }}>
              El asistente IA puede ayudarte a estimar el costo basándose en trabajos similares registrados en el sistema.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Bot size={14} />}
              onClick={() => {
                setDialogAdvertencia(false);
                abrirConMensaje('¿Podés ayudarme a estimar el costo de una labor? Necesito saber cuánto cargar como costo estimado.');
              }}
              sx={{ borderColor: '#F59E0B', color: '#F59E0B', '&:hover': { borderColor: '#D97706', bgcolor: 'rgba(245,158,11,0.08)' } }}
            >
              Consultar al asistente IA
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDialogAdvertencia(false)}>
            Volver y completar
          </Button>
          <Button variant="contained" color="warning" onClick={handleConfirmarSinCosto}>
            Guardar sin costo estimado
          </Button>
        </DialogActions>
      </Dialog>

      <Box component="form" onSubmit={handleSubmit((v) => handleFormSubmit(v as LaborFormValues))}>
        <Stack spacing={3}>

          {/* PASO 1 — Modo */}
          <Box>
            <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%',
                bgcolor: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ color: '#0F172A', fontSize: 12, fontWeight: 800 }}>1</Typography>
              </Box>
              <Typography variant="body1" fontWeight={700}>
                {t('labor_form.modo_titulo')}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, ml: 4 }}>
              Elegí cómo querés gestionar esta labor antes de continuar
            </Typography>

            {modoBloquado && (
              <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb: 1.5 }}>
                <Lock size={11} color={theme.palette.text.disabled} />
                <Typography variant="caption" color="text.disabled">
                  {presupuestosExistentes.length > 0
                    ? t('labor_form.modo_bloqueado_presupuestos')
                    : t('labor_form.modo_bloqueado_sin_asignar')}
                </Typography>
              </Stack>
            )}

            <Controller name="modo" control={control} render={({ field }) => (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <ModoCard
                  selected={field.value === 'rapido'}
                  onClick={() => { if (!modoBloquado) field.onChange('rapido'); }}
                  icon={<Zap size={18} />}
                  titulo={t('labor_form.modo_rapido')}
                  color="#F59E0B"
                  disabled={modoBloquado}
                  descripcion="Ya sabés quién va a hacer el trabajo. Lo asignás directamente y el sistema registra la labor de inmediato."
                  detalles={[
                    'Asignás al trabajador en este mismo formulario',
                    'Ideal cuando ya tenés un acuerdo con el trabajador',
                    'Podés agregar el costo estimado para tener control financiero desde el inicio',
                  ]}
                />
                <ModoCard
                  selected={field.value === 'cotizacion'}
                  onClick={() => { if (!modoBloquado) field.onChange('cotizacion'); }}
                  icon={<ClipboardList size={18} />}
                  titulo={t('labor_form.modo_cotizacion')}
                  color="#3B82F6"
                  disabled={modoBloquado}
                  descripcion="Todavía no decidiste quién hace el trabajo. Primero pedís precios a varios proveedores y después elegís el mejor."
                  detalles={[
                    'Cargás múltiples presupuestos de distintos proveedores',
                    'Comparás precio, plazo y calidad antes de confirmar',
                    'Al confirmar un presupuesto, el trabajador se asigna automáticamente',
                  ]}
                />
              </Stack>
            )} />
          </Box>

          <Divider />

          {/* PASO 2 — Obra */}
          <SeccionAnimada visible={mostrarObra}>
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%',
                bgcolor: obraIdSeleccionada ? '#16A34A' : theme.palette.action.hover,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                <Typography sx={{ color: obraIdSeleccionada ? '#fff' : theme.palette.text.secondary, fontSize: 12, fontWeight: 800 }}>
                  {obraIdSeleccionada ? '✓' : '2'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700}>Obra asociada</Typography>
                <Typography variant="caption" color="text.secondary">
                  ¿A qué obra pertenece este trabajo?
                </Typography>
              </Box>
            </Stack>
            <Controller name="obra_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth
                label={t('labor_form.obra')}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={obraBloquada}
              >
                <MenuItem value="">{t('labor_form.seleccionar')}</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            )} />
            {esEdicion && presupuestosExistentes.length > 0 && (
              <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
                <Lock size={11} color={theme.palette.text.disabled} />
                <Typography variant="caption" color="text.disabled">
                  {t('labor_form.obra_bloqueada')}
                </Typography>
              </Stack>
            )}
          </SeccionAnimada>

          {/* PASO 3 — Nombre */}
          <SeccionAnimada visible={mostrarNombre}>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%',
                bgcolor: nombreWatch && nombreWatch.length >= 3 ? '#16A34A' : theme.palette.action.hover,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                <Typography sx={{ color: nombreWatch && nombreWatch.length >= 3 ? '#fff' : theme.palette.text.secondary, fontSize: 12, fontWeight: 800 }}>
                  {nombreWatch && nombreWatch.length >= 3 ? '✓' : '3'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700}>Nombre del trabajo</Typography>
                <Typography variant="caption" color="text.secondary">
                  Describí brevemente qué trabajo se va a realizar
                </Typography>
              </Box>
            </Stack>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('labor_form.nombre')}
                placeholder="Ej: Excavación viga fundación, Instalación eléctrica planta baja..."
                error={!!errors.nombre}
                helperText={errors.nombre?.message ?? ''}
              />
            )} />
          </SeccionAnimada>

          {/* PASO 4 — Descripción + Especialidad */}
          <SeccionAnimada visible={mostrarDescripcion}>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%',
                bgcolor: theme.palette.action.hover,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12, fontWeight: 800 }}>4</Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700}>Detalle del trabajo</Typography>
                <Typography variant="caption" color="text.secondary">
                  Descripción técnica y especialidad requerida
                </Typography>
              </Box>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller name="descripcion" control={control} render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth multiline minRows={3}
                    label={t('labor_form.descripcion')}
                    placeholder="Describí el alcance del trabajo, materiales involucrados, condiciones especiales..."
                  />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="especialidad_id" control={control} render={({ field }) => (
                  <TextField
                    select fullWidth
                    label={t('labor_form.especialidad')}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <MenuItem value="">{t('labor_form.sin_especialidad')}</MenuItem>
                    {especialidades.map((e) => (
                      <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
                    ))}
                  </TextField>
                )} />
                {modoSeleccionado === 'rapido' && trabajadorSeleccionado?.especialidad_id && (
                  <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
                    <Briefcase size={11} color={theme.palette.text.disabled} />
                    <Typography variant="caption" color="text.disabled">
                      {t('labor_form.especialidad_heredada')}
                    </Typography>
                  </Stack>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="unidad_id" control={control} render={({ field }) => (
                  <TextField
                    select fullWidth
                    label={t('labor_form.unidad')}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <MenuItem value="">{t('labor_form.sin_unidad')}</MenuItem>
                    {unidades.map((u) => (
                      <MenuItem key={u.id} value={u.id}>{u.nombre} ({u.simbolo})</MenuItem>
                    ))}
                  </TextField>
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="cantidad" control={control} render={({ field }) => (
                  <TextField
                    fullWidth type="number"
                    label={t('labor_form.cantidad')}
                    value={field.value}
                    inputProps={{ min: 0, step: 1 }}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                )} />
              </Grid>
            </Grid>
          </SeccionAnimada>

          {/* PASO 5 — Trabajador (solo modo rápido) */}
          <SeccionAnimada visible={mostrarTrabajador}>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%',
                bgcolor: trabajadorIdSeleccionado ? '#16A34A' : theme.palette.action.hover,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                <Typography sx={{ color: trabajadorIdSeleccionado ? '#fff' : theme.palette.text.secondary, fontSize: 12, fontWeight: 800 }}>
                  {trabajadorIdSeleccionado ? '✓' : '5'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700}>Trabajador responsable</Typography>
                <Typography variant="caption" color="text.secondary">
                  ¿Quién va a realizar este trabajo?
                </Typography>
              </Box>
            </Stack>
            <Controller name="trabajador_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth
                label={t('labor_form.trabajador')}
                value={field.value}
                error={!!errors.trabajador_id}
                helperText={errors.trabajador_id?.message ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 320 } } } }}
              >
                <MenuItem value="">{t('labor_form.sin_asignar')}</MenuItem>
                {trabajadores.map((tr) => {
                  const pct = Number(tr.porcentaje_asistencia_mes ?? 0);
                  const pts = tr.puntos ?? 0;
                  const espNombre = especialidades.find((e) => e.id === tr.especialidad_id)?.nombre;
                  return (
                    <MenuItem key={tr.id} value={tr.id}>
                      <Box sx={{ width: '100%' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={600}>
                            {tr.nombre} {tr.apellido}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            <Chip label={`${pct}%`} size="small" icon={<CalendarCheck size={10} />}
                              sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: `${getAsistenciaColor(pct)}18`, color: getAsistenciaColor(pct) }} />
                            <Chip label={`${pts} pts`} size="small" icon={<Star size={10} />}
                              sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(245,158,11,0.1)', color: '#B45309' }} />
                          </Stack>
                        </Stack>
                        {espNombre && (
                          <Typography variant="caption" color="text.secondary">{espNombre}</Typography>
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
            )} />
          </SeccionAnimada>

          {/* PASO 6 — Costo estimado + Estado (solo modo rápido) */}
          <SeccionAnimada visible={mostrarCosto}>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%',
                bgcolor: costoEstimado ? '#16A34A' : '#FEF3C7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                <Typography sx={{ color: costoEstimado ? '#fff' : '#F59E0B', fontSize: 12, fontWeight: 800 }}>
                  {costoEstimado ? '✓' : '6'}
                </Typography>
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="body1" fontWeight={700}>Costo estimado</Typography>
                  <Chip label="Recomendado" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: '#FEF3C7', color: '#F59E0B' }} />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Valor aproximado del trabajo — permite calcular saldos y presupuesto en tiempo real
                </Typography>
              </Box>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="costo_estimado" control={control} render={({ field }) => (
                  <TextField
                    fullWidth type="number"
                    label="Costo estimado ($)"
                    placeholder="Ej: 150000"
                    value={field.value}
                    inputProps={{ min: 0, step: 100 }}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>$</Typography>,
                    }}
                  />
                )} />
                {!costoEstimado && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Sin este dato el dashboard no podrá mostrar el impacto financiero de esta labor
                  </Typography>
                )}
              </Grid>

              {/* Estado — aparece cuando hay trabajador */}
              <SeccionAnimada visible={mostrarEstado}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller name="estado_id" control={control} render={({ field }) => (
                    <TextField
                      select fullWidth
                      label={t('labor_form.estado')}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    >
                      <MenuItem value="">{t('labor_form.seleccionar')}</MenuItem>
                      {estadosLabor
                        .filter((e) => e.nombre !== 'Sin asignar')
                        .map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
                    </TextField>
                  )} />
                  {estadoIdSeleccionado !== '' && estadoIdSeleccionado !== undefined && (
                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {t('labor_form.progreso')}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: progressColor }}>
                          {progreso}%
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={progreso} sx={{
                        height: 8, borderRadius: 4,
                        backgroundColor: theme.palette.action.hover,
                        '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: progressColor },
                      }} />
                    </Box>
                  )}
                </Grid>
              </SeccionAnimada>
            </Grid>
          </SeccionAnimada>

          {/* Info cotización */}
          <SeccionAnimada visible={mostrarInfoCotizacion}>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{
              p: 2.5, borderRadius: 2,
              bgcolor: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}>
              <Stack direction="row" gap={1.5} alignItems="flex-start">
                <Box sx={{
                  width: 32, height: 32, borderRadius: 2, flexShrink: 0,
                  bgcolor: 'rgba(59,130,246,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ClipboardList size={16} color="#3B82F6" />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="text.primary" mb={0.5}>
                    {t('labor_form.cotizacion_info_titulo')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {t('labor_form.cotizacion_info_desc')}
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {[
                      'Una vez guardado, vas a poder cargar presupuestos desde el detalle del trabajo',
                      'Cada proveedor puede tener su propio precio, plazo y condiciones',
                      'Cuando confirmes el mejor presupuesto, el trabajador queda asignado automáticamente',
                    ].map((item, i) => (
                      <Stack key={i} direction="row" alignItems="flex-start" gap={0.75}>
                        <Typography sx={{ color: '#3B82F6', fontSize: 10, mt: 0.4, flexShrink: 0 }}>●</Typography>
                        <Typography variant="caption" color="text.secondary">{item}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </SeccionAnimada>

          {/* PASO 7 — Fechas */}
          <SeccionAnimada visible={mostrarFechas}>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%',
                bgcolor: theme.palette.action.hover,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12, fontWeight: 800 }}>
                  {modoSeleccionado === 'cotizacion' ? '5' : '7'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700}>Fechas estimadas</Typography>
                <Typography variant="caption" color="text.secondary">Opcionales — ayudan a planificar el cronograma</Typography>
              </Box>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="fecha_inicio_estimada" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth type="date" label={t('labor_form.inicio_estimado')}
                    InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="fecha_fin_estimada" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth type="date" label={t('labor_form.fin_estimado')}
                    InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              {initialData && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="fecha_inicio_real" control={control} render={({ field }) => (
                      <TextField {...field} fullWidth type="date" label={t('labor_form.inicio_real')}
                        InputLabelProps={{ shrink: true }} />
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="fecha_fin_real" control={control} render={({ field }) => (
                      <TextField {...field} fullWidth type="date" label={t('labor_form.fin_real')}
                        InputLabelProps={{ shrink: true }} />
                    )} />
                  </Grid>
                </>
              )}
            </Grid>
          </SeccionAnimada>

          {/* Info trabajador seleccionado */}
          {modoSeleccionado === 'rapido' && trabajadorSeleccionado && (
            <SeccionAnimada visible={true}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
                {t('labor_form.info_trabajador')}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip icon={<CalendarCheck size={14} />} label={t('labor_form.asistencia_mes', { pct: asistenciaPct })}
                  sx={{ fontWeight: 700, fontSize: 12, bgcolor: `${asistenciaColor}18`, color: asistenciaColor }} />
                <Chip icon={<Star size={14} />} label={t('labor_form.puntos_acumulados', { puntos })}
                  sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'rgba(245,158,11,0.1)', color: '#B45309' }} />
                {especialidadNombre && (
                  <Chip icon={<Briefcase size={14} />} label={especialidadNombre}
                    sx={{ fontWeight: 700, fontSize: 12, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
                )}
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
                        {t('labor_form.datos_personales')}
                      </Typography>
                      <Stack spacing={1.5}>
                        <InfoCard icon={<User size={14} />} label={t('labor_form.nombre_completo')} value={`${trabajadorSeleccionado.nombre} ${trabajadorSeleccionado.apellido}`} />
                        <InfoCard icon={<CreditCard size={14} />} label={t('labor_form.dni')} value={trabajadorSeleccionado.dni} />
                        <InfoCard icon={<Phone size={14} />} label={t('labor_form.telefono')} value={trabajadorSeleccionado.telefono || '-'} />
                        <InfoCard icon={<Briefcase size={14} />} label={t('labor_form.especialidad')} value={especialidadNombre || '-'} />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
                        {t('labor_form.estado_admin')}
                      </Typography>
                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{t('labor_form.total_presupuestado')}</Typography>
                          <Typography variant="body2" fontWeight={700}>${totalPresupuestado.toLocaleString('es-AR')}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{t('labor_form.total_pagado')}</Typography>
                          <Typography variant="body2" fontWeight={700} color="success.main">${totalPagado.toLocaleString('es-AR')}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{t('labor_form.saldo_pendiente')}</Typography>
                          <Typography variant="body2" fontWeight={700} color={saldoPendiente > 0 ? 'warning.main' : 'success.main'}>
                            ${saldoPendiente.toLocaleString('es-AR')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{t('labor_form.pagos_registrados')}</Typography>
                          <Typography variant="body2" fontWeight={700}>{pagosDelTrabajador.length}</Typography>
                        </Box>
                      </Stack>
                      {pagosDelTrabajador.length > 0 && (
                        <>
                          <Divider sx={{ mb: 1.5 }} />
                          <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                            {t('labor_form.ultimos_pagos')}
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
                        <Typography variant="caption" color="text.secondary">{t('labor_form.sin_pagos')}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </SeccionAnimada>
          )}

          {/* Botón guardar */}
          <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
            <Button type="submit" variant="contained" disabled={isSubmitting} size="large">
              {isSubmitting ? t('labor_form.guardando') : t('labor_form.guardar')}
            </Button>
          </Stack>

        </Stack>
      </Box>
    </Paper>
  );
}