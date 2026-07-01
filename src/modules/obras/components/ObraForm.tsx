import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Chip, Divider, Grid, IconButton, InputAdornment,
  MenuItem, Paper, Stack, TextField, Tooltip, Typography, useTheme,
} from '@mui/material';
import {
  MapPin, Plus, X, Clock, Building2, Users, Layers,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { obraSchema, type ObraSchemaValues } from '../schemas/obra.schema';
import type { ClienteOption, EstadoOption, Obra, ObraFormValues, TipoObraOption } from '../types/obra.types';
import { MapPickerModal, type MapPickerResult } from './MapPickerModal';
import {
  SECTOR_TIPOS_OPTIONS, nombreCompletoSector,
  flattenSectorTree, flattenLocalSectorTree,
  getDescendantIds, getDescendantTempIds,
  type Sector, type SectorLocal, type SectorTipo,
} from '../types/sector.types';
import { useCreateSector, useDeleteSector, useSectoresPorObra } from '../hooks/useSectores';
import { useNotify } from '../../../shared/hooks/useNotify';

interface ObraFormProps {
  initialData?:  Obra | null;
  tiposObra:     TipoObraOption[];
  estados:       EstadoOption[];
  clientes:      ClienteOption[];
  onSubmit:      (values: ObraFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

function toDateInput(value?: string | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

function toFormDefaults(initialData?: Obra | null): ObraFormValues {
  return {
    nombre:                initialData?.nombre                ?? '',
    descripcion:           initialData?.descripcion           ?? '',
    ubicacion:             initialData?.ubicacion             ?? '',
    latitud:               initialData?.latitud  != null ? Number(initialData.latitud)  : null,
    longitud:              initialData?.longitud != null ? Number(initialData.longitud) : null,
    tipo_obra_id:          initialData?.tipo_obra_id          ?? '',
    estado_id:             initialData?.estado_id             ?? '',
    cliente_id:            initialData?.cliente_id            ?? null,
    fecha_inicio_estimado: toDateInput(initialData?.fecha_inicio_estimado),
    fecha_fin_estimado:    toDateInput(initialData?.fecha_fin_estimado),
    fecha_inicio_real:     toDateInput(initialData?.fecha_inicio_real),
    fecha_fin_real:        toDateInput(initialData?.fecha_fin_real),
    usuario_creador_id:    initialData?.usuario_creador_id    ?? 2,
  };
}

function clienteLabel(c: ClienteOption): string {
  if (c.razon_social) return c.razon_social;
  return `${c.nombre}${c.apellido ? ` ${c.apellido}` : ''}`;
}

// ── Componente de animación (igual que LaborForm) ─────────────
function SeccionAnimada({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  if (!visible) return null;
  return (
    <Box sx={{
      animation: 'fadeSlideIn 0.3s ease-out',
      '@keyframes fadeSlideIn': {
        from: { opacity: 0, transform: 'translateY(8px)' },
        to:   { opacity: 1, transform: 'translateY(0)' },
      },
    }}>
      {children}
    </Box>
  );
}

// ── Header de paso (igual que LaborForm) ──────────────────────
function PasoHeader({
  numero, titulo, subtitulo, completado,
}: {
  numero: number | string; titulo: string; subtitulo: string; completado: boolean;
}) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" gap={1} mb={2}>
      <Box sx={{
        width: 24, height: 24, borderRadius: '50%',
        bgcolor: completado ? '#16A34A' : theme.palette.action.hover,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', flexShrink: 0,
      }}>
        <Typography sx={{
          color: completado ? '#fff' : theme.palette.text.secondary,
          fontSize: 12, fontWeight: 800,
        }}>
          {completado ? '✓' : numero}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1" fontWeight={700}>{titulo}</Typography>
        <Typography variant="caption" color="text.secondary">{subtitulo}</Typography>
      </Box>
    </Stack>
  );
}

export function ObraForm({
  initialData, tiposObra, estados, clientes, onSubmit, isSubmitting = false,
}: ObraFormProps) {
  const theme  = useTheme();
  const { t }  = useTranslation();
  const notify = useNotify();
  const [mapOpen, setMapOpen] = useState(false);
  const valorRef = useRef<HTMLInputElement>(null);

  const obraId     = initialData?.id ?? null;
  const isEditMode = obraId !== null;

  // ── Sectores locales (creación) ───────────────────────────────
  const [sectoresLocales, setSectoresLocales] = useState<SectorLocal[]>([]);
  const tempIdCounter = useRef(0);
  const generateTempId = () => `local_${++tempIdCounter.current}_${Date.now()}`;

  // ── Sectores API (edición) ────────────────────────────────────
  const sectoresQuery          = useSectoresPorObra(obraId ?? 0);
  const crearSectorMutation    = useCreateSector(obraId ?? 0);
  const eliminarSectorMutation = useDeleteSector(obraId ?? 0);

  // ── Mini-form sectores ────────────────────────────────────────
  const [nuevoTipo,      setNuevoTipo]      = useState<SectorTipo>('piso');
  const [nuevoValor,     setNuevoValor]     = useState('');
  const [nuevoParentKey, setNuevoParentKey] = useState<string>('');

  const handleAgregarSector = () => {
    const valor = nuevoValor.trim();
    if (!valor) return;

    if (isEditMode) {
      const parent_id = nuevoParentKey ? Number(nuevoParentKey) : null;
      crearSectorMutation.mutate(
        { tipo: nuevoTipo, valor, orden: sectoresQuery.data?.length ?? 0, parent_id },
        {
          onSuccess: () => notify.success('Sector agregado'),
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Error al agregar el sector';
            notify.error(msg);
          },
        }
      );
    } else {
      setSectoresLocales(prev => [
        ...prev,
        { tempId: generateTempId(), tipo: nuevoTipo, valor, orden: prev.length, parent_tempId: nuevoParentKey || null },
      ]);
    }
    setNuevoValor('');
    setNuevoParentKey('');
  };

  const handleEliminarSector = async (tempId?: string, sectorId?: number) => {
    if (isEditMode && sectorId !== undefined) {
      const allSectors = sectoresQuery.data ?? [];
      const descendantIds = getDescendantIds(sectorId, allSectors);
      const allAffectedIds = [sectorId, ...descendantIds];
      const affected = allSectors.filter(s => allAffectedIds.includes(s.id));

      const message = affected.length > 1
        ? `Se eliminarán ${affected.length} sectores:\n${affected.map(s => nombreCompletoSector(s)).join(', ')}.`
        : `¿Eliminar "${nombreCompletoSector(affected[0])}"?`;

      const ok = await notify.confirm({ title: 'Eliminar sector', message, confirmLabel: 'Eliminar', severity: 'error' });
      if (!ok) return;

      eliminarSectorMutation.mutate(sectorId, {
        onSuccess: () => notify.success('Sector eliminado'),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'No se puede eliminar el sector';
          notify.error(msg);
        },
      });
    } else if (tempId) {
      const descendantTempIds = getDescendantTempIds(tempId, sectoresLocales);
      const allAffectedTempIds = [tempId, ...descendantTempIds];
      const affected = sectoresLocales.filter(s => allAffectedTempIds.includes(s.tempId));

      const message = affected.length > 1
        ? `Se eliminarán ${affected.length} sectores:\n${affected.map(s => nombreCompletoSector(s)).join(', ')}.`
        : `¿Eliminar "${nombreCompletoSector(affected[0])}"?`;

      const ok = await notify.confirm({ title: 'Eliminar sector', message, confirmLabel: 'Eliminar', severity: 'error' });
      if (!ok) return;

      setSectoresLocales(prev => prev.filter(s => !allAffectedTempIds.includes(s.tempId)));
    }
  };

  const flattenedEdit  = flattenSectorTree(sectoresQuery.data ?? []);
  const flattenedLocal = flattenLocalSectorTree(sectoresLocales);
  const parentOptionsEdit  = flattenSectorTree(sectoresQuery.data ?? []);
  const parentOptionsLocal = flattenLocalSectorTree(sectoresLocales);

  // ── Form principal ────────────────────────────────────────────
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<ObraSchemaValues>({
      resolver: zodResolver(obraSchema),
      defaultValues: toFormDefaults(initialData) as unknown as ObraSchemaValues,
    });

  const nombreWatch    = watch('nombre');
  const descripcionWatch = watch('descripcion');
  const tipo_obra_id   = watch('tipo_obra_id');
  const estado_id      = watch('estado_id');
  const ubicacionWatch = watch('ubicacion');
  const latitudWatch   = watch('latitud');
  const longitudWatch  = watch('longitud');

  const latNum      = latitudWatch  != null ? Number(latitudWatch)  : null;
  const lngNum      = longitudWatch != null ? Number(longitudWatch) : null;
  const tieneCoords = latNum != null && !isNaN(latNum) && lngNum != null && !isNaN(lngNum);

  // ── Revelación progresiva ─────────────────────────────────────
  const nombreCompleto      = !!nombreWatch && nombreWatch.length >= 3;
  const descripcionCompleta = !!descripcionWatch && descripcionWatch.length >= 5;
const tipoYEstado         = !!tipo_obra_id && !!estado_id;
  const mostrarNombre        = true;
  const mostrarDescripcion   = isEditMode || nombreCompleto;
  const mostrarTipoEstado    = isEditMode || descripcionCompleta;
  const mostrarCliente       = isEditMode || tipoYEstado;
  const mostrarFechas        = isEditMode || mostrarCliente;
  const mostrarSectores      = isEditMode || mostrarFechas;

  useEffect(() => {
    if (initialData && tiposObra.length > 0 && estados.length > 0)
      reset(toFormDefaults(initialData) as unknown as ObraSchemaValues);
  }, [initialData, tiposObra, estados, reset]);

  // autoFocus en el campo valor al cambiar tipo
  useEffect(() => {
    if (nuevoTipo && valorRef.current) {
      valorRef.current.focus();
    }
  }, [nuevoTipo]);

  const handleMapConfirm = (result: MapPickerResult) => {
    setValue('ubicacion', result.direccion);
    setValue('latitud',   result.latitud);
    setValue('longitud',  result.longitud);
  };

  const handleClearLocation = () => {
    setValue('ubicacion', '');
    setValue('latitud',   null);
    setValue('longitud',  null);
  };

  const handleFormSubmit = (values: ObraSchemaValues) => {
    const sanitized: ObraFormValues = {
      ...(values as unknown as ObraFormValues),
      cliente_id:            (values as unknown as ObraFormValues).cliente_id || null,
      tipo_obra_id:          (values as unknown as ObraFormValues).tipo_obra_id || '',
      estado_id:             (values as unknown as ObraFormValues).estado_id || '',
      fecha_inicio_estimado: (values as unknown as ObraFormValues).fecha_inicio_estimado || '',
      fecha_fin_estimado:    (values as unknown as ObraFormValues).fecha_fin_estimado || '',
      fecha_inicio_real:     (values as unknown as ObraFormValues).fecha_inicio_real || '',
      fecha_fin_real:        (values as unknown as ObraFormValues).fecha_fin_real || '',
      sectores: isEditMode ? undefined : sectoresLocales,
    };
    onSubmit(sanitized);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack spacing={3}>

          {/* ── ENCABEZADO ORIENTATIVO ──────────────────────────── */}
          <Box sx={{
            p: 2.5, borderRadius: 3,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.04)' : '#FFFBEB',
            border: `1px dashed ${theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.3)' : '#FDE68A'}`,
          }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                bgcolor: 'rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Building2 size={18} color="#F59E0B" />
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                  {isEditMode ? 'Editando obra' : 'Registrar nueva obra'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isEditMode
                    ? 'Modificá los datos de la obra. Los cambios se guardan al presionar el botón.'
                    : 'Completá los campos a medida que avanzás — el formulario se va desbloqueando.'}
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {[
                { icon: <Building2 size={13} />, texto: 'Datos generales y ubicación' },
                { icon: <Users size={13} />,     texto: 'Cliente y tipo de obra'      },
                { icon: <Layers size={13} />,    texto: 'Sectores y planimetría'      },
              ].map((item, i) => (
                <Stack key={i} direction="row" alignItems="center" gap={0.75}>
                  <Box sx={{ color: '#F59E0B' }}>{item.icon}</Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {item.texto}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* ── PASO 1 — Nombre + Ubicación ─────────────────────── */}
          <SeccionAnimada visible={mostrarNombre}>
            <PasoHeader
              numero={1}
              titulo="Identificación de la obra"
              subtitulo="Nombre y ubicación física del proyecto"
              completado={nombreCompleto}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="nombre" control={control} render={({ field }) => (
                  <TextField
                    {...field} fullWidth label={t('obras.form.nombre')}
                    placeholder="Ej: Edificio Cordillera, Vivienda Unifamiliar Lote 12..."
                    error={!!errors.nombre} helperText={errors.nombre?.message ?? ''}
                    autoFocus={!isEditMode}
                  />
                )} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="ubicacion" control={control} render={({ field }) => (
                  <TextField
                    {...field} fullWidth
                    label={t('obras.form.ubicacion')}
                    placeholder={t('obras.form.ubicacion_placeholder')}
                    error={!!errors.ubicacion}
                    helperText={
                      tieneCoords
                        ? t('obras.form.ubicacion_coords', { lat: latNum!.toFixed(5), lng: lngNum!.toFixed(5) })
                        : errors.ubicacion?.message ?? t('obras.form.ubicacion_helper')
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {(ubicacionWatch || tieneCoords) && (
                            <Tooltip title={t('obras.form.limpiar_ubicacion')}>
                              <IconButton size="small" onClick={handleClearLocation} sx={{ mr: 0.5 }}>
                                <X size={14} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={t('obras.form.seleccionar_mapa')}>
                            <IconButton size="small" onClick={() => setMapOpen(true)} sx={{
                              bgcolor: tieneCoords ? theme.palette.text.primary : theme.palette.action.hover,
                              color:   tieneCoords ? theme.palette.background.paper : theme.palette.text.secondary,
                              '&:hover': { bgcolor: tieneCoords ? theme.palette.text.secondary : theme.palette.divider },
                            }}>
                              <MapPin size={16} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                )} />
              </Grid>
            </Grid>
          </SeccionAnimada>

          {/* ── PASO 2 — Descripción ────────────────────────────── */}
          <SeccionAnimada visible={mostrarDescripcion}>
            <Divider sx={{ mb: 3 }} />
            <PasoHeader
              numero={2}
              titulo="Descripción del proyecto"
              subtitulo="Detallá el alcance y las características principales de la obra"
              completado={descripcionCompleta}
            />
            <Controller name="descripcion" control={control} render={({ field }) => (
              <TextField
                {...field} fullWidth multiline minRows={3}
                label={t('obras.form.descripcion')}
                placeholder="Describí el alcance del proyecto, materiales principales, condiciones especiales..."
                error={!!errors.descripcion} helperText={errors.descripcion?.message ?? ''}
              />
            )} />
          </SeccionAnimada>

          {/* ── PASO 3 — Tipo + Estado ──────────────────────────── */}
          <SeccionAnimada visible={mostrarTipoEstado}>
            <Divider sx={{ mb: 3 }} />
            <PasoHeader
              numero={3}
              titulo="Clasificación y estado"
              subtitulo="Tipo de obra y estado inicial del proyecto"
              completado={tipoYEstado}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="tipo_obra_id" control={control} render={({ field }) => (
                  <TextField
                    select fullWidth label={t('obras.form.tipo_obra')}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    error={!!errors.tipo_obra_id} helperText={errors.tipo_obra_id?.message ?? ''}
                  >
                    <MenuItem value="">{t('obras.form.seleccionar')}</MenuItem>
                    {tiposObra.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>
                    ))}
                  </TextField>
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="estado_id" control={control} render={({ field }) => (
                  <TextField
                    select fullWidth label={t('obras.form.estado')}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    error={!!errors.estado_id} helperText={errors.estado_id?.message ?? ''}
                  >
                    <MenuItem value="">{t('obras.form.seleccionar')}</MenuItem>
                    {estados.map((estado) => (
                      <MenuItem key={estado.id} value={estado.id}>{estado.nombre}</MenuItem>
                    ))}
                  </TextField>
                )} />
              </Grid>
            </Grid>
          </SeccionAnimada>

          {/* ── PASO 4 — Cliente ────────────────────────────────── */}
          <SeccionAnimada visible={mostrarCliente}>
            <Divider sx={{ mb: 3 }} />
            <PasoHeader
              numero={4}
              titulo="Cliente asociado"
              subtitulo="El cliente es opcional — podés asignarlo ahora o después"
              completado={false}
            />
            <Controller name="cliente_id" control={control} render={({ field }) => (
              <TextField
                select fullWidth label={t('obras.form.cliente')}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                error={!!errors.cliente_id}
                helperText={errors.cliente_id?.message ?? t('obras.form.cliente_helper')}
              >
                <MenuItem value="">{t('obras.form.sin_cliente')}</MenuItem>
                {clientes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {clienteLabel(c)}
                    {c.telefono && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.disabled' }}>
                        · {c.telefono}
                      </Typography>
                    )}
                  </MenuItem>
                ))}
              </TextField>
            )} />
          </SeccionAnimada>

          {/* ── PASO 5 — Fechas ─────────────────────────────────── */}
          <SeccionAnimada visible={mostrarFechas}>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" alignItems="center" gap={1} mb={1}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%',
                bgcolor: theme.palette.action.hover,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12, fontWeight: 800 }}>5</Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700}>Fechas del proyecto</Typography>
                <Typography variant="caption" color="text.secondary">
                  Las fechas estimadas son opcionales y sirven para planificar el cronograma
                </Typography>
              </Box>
            </Stack>

            {/* Aclaración fechas reales */}
            <Box sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1,
              p: 1.5, mb: 2.5, ml: 4, borderRadius: 2,
              bgcolor: theme.palette.action.hover,
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Clock size={14} color={theme.palette.text.secondary} style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Las fechas <strong>reales</strong> de inicio y fin se completan cuando la obra efectivamente
                comience y finalice, no al crearla.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" fontWeight={700} sx={{
                  color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {t('obras.form.fechas_estimadas')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="fecha_inicio_estimado" control={control} render={({ field }) => (
                  <TextField
                    {...field} fullWidth type="date"
                    label={t('obras.form.inicio_estimado')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.fecha_inicio_estimado}
                    helperText={errors.fecha_inicio_estimado?.message ?? ''}
                  />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller name="fecha_fin_estimado" control={control} render={({ field }) => (
                  <TextField
                    {...field} fullWidth type="date"
                    label={t('obras.form.fin_estimado')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.fecha_fin_estimado}
                    helperText={errors.fecha_fin_estimado?.message ?? ''}
                  />
                )} />
              </Grid>

              {/* Fechas reales — solo en edición */}
              {isEditMode && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 1, mb: -0.5 }}>
                      <Clock size={13} color={theme.palette.text.disabled} />
                      <Typography variant="caption" color="text.disabled" fontWeight={600}>
                        Fechas reales — se completan al iniciar y finalizar la obra
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="fecha_inicio_real" control={control} render={({ field }) => (
                      <TextField
                        {...field} fullWidth type="date"
                        label={t('obras.form.inicio_real')}
                        slotProps={{ inputLabel: { shrink: true } }}
                        error={!!errors.fecha_inicio_real}
                        helperText={errors.fecha_inicio_real?.message ?? ''}
                      />
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="fecha_fin_real" control={control} render={({ field }) => (
                      <TextField
                        {...field} fullWidth type="date"
                        label={t('obras.form.fin_real')}
                        slotProps={{ inputLabel: { shrink: true } }}
                        error={!!errors.fecha_fin_real}
                        helperText={errors.fecha_fin_real?.message ?? ''}
                      />
                    )} />
                  </Grid>
                </>
              )}
            </Grid>
          </SeccionAnimada>

          {/* ── PASO 6 — Sectores ───────────────────────────────── */}
          <SeccionAnimada visible={mostrarSectores}>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" alignItems="center" gap={1} mb={1}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%',
                bgcolor: theme.palette.action.hover,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12, fontWeight: 800 }}>6</Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700}>Estructura de la obra</Typography>
                <Typography variant="caption" color="text.secondary">
                  Organizá los trabajos por zona física de la obra
                </Typography>
              </Box>
            </Stack>

            <Box sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1,
              p: 1.5, mb: 2, ml: 4, borderRadius: 2,
              bgcolor: theme.palette.action.hover,
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Layers size={14} color={theme.palette.text.secondary} style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Los sectores permiten organizar los trabajos por zona física (ej: Piso 2, Ala Norte, Unidad 2A).
                Podés agregarlos ahora o después desde la edición de la obra.
              </Typography>
            </Box>

            <Box sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2, p: 2, bgcolor: 'background.paper', ml: 4,
            }}>
              {/* Mini-form */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}
                alignItems="flex-start" flexWrap="wrap">
                <TextField
                  select size="small" label="Tipo" value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value as SectorTipo)}
                  sx={{ minWidth: 120 }}
                >
                  {SECTOR_TIPOS_OPTIONS.map((op) => (
                    <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small" label="Nombre / Valor"
                  placeholder="ej: A, Norte, PB"
                  value={nuevoValor}
                  onChange={(e) => setNuevoValor(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAgregarSector(); } }}
                  inputRef={valorRef}
                  sx={{ flex: 1, minWidth: 120 }}
                />

                <TextField
                  select size="small" label="Hijo de"
                  value={nuevoParentKey}
                  onChange={(e) => setNuevoParentKey(e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">Ninguno (raíz)</MenuItem>
                  {isEditMode
                    ? parentOptionsEdit.map(({ sector, depth }) => (
                        <MenuItem key={sector.id} value={String(sector.id)} sx={{ pl: 2 + depth * 2 }}>
                          {depth > 0 ? '└ ' : ''}{nombreCompletoSector(sector)}
                        </MenuItem>
                      ))
                    : parentOptionsLocal.map(({ sector, depth }) => (
                        <MenuItem key={sector.tempId} value={sector.tempId} sx={{ pl: 2 + depth * 2 }}>
                          {depth > 0 ? '└ ' : ''}{nombreCompletoSector(sector)}
                        </MenuItem>
                      ))
                  }
                </TextField>

                <Button
                  variant="outlined" size="small"
                  onClick={handleAgregarSector}
                  disabled={!nuevoValor.trim() || crearSectorMutation.isPending}
                  startIcon={<Plus size={14} />}
                  sx={{ whiteSpace: 'nowrap', height: 40 }}
                >
                  Agregar
                </Button>
              </Stack>

              {/* Árbol con indentación */}
              {isEditMode && sectoresQuery.isLoading ? (
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  Cargando sectores...
                </Typography>
              ) : (isEditMode ? flattenedEdit : flattenedLocal).length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  Sin sectores definidos. Podés agregarlos ahora o después.
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {isEditMode
                    ? flattenedEdit.map(({ sector, depth }: { sector: Sector; depth: number }) => (
                        <Box key={sector.id}
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: depth * 3 }}>
                          {depth > 0 && (
                            <Typography sx={{ color: 'text.disabled', fontSize: 12, lineHeight: 1 }}>└</Typography>
                          )}
                          <Chip
                            label={nombreCompletoSector(sector)}
                            onDelete={() => handleEliminarSector(undefined, sector.id)}
                            size="small"
                            disabled={eliminarSectorMutation.isPending}
                            sx={{ bgcolor: theme.palette.action.hover }}
                          />
                        </Box>
                      ))
                    : flattenedLocal.map(({ sector, depth }: { sector: SectorLocal; depth: number }) => (
                        <Box key={sector.tempId}
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: depth * 3 }}>
                          {depth > 0 && (
                            <Typography sx={{ color: 'text.disabled', fontSize: 12, lineHeight: 1 }}>└</Typography>
                          )}
                          <Chip
                            label={nombreCompletoSector(sector)}
                            onDelete={() => handleEliminarSector(sector.tempId, undefined)}
                            size="small"
                            sx={{ bgcolor: theme.palette.action.hover }}
                          />
                        </Box>
                      ))
                  }
                </Stack>
              )}
            </Box>
          </SeccionAnimada>

          {/* ── Botón guardar ────────────────────────────────────── */}
          <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
            <Button type="submit" variant="contained" disabled={isSubmitting} size="large">
              {isSubmitting ? t('obras.form.guardando') : t('obras.form.guardar')}
            </Button>
          </Stack>

        </Stack>
      </Box>

      <MapPickerModal
        open={mapOpen} onClose={() => setMapOpen(false)} onConfirm={handleMapConfirm}
        initialLatitud={latNum} initialLongitud={lngNum} initialDireccion={ubicacionWatch ?? ''}
      />
    </Paper>
  );
}