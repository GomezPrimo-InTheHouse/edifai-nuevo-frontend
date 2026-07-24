import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, CircularProgress, Divider,
  Grid, Stack, Typography, useTheme,
} from '@mui/material';
import {
  ArrowLeft, MapPin, FileText, Calendar, Hammer, Pencil,
  Clock, CheckCircle2, Building2, FileDown, FileSpreadsheet,
  Wallet, TrendingUp, TrendingDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { useObraDetail, useEstadosObraOptions, useTiposObraOptions, useResumenFinancieroObra } from '../hooks/useObras';
import { LaboresDeObra } from '../components/LaboresDeObra';
import { useLaborsByObra } from '../../labores/hooks/useLabores';
import { usePresupuestosList } from '../../presupuestos/hooks/usePresupuestos';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
import { presupuestoMaterialApi } from '../../../services/api/presupuestoMaterial.api';
import { generarPdfDetalleObra, generarExcelDetalleObra } from '../../../services/pdf/obraDetallePdf';
import type { ObraExportData, CompraExportData } from '../../../services/pdf/obraDetallePdf';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useSectoresConStats } from '../hooks/useSectores';
import { nombreCompletoSector } from '../types/sector.types';
import type { SectorConStats } from '../types/sector.types';
import { useAvancesBySector } from '../../labores/hooks/useAvances';
import type { Avance } from '../../../services/api/avance.api';
import { useComprasPorObra } from '../../compras/hooks/useCompras';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
});

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatPesos(valor: number): string {
  return `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
}

const OBRA_ESTADO_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  'En proceso': { bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  'Pausada':    { bg: '#FEF9C3', text: '#A16207', dot: '#EAB308' },
  'Finalizada': { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
  'Cancelada':  { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
};

const ESTADO_AVANCE_COLORS: Record<string, string> = {
  pendiente: '#F59E0B', aprobado: '#16A34A', rechazado: '#DC2626',
};

function ObraEstadoBadge({ nombre }: { nombre: string }) {
  const config = OBRA_ESTADO_CONFIG[nombre] ?? { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75,
      px: 1.5, py: 0.6, borderRadius: 99, bgcolor: config.bg,
    }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: config.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: config.text, lineHeight: 1 }}>
        {nombre}
      </Typography>
    </Box>
  );
}

function FechaPill({ icon, label, value, accent = false }: {
  icon: React.ReactNode; label: string; value: string; accent?: boolean;
}) {
  const theme = useTheme();
  return (
    <Box sx={{
      p: 2, borderRadius: 2.5, flex: 1,
      bgcolor: accent ? '#0F172A' : theme.palette.action.hover,
      border: accent ? 'none' : `1px solid ${theme.palette.divider}`,
    }}>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
        <Box sx={{ color: 'text.disabled' }}>{icon}</Box>
        <Typography variant="caption" sx={{
          color: accent ? '#94A3B8' : 'text.secondary',
          fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ fontWeight: 700, color: accent ? '#FFFFFF' : 'text.primary', fontSize: 15 }}>
        {value}
      </Typography>
    </Box>
  );
}

function ObraMapa({ latitud, longitud, nombre }: { latitud: number; longitud: number; nombre: string }) {
  const theme = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      zoomControl: true, dragging: true, scrollWheelZoom: false, doubleClickZoom: true,
    }).setView([latitud, longitud], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    L.marker([latitud, longitud]).addTo(map)
      .bindPopup(`<strong>${nombre}</strong>`, { closeButton: false }).openPopup();
    mapRef.current = map;
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [latitud, longitud, nombre]);

  return (
    <Box ref={mapContainerRef} sx={{
      height: 240, width: '100%', borderRadius: 2, overflow: 'hidden',
      border: `1px solid ${theme.palette.divider}`, mt: 2,
    }} />
  );
}

// ── Árbol de sectores ─────────────────────────────────────────
function SectorTree({
  sectores, selectedId, collapsedIds, onSelect, onToggle, parentId = null, depth = 0,
}: {
  sectores: SectorConStats[];
  selectedId: number | null;
  collapsedIds: Set<number>;
  onSelect: (id: number) => void;
  onToggle: (id: number) => void;
  parentId?: number | null;
  depth?: number;
}) {
  const theme = useTheme();
  const children = sectores
    .filter(s => (s.parent_id ?? null) === parentId)
    .sort((a, b) => a.orden - b.orden || a.id - b.id);

  if (children.length === 0) return null;

  return (
    <Stack spacing={0.5}>
      {children.map(sector => {
        const hasChildren = sectores.some(s => s.parent_id === sector.id);
        const isCollapsed = collapsedIds.has(sector.id);
        const isSelected  = selectedId === sector.id;

        return (
          <Box key={sector.id}>
            <Stack
              direction="row" alignItems="center"
              onClick={() => onSelect(sector.id)}
              sx={{
                ml: depth * 2, py: 0.75, px: 1, borderRadius: 1.5,
                cursor: 'pointer',
                bgcolor: isSelected ? 'rgba(245,158,11,0.08)' : 'transparent',
                border: `1px solid ${isSelected ? '#F59E0B' : 'transparent'}`,
                transition: 'all 0.15s',
                '&:hover': { bgcolor: isSelected ? 'rgba(245,158,11,0.12)' : theme.palette.action.hover },
              }}
            >
              {hasChildren ? (
                <Box
                  component="span"
                  onClick={(e) => { e.stopPropagation(); onToggle(sector.id); }}
                  sx={{
                    mr: 0.5, width: 16, height: 16, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: 'text.disabled', cursor: 'pointer',
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  ▾
                </Box>
              ) : (
                <Box sx={{ width: 16, flexShrink: 0, mr: 0.5 }} />
              )}

              <Typography
                variant="body2"
                fontWeight={isSelected ? 700 : 500}
                color={isSelected ? '#F59E0B' : 'text.primary'}
                sx={{ flex: 1, fontSize: 13 }}
              >
                {nombreCompletoSector(sector)}
              </Typography>

              <Box sx={{
                ml: 1, px: 0.75, py: 0.1, borderRadius: 1, flexShrink: 0,
                bgcolor: sector.labor_count > 0 ? 'rgba(245,158,11,0.12)' : theme.palette.action.hover,
              }}>
                <Typography variant="caption" sx={{
                  fontSize: 10, fontWeight: 700,
                  color: sector.labor_count > 0 ? '#F59E0B' : 'text.disabled',
                }}>
                  {sector.labor_count}
                </Typography>
              </Box>
            </Stack>

            {hasChildren && !isCollapsed && (
              <SectorTree
                sectores={sectores} selectedId={selectedId}
                collapsedIds={collapsedIds} onSelect={onSelect} onToggle={onToggle}
                parentId={sector.id} depth={depth + 1}
              />
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

// ── Card de avances por sector ──────────────────────────────────
function AvancesPorSectorCard({ sectorId, sectores }: { sectorId: number; sectores: SectorConStats[] }) {
  const theme = useTheme();
  const { data: avances = [], isLoading } = useAvancesBySector(sectorId);
  const sector = sectores.find(s => s.id === sectorId);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
          Avances — {sector ? nombreCompletoSector(sector) : 'Sector'}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2 }}>
          Incluye avances de sub-sectores
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        )}
        {!isLoading && avances.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No hay avances registrados en este sector.
          </Typography>
        )}
        {!isLoading && avances.length > 0 && (
          <Stack spacing={1.5}>
            {avances.map((a: Avance) => (
              <Box key={a.id} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={700}>{a.labor_nombre}</Typography>
                  <Box sx={{
                    px: 1, py: 0.25, borderRadius: 99,
                    bgcolor: `${ESTADO_AVANCE_COLORS[a.estado]}18`, color: ESTADO_AVANCE_COLORS[a.estado],
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {a.estado}
                  </Box>
                </Stack>
                {a.descripcion && (
                  <Typography variant="body2" color="text.secondary" sx={{
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {a.descripcion}
                  </Typography>
                )}
                <Typography variant="caption" color="text.disabled">
                  {a.trabajador_nombre} · {new Date(a.fecha_registro).toLocaleDateString('es-AR')}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

// ── Card de Inversión Total (Presupuestado vs Ejecutado) ────────
function InversionTotalCard({
  totalManoObra, totalMaterialesPresupuestado, totalCompras,
}: {
  totalManoObra: number;
  totalMaterialesPresupuestado: number;
  totalCompras: number;
}) {
  const theme = useTheme();
  const totalPresupuestado = totalManoObra + totalMaterialesPresupuestado;
  const totalEjecutado = totalManoObra + totalCompras;
  const diferencia = totalEjecutado - totalPresupuestado;
  const esMayor = diferencia > 0;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2, bgcolor: '#F59E0B',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Wallet size={18} color="#0F172A" />
          </Box>
          <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
            Inversión Total
          </Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="caption" sx={{
          color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase',
          fontSize: 10, letterSpacing: 0.5, display: 'block', mb: 1,
        }}>
          Presupuestado
        </Typography>
        <Stack spacing={0.75} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Mano de obra</Typography>
            <Typography variant="body2" fontWeight={600}>{formatPesos(totalManoObra)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Materiales (plan)</Typography>
            <Typography variant="body2" fontWeight={600}>{formatPesos(totalMaterialesPresupuestado)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
            <Typography variant="body2" fontWeight={700}>Total presupuestado</Typography>
            <Typography variant="body2" fontWeight={700}>{formatPesos(totalPresupuestado)}</Typography>
          </Stack>
        </Stack>

        <Typography variant="caption" sx={{
          color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase',
          fontSize: 10, letterSpacing: 0.5, display: 'block', mb: 1,
        }}>
          Ejecutado
        </Typography>
        <Stack spacing={0.75} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Mano de obra</Typography>
            <Typography variant="body2" fontWeight={600}>{formatPesos(totalManoObra)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Compras registradas</Typography>
            <Typography variant="body2" fontWeight={600}>{formatPesos(totalCompras)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
            <Typography variant="body2" fontWeight={700} color="#16A34A">Total ejecutado</Typography>
            <Typography variant="body2" fontWeight={700} color="#16A34A">{formatPesos(totalEjecutado)}</Typography>
          </Stack>
        </Stack>

        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2,
          bgcolor: esMayor ? 'rgba(217,119,6,0.08)' : 'rgba(22,163,74,0.08)',
        }}>
          {esMayor ? <TrendingUp size={16} color="#D97706" /> : <TrendingDown size={16} color="#16A34A" />}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Diferencia (ejecutado vs presupuestado)
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: esMayor ? '#D97706' : '#16A34A' }}>
              {diferencia >= 0 ? '+' : ''}{formatPesos(diferencia)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── ObraDetailPage ────────────────────────────────────────────
export const ObraDetailPage: React.FC = () => {
  const { t }       = useTranslation();
  const theme       = useTheme();
  const navigate    = useNavigate();
  const notify      = useNotify();
  const { id }      = useParams<{ id: string }>();
  const obraId      = Number(id);

  const [exportando,        setExportando]       = useState(false);
  const [selectedSectorId,  setSelectedSectorId] = useState<number | null>(null);
  const [collapsedIds,      setCollapsedIds]     = useState<Set<number>>(new Set());

  const { data: obra,        isLoading, isError, refetch } = useObraDetail(obraId);
  const { data: estados    = [] } = useEstadosObraOptions();
  const { data: tiposObra  = [] } = useTiposObraOptions();
  const { data: laboresObra = [] } = useLaborsByObra(obraId);
  const { data: presupuestos = [] } = usePresupuestosList();
  const { data: todosEstados = [] } = useEstadosGenerales();
  const { data: sectoresConStats = [] } = useSectoresConStats(obraId);
  const { data: comprasResponse } = useComprasPorObra(obraId);
  const { data: resumenFinanciero } = useResumenFinancieroObra(obraId);

  const compras = comprasResponse?.data ?? [];
  const totalCompras = comprasResponse?.total_compras ?? 0;
  const totalManoObraCard = resumenFinanciero?.total_mano_obra ?? 0;
  const totalMaterialesPresupuestadoCard = resumenFinanciero?.total_materiales_presupuestado ?? 0;

  if (isLoading) return <LoadingState message={t('obras.detail.loading')} />;
  if (isError)   return <ErrorState title="Error" message={t('obras.detail.error')} onRetry={refetch} />;
  if (!obra)     return <ErrorState title={t('obras.detail.no_encontrada')} message={t('obras.detail.no_encontrada_msg')} />;

  const estadoNombre = estados.find(e => e.id === obra.estado_id)?.nombre  ?? t('obras.detail.sin_estado');
  const tipoNombre   = tiposObra.find(tp => tp.id === obra.tipo_obra_id)?.nombre ?? t('obras.detail.sin_tipo');

  const hoy           = new Date();
  const finEstimado   = obra.fecha_fin_estimado ? new Date(obra.fecha_fin_estimado) : null;
  const diasRestantes = finEstimado
    ? Math.ceil((finEstimado.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const latNum = obra.latitud  != null ? Number(obra.latitud)  : null;
  const lngNum = obra.longitud != null ? Number(obra.longitud) : null;
  const tieneCoords = latNum != null && !isNaN(latNum) && lngNum != null && !isNaN(lngNum);

  const toggleCollapse = (id: number) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectSector = (id: number) => {
    setSelectedSectorId(prev => prev === id ? null : id);
  };

  const buildComprasExportData = (): CompraExportData[] => {
    return compras.map((c) => ({
      fecha: c.fecha,
      descripcion: c.descripcion,
      obra_nombre: c.obra_nombre,
      sector_nombre: c.sector_valor && c.sector_tipo
        ? nombreCompletoSector({ tipo: c.sector_tipo, valor: c.sector_valor })
        : null,
      especialidad_nombre: c.especialidad_nombre ?? null,
      material_nombre: c.material_nombre ?? null,
      cantidad: c.cantidad,
      proveedor: c.proveedor,
      monto: c.monto,
    }));
  };

  const buildObraExportData = async (): Promise<ObraExportData> => {
    const estadosMap: Record<number, string> = {};
    todosEstados.forEach(e => { if (e.id) estadosMap[e.id] = e.nombre; });

    const laboresData = await Promise.all(
      laboresObra.map(async (labor: any) => {
        const presupuesto = presupuestos.find(p => p.labor_id === labor.id);
        let materiales: any[] = [];
        if (presupuesto?.id) {
          try {
            const mats = await presupuestoMaterialApi.getByPresupuesto(presupuesto.id);
            materiales = mats.map((m: any) => ({
              nombre:          m.material_nombre ?? '-',
              descripcion:     m.descripcion     ?? null,
              tipo:            m.tipo_nombre      ?? null,
              unidad:          m.unidad           ?? '-',
              cantidad:        Number(m.cantidad),
              precio_unitario: Number(m.precio_unitario),
              subtotal:        Number(m.subtotal),
              stock_actual:    m.stock_actual != null ? Number(m.stock_actual) : null,
              origen:          m.origen        ?? null,
              estado:          m.estado_nombre ?? null,
            }));
          } catch { materiales = []; }
        }
        const costoManoObra   = Number(presupuesto?.costo_mano_obra ?? 0);
        const costoMateriales = materiales.reduce((a: number, m: any) => a + m.subtotal, 0);
        return {
          id: labor.id,
          nombre: labor.nombre,
          estado_nombre: estadosMap[labor.estado_id] ?? '-',
          trabajador_nombre: labor.trabajador_nombre
            ? `${labor.trabajador_nombre} ${labor.trabajador_apellido ?? ''}`.trim()
            : null,
          costo_mano_obra:   costoManoObra,
          costo_materiales:  costoMateriales,
          total:             costoManoObra + costoMateriales,
          materiales,
        };
      })
    );

    return {
      nombre:       obra.nombre,
      ubicacion:    obra.ubicacion,
      estado_nombre: estadoNombre,
      fecha_inicio: obra.fecha_inicio_estimado,
      fecha_fin:    obra.fecha_fin_estimado,
      labores:      laboresData,
      compras:      buildComprasExportData(),
    };
  };

  const handleExportarPdf = async () => {
    setExportando(true);
    try {
      const data = await buildObraExportData();
      generarPdfDetalleObra(data);
    } catch {
      notify.error(t('obras.detail.error_exportar'));
    } finally {
      setExportando(false);
    }
  };

  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      const data = await buildObraExportData();
      generarExcelDetalleObra(data);
    } catch {
      notify.error(t('obras.detail.error_exportar'));
    } finally {
      setExportando(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={obra.nombre}
        subtitle={t('obras.detail.subtitle')}
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }} useFlexGap>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/obras')} size="small">
              {t('obras.acciones.volver')}
            </Button>
            <Button variant="outlined" size="small"
              startIcon={exportando ? <CircularProgress size={14} /> : <FileDown size={16} />}
              onClick={handleExportarPdf} disabled={exportando}>
              PDF
            </Button>
            <Button variant="outlined" size="small"
              startIcon={exportando ? <CircularProgress size={14} /> : <FileSpreadsheet size={16} />}
              onClick={handleExportarExcel} disabled={exportando}>
              Excel
            </Button>
            <Button variant="contained" size="small"
              startIcon={<Pencil size={16} />}
              onClick={() => navigate(`/obras/${obra.id}/editar`)}>
              {t('obras.acciones.editar')}
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>

        {/* ── Columna principal ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>

            {/* Información general */}
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mb: 0.75 }}>
                      {obra.nombre}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ObraEstadoBadge nombre={estadoNombre} />
                      <Box sx={{
                        px: 1.5, py: 0.5, borderRadius: 99,
                        bgcolor: theme.palette.action.hover,
                        border: `1px solid ${theme.palette.divider}`,
                      }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                          {tipoNombre}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>

                <Stack spacing={2.5} sx={{ mb: 3 }}>
                  {obra.ubicacion && (
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ mt: 0.2, color: '#F59E0B', flexShrink: 0 }}><MapPin size={16} /></Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{
                          color: 'text.disabled', fontWeight: 600, display: 'block',
                          mb: 0.25, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5,
                        }}>
                          {t('obras.detail.ubicacion')}
                        </Typography>
                        <Typography variant="body2" color="text.primary" fontWeight={500}>
                          {obra.ubicacion}
                        </Typography>
                        {tieneCoords && <ObraMapa latitud={latNum!} longitud={lngNum!} nombre={obra.nombre} />}
                      </Box>
                    </Stack>
                  )}

                  {obra.descripcion && (
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ mt: 0.2, color: '#F59E0B', flexShrink: 0 }}><FileText size={16} /></Box>
                      <Box>
                        <Typography variant="caption" sx={{
                          color: 'text.disabled', fontWeight: 600, display: 'block',
                          mb: 0.25, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5,
                        }}>
                          {t('obras.detail.descripcion')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {obra.descripcion}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="caption" sx={{
                  color: 'text.disabled', fontWeight: 700, display: 'block',
                  mb: 1.5, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5,
                }}>
                  {t('obras.detail.fechas_estimadas')}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                  <FechaPill icon={<Calendar size={13} />} label={t('obras.detail.inicio_estimado')} value={formatDate(obra.fecha_inicio_estimado)} />
                  <FechaPill icon={<Calendar size={13} />} label={t('obras.detail.fin_estimado')}    value={formatDate(obra.fecha_fin_estimado)} accent />
                </Stack>

                {(obra.fecha_inicio_real || obra.fecha_fin_real) && (
                  <>
                    <Typography variant="caption" sx={{
                      color: 'text.disabled', fontWeight: 700, display: 'block',
                      mb: 1.5, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5,
                    }}>
                      {t('obras.detail.fechas_reales')}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <FechaPill icon={<CheckCircle2 size={13} />} label={t('obras.detail.inicio_real')} value={formatDate(obra.fecha_inicio_real)} />
                      <FechaPill icon={<CheckCircle2 size={13} />} label={t('obras.detail.fin_real')}    value={formatDate(obra.fecha_fin_real)} />
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Labores */}
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: 2, bgcolor: '#0F172A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Hammer size={18} color="#FFFFFF" />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
                        {t('obras.detail.labores')}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {t('obras.detail.labores_sub')}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                <LaboresDeObra
                  obraId={obraId}
                  selectedSectorId={selectedSectorId}
                  onSectorChange={setSelectedSectorId}
                />
              </CardContent>
            </Card>

            {/* Avances del sector seleccionado */}
            {selectedSectorId !== null && (
              <AvancesPorSectorCard sectorId={selectedSectorId} sectores={sectoresConStats} />
            )}

          </Stack>
        </Grid>

        {/* ── Panel lateral ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>

            {/* Inversión Total */}
            <InversionTotalCard
              totalManoObra={totalManoObraCard}
              totalMaterialesPresupuestado={totalMaterialesPresupuestadoCard}
              totalCompras={totalCompras}
            />

            {/* Estado */}
            <Card sx={{
              borderRadius: 3, boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden', bgcolor: 'background.paper',
            }}>
              <Box sx={{ bgcolor: '#0F172A', p: 3 }}>
                <Typography variant="caption" sx={{
                  color: '#64748B', fontWeight: 700, textTransform: 'uppercase',
                  fontSize: 10, letterSpacing: 0.5, display: 'block', mb: 1,
                }}>
                  {t('obras.detail.estado_actual')}
                </Typography>
                <ObraEstadoBadge nombre={estadoNombre} />
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {diasRestantes !== null && estadoNombre !== 'Finalizada' && estadoNombre !== 'Cancelada' && (
                    <Box sx={{
                      p: 2, borderRadius: 2.5,
                      bgcolor: diasRestantes < 0 ? '#FEE2E2' : diasRestantes < 7 ? '#FEF9C3' : '#F0FDF4',
                      border: `1px solid ${diasRestantes < 0 ? '#FECACA' : diasRestantes < 7 ? '#FDE68A' : '#BBF7D0'}`,
                    }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Clock size={16} color={diasRestantes < 0 ? '#B91C1C' : diasRestantes < 7 ? '#A16207' : '#15803D'} />
                        <Box>
                          <Typography sx={{
                            fontSize: 16, fontWeight: 800, lineHeight: 1,
                            color: diasRestantes < 0 ? '#B91C1C' : diasRestantes < 7 ? '#A16207' : '#15803D',
                          }}>
                            {diasRestantes < 0
                              ? t('obras.detail.dias_vencida', { dias: Math.abs(diasRestantes) })
                              : t('obras.detail.dias_restantes', { dias: diasRestantes })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('obras.detail.hasta_fin')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  <Divider />

                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Calendar size={14} color={theme.palette.text.disabled as string} />
                      <Box>
                        <Typography variant="caption" sx={{
                          color: 'text.disabled', display: 'block',
                          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                        }}>
                          {t('obras.detail.creada')}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {formatDate(obra.created_at)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Calendar size={14} color={theme.palette.text.disabled as string} />
                      <Box>
                        <Typography variant="caption" sx={{
                          color: 'text.disabled', display: 'block',
                          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                        }}>
                          {t('obras.detail.actualizada')}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {formatDate(obra.updated_at)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Sectores */}
            {sectoresConStats.length > 0 && (
              <Card sx={{
                borderRadius: 3, boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{
                      color: 'text.disabled', fontWeight: 700,
                      textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5,
                    }}>
                      Estructura de la obra
                    </Typography>
                    {selectedSectorId !== null && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#F59E0B', fontWeight: 600, cursor: 'pointer', fontSize: 10 }}
                        onClick={() => setSelectedSectorId(null)}
                      >
                        Limpiar filtro
                      </Typography>
                    )}
                  </Stack>

                  <SectorTree
                    sectores={sectoresConStats}
                    selectedId={selectedSectorId}
                    collapsedIds={collapsedIds}
                    onSelect={handleSelectSector}
                    onToggle={toggleCollapse}
                  />
                </CardContent>
              </Card>
            )}

            {/* Datos de la obra */}
            <Card sx={{
              borderRadius: 3, boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" sx={{
                  color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase',
                  fontSize: 10, letterSpacing: 0.5, display: 'block', mb: 2,
                }}>
                  {t('obras.detail.datos_obra')}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ color: '#F59E0B' }}><Building2 size={18} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{
                      color: 'text.disabled', display: 'block',
                      fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    }}>
                      {t('obras.detail.tipo')}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      {tipoNombre}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </AppLayout>
  );
};