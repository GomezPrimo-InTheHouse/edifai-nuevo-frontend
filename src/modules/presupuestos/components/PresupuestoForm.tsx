// import { useEffect } from 'react';
// import {
//   Box, Button, Card, CardContent, Divider, Grid,
//   InputAdornment, MenuItem, Paper, Stack, TextField, Typography,
// } from '@mui/material';
// import { Briefcase, Building2, Phone, User, CreditCard } from 'lucide-react';
// import { Controller, useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { presupuestoSchema, type PresupuestoSchemaValues } from '../schemas/presupuesto.schema';
// import type { Presupuesto, PresupuestoFormValues } from '../types/presupuesto.types';
// import { useLaboresList } from '../../labores/hooks/useLabores';
// import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
// import { useObrasList } from '../../obras/hooks/useObras';
// import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';

// interface Props {
//   initialData?: Presupuesto | null;
//   onSubmit: (values: PresupuestoFormValues) => void | Promise<void>;
//   isSubmitting?: boolean;
//   hideEstado?: boolean; // ← nuevo prop para ocultar campo estado cuando no se use
// }

// function toFormDefaults(initialData?: Presupuesto | null): PresupuestoSchemaValues {
//   return {
//     nombre:          initialData?.nombre          ?? '',
//     descripcion:     initialData?.descripcion     ?? '',
//     labor_id:        initialData?.labor_id        ?? '',
//     obra_id:         initialData?.obra_id         ?? '',
//     estado_id:       initialData?.estado_id       ?? '',
//     costo_mano_obra: initialData?.costo_mano_obra ?? '',
//   };
// }

// function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
//   return (
//     <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
//       <Box sx={{ color: '#F59E0B', mt: 0.3 }}>{icon}</Box>
//       <Box>
//         <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
//           {label}
//         </Typography>
//         <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
//           {value}
//         </Typography>
//       </Box>
//     </Box>
//   );
// }

// export function PresupuestoForm({ initialData, onSubmit, isSubmitting = false, hideEstado = false }: Props) {
//   const {
//     control,
//     handleSubmit,
//     reset,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<PresupuestoSchemaValues>({
//     resolver: zodResolver(presupuestoSchema),
//     defaultValues: toFormDefaults(initialData),
//   });

//   const { data: labores = [] }       = useLaboresList();
//   const { data: obras = [] }         = useObrasList();
//   const { data: trabajadores = [] }  = useTrabajadoresList();
//   const { data: todosEstados = [] }  = useEstadosGenerales();
//   const estados = todosEstados.filter((e) => e.ambito === 'presupuesto');

//   const laborIdSeleccionada  = watch('labor_id');
//   const laborSeleccionada    = labores.find((l) => l.id === Number(laborIdSeleccionada));
//   const obraVinculada        = obras.find((o) => o.id === laborSeleccionada?.obra_id);
//   const trabajadorVinculado  = trabajadores.find((t) => t.id === laborSeleccionada?.trabajador_id);
  
// useEffect(() => {
//   if (laborSeleccionada?.obra_id) {
//     setValue('obra_id', laborSeleccionada.obra_id);
//   } else {
//     setValue('obra_id', '');
//   }
// }, [laborSeleccionada, setValue]);

//   useEffect(() => {
//     reset(toFormDefaults(initialData));
//   }, [initialData, reset]);

//   const onValid = (v: PresupuestoSchemaValues) => {
//     console.log('✅ Submit válido:', v);
//     onSubmit(v as unknown as PresupuestoFormValues);
//   };

//   const onInvalid = (errs: typeof errors) => {
//     console.error('❌ Errores de validación que bloquean submit:', errs);
//   };

//   return (
//     <Paper sx={{ p: 3, borderRadius: 3 }}>
//       <Box component="form" onSubmit={handleSubmit(onValid, onInvalid)}>
//         <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
//           INFORMACIÓN DEL PRESUPUESTO
//         </Typography>

//         <Grid container spacing={2}>

//           {/* Nombre */}
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller
//               name="nombre"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   fullWidth
//                   label="Nombre del presupuesto"
//                   error={!!errors.nombre}
//                   helperText={errors.nombre?.message ?? ''}
//                 />
//               )}
//             />
//           </Grid>

//           {/* Estado */}
//          {/* Estado — oculto en edición */}
// {!hideEstado && (
//   <Grid size={{ xs: 12, md: 6 }}>
//     <Controller
//       name="estado_id"
//       control={control}
//       render={({ field }) => (
//         <TextField
//           select fullWidth label="Estado"
//           value={field.value ?? ''}
//           onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
//         >
//           <MenuItem value="">Seleccionar</MenuItem>
//           {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
//         </TextField>
//       )}
//     />
//   </Grid>
// )}

//           {/* Descripción */}
//           <Grid size={{ xs: 12 }}>
//             <Controller
//               name="descripcion"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   fullWidth
//                   multiline
//                   minRows={3}
//                   label="Descripción"
//                   error={!!errors.descripcion}
//                   helperText={errors.descripcion?.message ?? ''}
//                 />
//               )}
//             />
//           </Grid>

//           {/* Labor */}
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller
//               name="labor_id"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   select
//                   fullWidth
//                   label="Labor asociada"
//                   value={field.value ?? ''}
//                   onChange={(e) =>
//                     field.onChange(e.target.value === '' ? '' : Number(e.target.value))
//                   }
//                   error={!!errors.labor_id}
//                   helperText={errors.labor_id?.message ?? ''}
//                 >
//                   <MenuItem value="">Seleccionar labor</MenuItem>
//                   {labores.map((l) => (
//                     <MenuItem key={l.id} value={l.id}>{l.nombre}</MenuItem>
//                   ))}
//                 </TextField>
//               )}
//             />
//           </Grid>

//           {/* Costo mano de obra */}
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller
//               name="costo_mano_obra"
//               control={control}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   fullWidth
//                   type="number"
//                   label="Costo mano de obra ($)"
//                   value={field.value ?? ''}
//                   onChange={(e) =>
//                     field.onChange(e.target.value === '' ? '' : Number(e.target.value))
//                   }
//                   error={!!errors.costo_mano_obra}
//                   helperText={errors.costo_mano_obra?.message ?? ''}
//                   InputProps={{
//                     startAdornment: <InputAdornment position="start">$</InputAdornment>,
//                   }}
//                 />
//               )}
//             />
//           </Grid>

//         </Grid>

//         {/* Cards informativas */}
//         {laborSeleccionada && (
//           <>
//             <Divider sx={{ my: 3 }} />
//             <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
//               INFORMACIÓN VINCULADA
//             </Typography>
//             <Grid container spacing={2}>

//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
//                   <CardContent sx={{ p: 2 }}>
//                     <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
//                       LABOR SELECCIONADA
//                     </Typography>
//                     <Stack spacing={1.5}>
//                       <InfoCard icon={<Briefcase size={14} />} label="Nombre"      value={laborSeleccionada.nombre} />
//                       <InfoCard icon={<Briefcase size={14} />} label="Descripción" value={laborSeleccionada.descripcion || '-'} />
//                     </Stack>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
//                   <CardContent sx={{ p: 2 }}>
//                     <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
//                       OBRA VINCULADA
//                     </Typography>
//                     {obraVinculada ? (
//                       <Stack spacing={1.5}>
//                         <InfoCard icon={<Building2 size={14} />} label="Nombre"    value={obraVinculada.nombre} />
//                         <InfoCard icon={<Building2 size={14} />} label="Ubicación" value={obraVinculada.ubicacion || '-'} />
//                       </Stack>
//                     ) : (
//                       <Typography variant="body2" color="text.secondary">Sin obra vinculada</Typography>
//                     )}
//                   </CardContent>
//                 </Card>
//               </Grid>

//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
//                   <CardContent sx={{ p: 2 }}>
//                     <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
//                       TRABAJADOR ASIGNADO
//                     </Typography>
//                     {trabajadorVinculado ? (
//                       <Stack spacing={1.5}>
//                         <InfoCard icon={<User size={14} />}     label="Nombre"    value={`${trabajadorVinculado.nombre} ${trabajadorVinculado.apellido}`} />
//                         <InfoCard icon={<CreditCard size={14} />} label="DNI"     value={trabajadorVinculado.dni} />
//                         <InfoCard icon={<Phone size={14} />}    label="Teléfono"  value={trabajadorVinculado.telefono || '-'} />
//                       </Stack>
//                     ) : (
//                       <Typography variant="body2" color="text.secondary">Sin trabajador asignado</Typography>
//                     )}
//                   </CardContent>
//                 </Card>
//               </Grid>

//             </Grid>
//           </>
//         )}

//         <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
//           <Button
//             type="submit"
//             variant="contained"
//             disabled={isSubmitting}
//             onClick={() => console.log('Click submit — errors actuales:', errors)}
//           >
//             {isSubmitting ? 'Guardando...' : 'Guardar presupuesto'}
//           </Button>
//         </Stack>

//       </Box>
//     </Paper>
//   );
// }

import { useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Divider, Grid,
  InputAdornment, MenuItem, Paper, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { Briefcase, Building2, Phone, User, CreditCard } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { presupuestoSchema, type PresupuestoSchemaValues } from '../schemas/presupuesto.schema';
import type { Presupuesto, PresupuestoFormValues } from '../types/presupuesto.types';
import { useLaboresList } from '../../labores/hooks/useLabores';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
import { useObrasList } from '../../obras/hooks/useObras';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';

interface Props {
  initialData?: Presupuesto | null;
  onSubmit: (values: PresupuestoFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  hideEstado?: boolean;
}

function toFormDefaults(initialData?: Presupuesto | null): PresupuestoSchemaValues {
  return {
    nombre:          initialData?.nombre          ?? '',
    descripcion:     initialData?.descripcion     ?? '',
    labor_id:        initialData?.labor_id        ?? '',
    obra_id:         initialData?.obra_id         ?? '',
    estado_id:       initialData?.estado_id       ?? '',
    costo_mano_obra: initialData?.costo_mano_obra ?? '',
  };
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ color: '#F59E0B', mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export function PresupuestoForm({ initialData, onSubmit, isSubmitting = false, hideEstado = false }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    control, handleSubmit, reset, watch, setValue, formState: { errors },
  } = useForm<PresupuestoSchemaValues>({
    resolver: zodResolver(presupuestoSchema),
    defaultValues: toFormDefaults(initialData),
  });

  const { data: labores = [] }      = useLaboresList();
  const { data: obras = [] }        = useObrasList();
  const { data: trabajadores = [] } = useTrabajadoresList();
  const { data: todosEstados = [] } = useEstadosGenerales();
  const estados = todosEstados.filter((e) => e.ambito === 'presupuesto');

  const laborIdSeleccionada = watch('labor_id');
  const laborSeleccionada   = labores.find((l) => l.id === Number(laborIdSeleccionada));
  const obraVinculada       = obras.find((o) => o.id === laborSeleccionada?.obra_id);
  const trabajadorVinculado = trabajadores.find((t) => t.id === laborSeleccionada?.trabajador_id);

  useEffect(() => {
    if (laborSeleccionada?.obra_id) {
      setValue('obra_id', laborSeleccionada.obra_id);
    } else {
      setValue('obra_id', '');
    }
  }, [laborSeleccionada, setValue]);

  useEffect(() => {
    reset(toFormDefaults(initialData));
  }, [initialData, reset]);

  const onValid = (v: PresupuestoSchemaValues) => {
    onSubmit(v as unknown as PresupuestoFormValues);
  };

  const onInvalid = (errs: typeof errors) => {
    console.error('❌ Errores de validación:', errs);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Box component="form" onSubmit={handleSubmit(onValid, onInvalid)}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
          {t('presupuesto_form.info')}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField
                {...field} fullWidth label={t('presupuesto_form.nombre')}
                error={!!errors.nombre} helperText={errors.nombre?.message ?? ''}
              />
            )} />
          </Grid>

          {!hideEstado && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller name="estado_id" control={control} render={({ field }) => (
                <TextField
                  select fullWidth label={t('presupuesto_form.estado')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <MenuItem value="">{t('presupuesto_form.seleccionar')}</MenuItem>
                  {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Controller name="descripcion" control={control} render={({ field }) => (
              <TextField
                {...field} fullWidth multiline minRows={3} label={t('presupuesto_form.descripcion')}
                error={!!errors.descripcion} helperText={errors.descripcion?.message ?? ''}
              />
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="labor_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label={t('presupuesto_form.labor')}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.labor_id} helperText={errors.labor_id?.message ?? ''}
              >
                <MenuItem value="">{t('presupuesto_form.seleccionar_labor')}</MenuItem>
                {labores.map((l) => <MenuItem key={l.id} value={l.id}>{l.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="costo_mano_obra" control={control} render={({ field }) => (
              <TextField
                {...field} fullWidth type="number" label={t('presupuesto_form.costo_mano_obra')}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={!!errors.costo_mano_obra} helperText={errors.costo_mano_obra?.message ?? ''}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            )} />
          </Grid>
        </Grid>

        {laborSeleccionada && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
              {t('presupuesto_form.info_vinculada')}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
                      {t('presupuesto_form.labor_seleccionada')}
                    </Typography>
                    <Stack spacing={1.5}>
                      <InfoCard icon={<Briefcase size={14} />} label={t('presupuesto_form.nombre_label')} value={laborSeleccionada.nombre} />
                      <InfoCard icon={<Briefcase size={14} />} label={t('presupuesto_form.descripcion_label')} value={laborSeleccionada.descripcion || '-'} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
                      {t('presupuesto_form.obra_vinculada')}
                    </Typography>
                    {obraVinculada ? (
                      <Stack spacing={1.5}>
                        <InfoCard icon={<Building2 size={14} />} label={t('presupuesto_form.nombre_label')} value={obraVinculada.nombre} />
                        <InfoCard icon={<Building2 size={14} />} label={t('presupuesto_form.ubicacion')} value={obraVinculada.ubicacion || '-'} />
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">{t('presupuesto_form.sin_obra')}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B', mb: 1.5, display: 'block' }}>
                      {t('presupuesto_form.trabajador_asignado')}
                    </Typography>
                    {trabajadorVinculado ? (
                      <Stack spacing={1.5}>
                        <InfoCard icon={<User size={14} />}       label={t('presupuesto_form.nombre_label')}    value={`${trabajadorVinculado.nombre} ${trabajadorVinculado.apellido}`} />
                        <InfoCard icon={<CreditCard size={14} />} label={t('presupuesto_form.dni')}             value={trabajadorVinculado.dni} />
                        <InfoCard icon={<Phone size={14} />}      label={t('presupuesto_form.telefono')}        value={trabajadorVinculado.telefono || '-'} />
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">{t('presupuesto_form.sin_trabajador')}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? t('presupuesto_form.guardando') : t('presupuesto_form.guardar')}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}