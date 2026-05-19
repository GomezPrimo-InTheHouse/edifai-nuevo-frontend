import React, { useRef, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Collapse, Divider, IconButton, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { Camera, CheckCircle, ChevronDown, ChevronUp, ImagePlus, XCircle } from 'lucide-react';
import { useAprobarAvance, useAvancesByLabor, useCrearAvance, useRechazarAvance } from '../hooks/useAvances';
import { avanceApi, type Avance } from '../../../services/api/avance.api';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useAuthStore } from '../../../app/store/auth.store';

const ROLES_ADMIN = [1, 3, 4, 6];
const ROLES_WORKER = [7, 8];

const PORCENTAJES = [25, 50, 75, 100];

const PROGRESO_COLORS: Record<number, string> = {
  25:  '#EA580C',
  50:  '#F59E0B',
  75:  '#2563EB',
  100: '#16A34A',
};

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)}d`;
}

function EstadoChip({ estado }: { estado: string }) {
  const config = {
    pendiente: { label: 'Pendiente', color: '#F59E0B', bg: '#FFFBEB' },
    aprobado:  { label: 'Aprobado',  color: '#16A34A', bg: '#F0FDF4' },
    rechazado: { label: 'Rechazado', color: '#DC2626', bg: '#FEF2F2' },
  }[estado] ?? { label: estado, color: '#64748B', bg: '#F8FAFC' };

  return (
    <Chip
      label={config.label} size="small"
      sx={{ bgcolor: config.bg, color: config.color, fontWeight: 700, fontSize: 11 }}
    />
  );
}

function AvanceItem({ avance, esAdmin, obra_id, labor_id }: {
  avance: Avance; esAdmin: boolean; obra_id: number; labor_id: number;
}) {
  const notify = useNotify();
  const [expandido, setExpandido] = useState(false);
  const [observacion, setObservacion] = useState('');
  const aprobarMutation = useAprobarAvance(obra_id, labor_id);
  const rechazarMutation = useRechazarAvance(obra_id, labor_id);

  const handleAprobar = async () => {
    const confirmed = await notify.confirm({
      title: '¿Aprobar este avance?',
      message: 'Se actualizará el progreso de la labor.',
      confirmLabel: 'Aprobar',
    });
    if (!confirmed) return;
    try {
      await aprobarMutation.mutateAsync({ id: avance.id, observacion_admin: observacion || undefined });
      notify.success('Avance aprobado.');
      setExpandido(false);
    } catch {
      notify.error('No se pudo aprobar el avance.');
    }
  };

  const handleRechazar = async () => {
    if (!observacion.trim()) { notify.error('Debés ingresar una observación para rechazar.'); return; }
    const confirmed = await notify.confirm({
      title: '¿Rechazar este avance?',
      message: 'Se notificará al trabajador con tu observación.',
      confirmLabel: 'Rechazar', severity: 'error',
    });
    if (!confirmed) return;
    try {
      await rechazarMutation.mutateAsync({ id: avance.id, observacion_admin: observacion });
      notify.success('Avance rechazado.');
      setExpandido(false);
    } catch {
      notify.error('No se pudo rechazar el avance.');
    }
  };

  const porcentajeColor = avance.porcentaje_cambio != null
    ? PROGRESO_COLORS[avance.porcentaje_cambio] ?? '#2563EB'
    : '#2563EB';

  return (
    <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' } }}
        onClick={() => setExpandido((p) => !p)}
      >
        {avance.imagen_url && (
          <Box component="img" src={avance.imagen_url} alt="Avance"
            sx={{ width: 56, height: 56, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }} flexWrap="wrap">
            <EstadoChip estado={avance.estado} />
            {avance.porcentaje_cambio != null && (
              <Chip
                label={`+${avance.porcentaje_cambio}%`} size="small"
                sx={{ bgcolor: `${porcentajeColor}18`, color: porcentajeColor, fontWeight: 700, fontSize: 11 }}
              />
            )}
            <Typography variant="caption" color="text.secondary">{tiempoRelativo(avance.fecha_registro)}</Typography>
          </Stack>
          {avance.descripcion && (
            <Typography variant="body2" color="text.secondary"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {avance.descripcion}
            </Typography>
          )}
        </Box>
        <IconButton size="small">{expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</IconButton>
      </Box>

      <Collapse in={expandido}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {avance.imagen_url && (
            <Box component="img" src={avance.imagen_url} alt="Avance completo"
              sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 2, mb: 2, bgcolor: '#F8FAFC' }}
            />
          )}
          {avance.descripcion && (
            <Typography variant="body2" sx={{ mb: 2 }}>{avance.descripcion}</Typography>
          )}
          {avance.observacion_admin && (
            <Alert severity={avance.estado === 'aprobado' ? 'success' : 'error'} sx={{ mb: 2, fontSize: 13 }}>
              <strong>Observación admin:</strong> {avance.observacion_admin}
            </Alert>
          )}
          {esAdmin && avance.estado === 'pendiente' && (
            <Stack spacing={1.5}>
              <TextField
                fullWidth size="small" multiline rows={2}
                label="Observación (obligatoria para rechazar)"
                value={observacion} onChange={(e) => setObservacion(e.target.value)}
              />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" size="small"
                  startIcon={<CheckCircle size={16} />} onClick={handleAprobar}
                  disabled={aprobarMutation.isPending}>
                  Aprobar
                </Button>
                <Button variant="outlined" color="error" size="small"
                  startIcon={<XCircle size={16} />} onClick={handleRechazar}
                  disabled={rechazarMutation.isPending}>
                  Rechazar
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

interface AvancesLaborProps {
  obra_id: number;
  labor_id: number;
}

export const AvancesLabor: React.FC<AvancesLaborProps> = ({ obra_id, labor_id }) => {
  const notify = useNotify();
  const user = useAuthStore((s) => s.user);
  const esAdmin = ROLES_ADMIN.includes(user?.rol_id ?? 0);
  const esWorker = ROLES_WORKER.includes(user?.rol_id ?? 0);

  const { data: avances = [], isLoading } = useAvancesByLabor(obra_id, labor_id);
  const crearMutation = useCrearAvance();

  const [descripcion, setDescripcion] = useState('');
  const [porcentaje, setPorcentaje] = useState<number | null>(null);
  const [imagenUrl, setImagenUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await avanceApi.uploadImagen(file);
      setImagenUrl(url);
      setPreviewUrl(url);
    } catch {
      notify.error('Error al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleSubmit = async () => {
    if (!descripcion.trim() && !imagenUrl) {
      notify.error('Debés agregar al menos una descripción o imagen.');
      return;
    }
    try {
      await crearMutation.mutateAsync({
        obra_id, labor_id,
        descripcion: descripcion.trim() || undefined,
        imagen_url: imagenUrl || undefined,
        porcentaje_cambio: porcentaje ?? undefined,
      });
      setDescripcion('');
      setPorcentaje(null);
      setImagenUrl('');
      setPreviewUrl(null);
      notify.success('Avance registrado correctamente.');
    } catch {
      notify.error('No se pudo registrar el avance.');
    }
  };

  return (
    <Card sx={{ borderRadius: 3, mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Avances de la labor</Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Formulario — solo workers */}
        {esWorker && (
          <Box sx={{ mb: 3, p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B', letterSpacing: '0.05em' }}>
              REGISTRAR NUEVO AVANCE
            </Typography>
            <Stack spacing={2}>

              {/* Descripción */}
              <TextField
                fullWidth size="small" multiline rows={3}
                label="Describí el avance realizado"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Se completó el encofrado del sector norte..."
              />

              {/* Porcentaje — botones fijos */}
              <Box>
                <Typography variant="caption" fontWeight={600} sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                  % DE AVANCE
                </Typography>
                <Stack direction="row" spacing={1}>
                  {PORCENTAJES.map((p) => {
                    const color = PROGRESO_COLORS[p];
                    const selected = porcentaje === p;
                    return (
                      <Button
                        key={p}
                        size="small"
                        variant={selected ? 'contained' : 'outlined'}
                        onClick={() => setPorcentaje(selected ? null : p)}
                        sx={{
                          minWidth: 56, fontWeight: 700, fontSize: 13,
                          borderColor: color,
                          color: selected ? '#fff' : color,
                          bgcolor: selected ? color : 'transparent',
                          '&:hover': {
                            bgcolor: selected ? color : `${color}18`,
                            borderColor: color,
                          },
                        }}
                      >
                        {p}%
                      </Button>
                    );
                  })}
                </Stack>
              </Box>

              {/* Imagen */}
              <Box>
                <Typography variant="caption" fontWeight={600} sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                  FOTO DEL AVANCE
                </Typography>

                {previewUrl ? (
                  <Box sx={{ position: 'relative', width: 140 }}>
                    <Box component="img" src={previewUrl} alt="Preview"
                      sx={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 2, border: '1px solid #E2E8F0' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => { setPreviewUrl(null); setImagenUrl(''); }}
                      sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
                    >
                      <XCircle size={14} />
                    </IconButton>
                  </Box>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Subir desde galería">
                      <Button
                        variant="outlined" size="small"
                        startIcon={uploading ? <CircularProgress size={14} /> : <ImagePlus size={16} />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        sx={{ borderStyle: 'dashed' }}
                      >
                        {uploading ? 'Subiendo...' : 'Galería'}
                      </Button>
                    </Tooltip>
                    <Tooltip title="Tomar foto">
                      <Button
                        variant="outlined" size="small"
                        startIcon={<Camera size={16} />}
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={uploading}
                        sx={{ borderStyle: 'dashed', display: { xs: 'flex', md: 'none' } }}
                      >
                        Cámara
                      </Button>
                    </Tooltip>
                  </Stack>
                )}
              </Box>

              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

              <Button
                variant="contained" onClick={handleSubmit}
                disabled={crearMutation.isPending || uploading || (!descripcion.trim() && !imagenUrl)}
                sx={{ alignSelf: 'flex-end', px: 3 }}
              >
                {crearMutation.isPending ? 'Registrando...' : 'Registrar avance'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Lista de avances */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isLoading && avances.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No hay avances registrados para esta labor.
          </Typography>
        )}

        {!isLoading && avances.length > 0 && (
          <Stack spacing={1.5}>
            {avances.map((a) => (
              <AvanceItem key={a.id} avance={a} esAdmin={esAdmin} obra_id={obra_id} labor_id={labor_id} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};