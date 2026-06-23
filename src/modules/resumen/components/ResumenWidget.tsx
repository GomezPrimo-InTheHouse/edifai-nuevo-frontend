// import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
// import {
//   Box, Paper, Typography, Stack, Fab, Collapse, Divider,
//   Chip, IconButton, Skeleton, Badge, Tooltip,
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';
// import {
//   ClipboardList, AlertTriangle, FileText, CreditCard, AlertCircle,
//   HardHat, Package, Users, RefreshCw, X, ChevronDown, ChevronRight,
//   Sparkles, CheckCircle,
// } from 'lucide-react';
// import { useResumenPendientes, useRecomendacionesIA } from '../hooks/UseResumenPendientes.tsx';
// import type { ResumenItem, ResumenCategoria, Recomendacion } from '../../../services/api/resumen.api';

// const ROLES_ADMIN = [1, 3, 4, 6, 9];

// const ICON_MAP: Record<string, React.ReactNode> = {
//   AlertTriangle: <AlertTriangle size={14} />,
//   FileText:      <FileText      size={14} />,
//   CreditCard:    <CreditCard    size={14} />,
//   AlertCircle:   <AlertCircle   size={14} />,
//   HardHat:       <HardHat       size={14} />,
//   Package:       <Package       size={14} />,
//   Users:         <Users         size={14} />,
// };

// const SEV_COLOR: Record<string, string> = {
//   critico:     '#EF4444',
//   advertencia: '#F59E0B',
//   info:        '#3B82F6',
// };

// const PRIO_COLOR: Record<string, string> = {
//   alta:  '#EF4444',
//   media: '#F59E0B',
//   baja:  '#22C55E',
// };

// const LS_KEY = 'edifai_resumen_descartados';

// function loadDescartados(): Set<string> {
//   try {
//     const raw = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') as Record<string, number>;
//     const now = Date.now();
//     return new Set(
//       Object.entries(raw)
//         .filter(([, ts]) => now - ts < 86_400_000)
//         .map(([id]) => id)
//     );
//   } catch { return new Set(); }
// }

// function saveDescartados(s: Set<string>) {
//   try {
//     const now = Date.now();
//     const raw: Record<string, number> = {};
//     s.forEach(id => { raw[id] = now; });
//     localStorage.setItem(LS_KEY, JSON.stringify(raw));
//   } catch {}
// }

// interface ResumenWidgetProps { rolId: number; }

// export const ResumenWidget: React.FC<ResumenWidgetProps> = ({ rolId }) => {
//   const theme    = useTheme();
//   const { t }    = useTranslation();
//   const navigate = useNavigate();

//   const [abierto, setAbierto]         = useState(false);
//   const [filtro, setFiltro]           = useState<string | null>(null);
//   const [expandidos, setExpandidos]   = useState<Record<string, boolean>>({});
//   const [colapsadas, setColapsadas]   = useState<Record<string, boolean>>({});
//   const [descartados, setDescartados] = useState<Set<string>>(loadDescartados);
//   const [iaAbierta, setIaAbierta]     = useState(false);
//   const [pulsando, setPulsando]       = useState(false);
//   const [swipeOffset, setSwipeOffset] = useState<Record<string, number>>({});

//   const prevCriticosRef = useRef(0);
//   const touchStartX     = useRef(0);

//   const esAdmin = ROLES_ADMIN.includes(rolId);

//   const { data, isLoading, refetch, isRefetching } = useResumenPendientes();
//   const { data: iaData, isLoading: iaLoading }     = useRecomendacionesIA(iaAbierta && abierto);

//   useEffect(() => {
//     if (!data) return;
//     if (data.total_criticos > prevCriticosRef.current) {
//       setPulsando(true);
//       setTimeout(() => setPulsando(false), 1500);
//     }
//     prevCriticosRef.current = data.total_criticos;
//   }, [data?.total_criticos]);

//   const categoriasFiltradas = useMemo(() => {
//     if (!data?.categorias) return [];
//     return data.categorias
//       .filter((c: ResumenCategoria) => !filtro || c.modulo === filtro)
//       .map((c: ResumenCategoria) => ({
//         ...c,
//         items: c.items.filter((i: ResumenItem) => !descartados.has(i.id)),
//       }))
//       .filter((c: ResumenCategoria) => c.items.length > 0);
//   }, [data, filtro, descartados]);

//   const totalVisible = useMemo(() =>
//     categoriasFiltradas.reduce((a: number, c: ResumenCategoria) => a + c.items.length, 0),
//   [categoriasFiltradas]);

//   const modulosFiltro = useMemo(() =>
//     data?.categorias?.filter((c: ResumenCategoria) =>
//       c.items.filter((i: ResumenItem) => !descartados.has(i.id)).length > 0
//     ) ?? [],
//   [data, descartados]);

//   const descartarItem = useCallback((id: string) => {
//     setDescartados(prev => {
//       const n = new Set(prev);
//       n.add(id);
//       saveDescartados(n);
//       return n;
//     });
//     setSwipeOffset(prev => ({ ...prev, [id]: 0 }));
//   }, []);

//   const onTouchStart = (e: React.TouchEvent) => {
//     touchStartX.current = e.touches[0].clientX;
//   };

//   const onTouchMove = (e: React.TouchEvent, id: string) => {
//     const diff = e.touches[0].clientX - touchStartX.current;
//     if (diff > 0) setSwipeOffset(prev => ({ ...prev, [id]: Math.min(diff, 120) }));
//   };

//   const onTouchEnd = (id: string) => {
//     if ((swipeOffset[id] ?? 0) > 80) descartarItem(id);
//     else setSwipeOffset(prev => ({ ...prev, [id]: 0 }));
//   };

//   if (!esAdmin) return null;

//   return (
//     <>
//       {/* Panel */}
//       <Collapse in={abierto} sx={{
//         position: 'fixed',
//         bottom: { xs: 'calc(88px + env(safe-area-inset-bottom))', sm: 88 },
//         right:  { xs: 12, sm: 88 },
//         left:   { xs: 12, sm: 'auto' },
//         zIndex: 1299,
//         width:  { xs: 'auto', sm: 390 },
//       }}>
//         <Paper elevation={0} sx={{
//           display: 'flex', flexDirection: 'column',
//           height:    { xs: '72dvh', sm: 540 },
//           maxHeight: { xs: '72dvh', sm: 540 },
//           border:    `1px solid ${theme.palette.divider}`,
//           borderRadius: 3, overflow: 'hidden',
//           bgcolor: 'background.paper',
//           boxShadow: theme.palette.mode === 'dark'
//             ? '0 8px 32px rgba(0,0,0,0.6)'
//             : '0 8px 32px rgba(0,0,0,0.15)',
//         }}>

//           {/* Header */}
//           <Box sx={{
//             px: 2, py: 1.5,
//             bgcolor: '#1E3A5F',
//             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//             flexShrink: 0,
//           }}>
//             <Stack direction="row" spacing={1} alignItems="center">
//               <ClipboardList size={16} color="#F59E0B" />
//               <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
//                 {t('resumen.title')}
//               </Typography>
//               {data && data.total_pendientes > 0 && (
//                 <Chip label={`${data.total_pendientes}`} size="small"
//                   sx={{ bgcolor: 'rgba(245,158,11,0.2)', color: '#F59E0B', height: 18, fontSize: 10 }} />
//               )}
//               {data && data.total_criticos > 0 && (
//                 <Chip
//                   label={`${data.total_criticos} crítico${data.total_criticos !== 1 ? 's' : ''}`}
//                   size="small"
//                   sx={{ bgcolor: 'rgba(239,68,68,0.2)', color: '#EF4444', height: 18, fontSize: 10 }}
//                 />
//               )}
//             </Stack>
//             <Stack direction="row" spacing={0.5}>
//               <Tooltip title={t('resumen.refrescar')}>
//                 <IconButton size="small" onClick={() => refetch()} disabled={isRefetching}>
//                   <RefreshCw size={14} color="#94A3B8"
//                     style={{ animation: isRefetching ? 'spin 1s linear infinite' : undefined }} />
//                 </IconButton>
//               </Tooltip>
//               <IconButton size="small" onClick={() => setAbierto(false)}>
//                 <X size={14} color="#94A3B8" />
//               </IconButton>
//             </Stack>
//           </Box>

//           {/* Filter chips */}
//           {!isLoading && modulosFiltro.length > 1 && (
//             <Box sx={{
//               px: 1.5, py: 1, flexShrink: 0,
//               borderBottom: `1px solid ${theme.palette.divider}`,
//               overflowX: 'auto',
//             }}>
//               <Stack direction="row" spacing={0.75} flexWrap="nowrap">
//                 <Chip
//                   label={t('resumen.todos')} size="small"
//                   onClick={() => setFiltro(null)}
//                   sx={{
//                     fontSize: 11, height: 24, flexShrink: 0, cursor: 'pointer',
//                     bgcolor: !filtro ? '#1E3A5F' : theme.palette.action.hover,
//                     color:   !filtro ? '#F8FAFC' : 'text.secondary',
//                   }}
//                 />
//                 {modulosFiltro.map((c: ResumenCategoria) => (
//                   <Chip
//                     key={c.modulo} label={c.label} size="small"
//                     onClick={() => setFiltro(filtro === c.modulo ? null : c.modulo)}
//                     sx={{
//                       fontSize: 11, height: 24, flexShrink: 0, cursor: 'pointer',
//                       bgcolor: filtro === c.modulo ? c.color + '22' : theme.palette.action.hover,
//                       color:   filtro === c.modulo ? c.color : 'text.secondary',
//                       border:  `1px solid ${filtro === c.modulo ? c.color : 'transparent'}`,
//                     }}
//                   />
//                 ))}
//               </Stack>
//             </Box>
//           )}

//           {/* Content */}
//           <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', minHeight: 0 }}>
//             {isLoading ? (
//               <Stack spacing={1.5} sx={{ p: 2 }}>
//                 {[1, 2, 3, 4].map(i => (
//                   <Box key={i}>
//                     <Skeleton variant="text" width="50%" sx={{ mb: 0.5 }} />
//                     {[1, 2].map(j => (
//                       <Skeleton key={j} variant="rounded" height={50} sx={{ mb: 0.75 }} />
//                     ))}
//                   </Box>
//                 ))}
//               </Stack>
//             ) : totalVisible === 0 ? (
//               <Box sx={{ textAlign: 'center', py: 6 }}>
//                 <CheckCircle size={36} color={theme.palette.text.disabled} />
//                 <Typography variant="body2" color="text.secondary" mt={1.5} fontWeight={600}>
//                   {t('resumen.todo_al_dia')}
//                 </Typography>
//                 <Typography variant="caption" color="text.disabled">
//                   {t('resumen.todo_al_dia_sub')}
//                 </Typography>
//               </Box>
//             ) : (
//               <Stack divider={<Divider />}>
//                 {categoriasFiltradas.map((cat: ResumenCategoria) => (
//                   <Box key={cat.modulo}>

//                     {/* Categoría header */}
//                     <Stack
//                       direction="row" alignItems="center" justifyContent="space-between"
//                       onClick={() => setColapsadas(p => ({ ...p, [cat.modulo]: !p[cat.modulo] }))}
//                       sx={{
//                         px: 2, py: 1, cursor: 'pointer', userSelect: 'none',
//                         '&:hover': { bgcolor: theme.palette.action.hover },
//                       }}
//                     >
//                       <Stack direction="row" spacing={1} alignItems="center">
//                         <Box sx={{ color: cat.color }}>
//                           {ICON_MAP[cat.icono] ?? <ClipboardList size={14} />}
//                         </Box>
//                         <Typography sx={{
//                           fontSize: 11, fontWeight: 700,
//                           color: 'text.secondary', letterSpacing: '0.07em',
//                         }}>
//                           {cat.label.toUpperCase()}
//                         </Typography>
//                         <Chip label={cat.items.length} size="small"
//                           sx={{ height: 17, fontSize: 10, bgcolor: cat.color + '22', color: cat.color }} />
//                         {cat.criticos > 0 && (
//                           <Chip label={`${cat.criticos} cr.`} size="small"
//                             sx={{ height: 17, fontSize: 10, bgcolor: '#EF444422', color: '#EF4444' }} />
//                         )}
//                       </Stack>
//                       {colapsadas[cat.modulo]
//                         ? <ChevronRight size={13} color={theme.palette.text.disabled} />
//                         : <ChevronDown  size={13} color={theme.palette.text.disabled} />}
//                     </Stack>

//                     {/* Items */}
//                     <Collapse in={!colapsadas[cat.modulo]}>
//                       <Stack sx={{ pb: 1 }}>
//                         {cat.items.map((item: ResumenItem, idx: number) => (
//                           <Box
//                             key={item.id}
//                             onTouchStart={onTouchStart}
//                             onTouchMove={(e) => onTouchMove(e, item.id)}
//                             onTouchEnd={() => onTouchEnd(item.id)}
//                             sx={{
//                               mx: 1.5, mb: 0.75,
//                               transform: `translateX(${swipeOffset[item.id] ?? 0}px)`,
//                               transition: (swipeOffset[item.id] ?? 0) === 0 ? 'transform 0.2s' : 'none',
//                               animation: `fadeSlideIn 0.22s ease forwards`,
//                               animationDelay: `${idx * 0.04}s`,
//                               opacity: 0,
//                             }}
//                           >
//                             <Box sx={{
//                               borderRadius: 2,
//                               border: `1px solid ${theme.palette.divider}`,
//                               borderLeft: `3px solid ${SEV_COLOR[item.severidad] ?? '#6B7280'}`,
//                               bgcolor: 'background.paper',
//                               overflow: 'hidden',
//                             }}>
//                               {/* Item row */}
//                               <Stack
//                                 direction="row" alignItems="flex-start" justifyContent="space-between"
//                                 onClick={() => setExpandidos(p => ({ ...p, [item.id]: !p[item.id] }))}
//                                 sx={{
//                                   px: 1.5, py: 1, cursor: 'pointer',
//                                   '&:hover': { bgcolor: theme.palette.action.hover },
//                                 }}
//                               >
//                                 <Box sx={{ flex: 1, minWidth: 0 }}>
//                                   <Typography sx={{
//                                     fontSize: 12, fontWeight: 600, color: 'text.primary',
//                                     overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//                                   }}>
//                                     {item.titulo}
//                                   </Typography>
//                                   <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
//                                     {item.subtitulo}
//                                   </Typography>
//                                 </Box>
//                                 <Stack direction="row" spacing={0.25} alignItems="center" sx={{ ml: 1, flexShrink: 0 }}>
//                                   <Tooltip title={t('resumen.descartar')}>
//                                     <IconButton
//                                       size="small"
//                                       onClick={(e) => { e.stopPropagation(); descartarItem(item.id); }}
//                                       sx={{ width: 20, height: 20 }}
//                                     >
//                                       <X size={10} color={theme.palette.text.disabled} />
//                                     </IconButton>
//                                   </Tooltip>
//                                   {expandidos[item.id]
//                                     ? <ChevronDown  size={12} color={theme.palette.text.disabled} />
//                                     : <ChevronRight size={12} color={theme.palette.text.disabled} />}
//                                 </Stack>
//                               </Stack>

//                               {/* Expanded detail */}
//                               <Collapse in={!!expandidos[item.id]}>
//                                 <Box sx={{ px: 1.5, pb: 1.25 }}>
//                                   <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>
//                                     {item.detalle}
//                                   </Typography>
//                                   <Chip
//                                     label={t('resumen.ver_detalle')} size="small"
//                                     onClick={() => { navigate(item.ruta); setAbierto(false); }}
//                                     sx={{
//                                       fontSize: 11, height: 22, cursor: 'pointer',
//                                       bgcolor: '#1E3A5F', color: '#F8FAFC',
//                                       '&:hover': { bgcolor: '#0F172A' },
//                                     }}
//                                   />
//                                 </Box>
//                               </Collapse>
//                             </Box>
//                           </Box>
//                         ))}
//                       </Stack>
//                     </Collapse>
//                   </Box>
//                 ))}
//               </Stack>
//             )}
//           </Box>

//           {/* AI Recommendations */}
//           <Box sx={{ flexShrink: 0, borderTop: `1px solid ${theme.palette.divider}` }}>
//             <Stack
//               direction="row" alignItems="center" justifyContent="space-between"
//               onClick={() => setIaAbierta(p => !p)}
//               sx={{ px: 2, py: 1, cursor: 'pointer', '&:hover': { bgcolor: theme.palette.action.hover } }}
//             >
//               <Stack direction="row" spacing={1} alignItems="center">
//                 <Sparkles size={13} color="#F59E0B" />
//                 <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
//                   {t('resumen.recomendaciones_ia')}
//                 </Typography>
//                 {iaLoading && (
//                   <Box sx={{
//                     width: 10, height: 10, borderRadius: '50%',
//                     border: '2px solid #F59E0B', borderTopColor: 'transparent',
//                     animation: 'spin 0.8s linear infinite',
//                   }} />
//                 )}
//               </Stack>
//               {iaAbierta
//                 ? <ChevronDown  size={13} color={theme.palette.text.disabled} />
//                 : <ChevronRight size={13} color={theme.palette.text.disabled} />}
//             </Stack>

//             <Collapse in={iaAbierta}>
//               <Box sx={{ px: 1.5, pb: 1.5, maxHeight: 190, overflowY: 'auto' }}>
//                 {iaLoading ? (
//                   <Stack spacing={0.75}>
//                     {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={48} />)}
//                   </Stack>
//                 ) : (iaData?.recomendaciones?.length ?? 0) > 0 ? (
//                   <Stack spacing={0.75}>
//                     {iaData!.recomendaciones.map((r: Recomendacion, i: number) => (
//                       <Box key={i} sx={{
//                         p: 1, borderRadius: 1.5,
//                         border: `1px solid ${theme.palette.divider}`,
//                         borderLeft: `3px solid ${PRIO_COLOR[r.prioridad as keyof typeof PRIO_COLOR] ?? '#6B7280'}`,
//                       }}>
//                         <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.primary' }}>
//                           {r.titulo}
//                         </Typography>
//                         <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>
//                           {r.descripcion}
//                         </Typography>
//                       </Box>
//                     ))}
//                   </Stack>
//                 ) : (
//                   <Typography variant="caption" color="text.disabled">
//                     {t('resumen.sin_recomendaciones')}
//                   </Typography>
//                 )}
//               </Box>
//             </Collapse>
//           </Box>
//         </Paper>
//       </Collapse>

//       {/* FAB */}
//       <Fab
//         onClick={() => setAbierto(p => !p)}
//         sx={{
//           position: 'fixed',
//           bottom: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 24 },
//           right:  { xs: 76, sm: 88 },
//           zIndex: 1299,
//           bgcolor: '#1E3A5F', color: '#F59E0B',
//           boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
//           '&:hover': { bgcolor: '#0F172A' },
//           animation: pulsando ? 'pulseScale 0.35s ease 4' : undefined,
//         }}
//       >
//         <Badge
//           badgeContent={data?.total_criticos ?? 0}
//           max={99}
//           sx={{ '& .MuiBadge-badge': { bgcolor: '#EF4444', color: '#fff', fontSize: 10, minWidth: 17, height: 17 } }}
//         >
//           {abierto ? <X size={22} /> : <ClipboardList size={22} />}
//         </Badge>
//       </Fab>

//       <style>{`
//         @keyframes fadeSlideIn {
//           from { opacity: 0; transform: translateY(6px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//         @keyframes pulseScale {
//           0%, 100% { transform: scale(1); }
//           50%       { transform: scale(1.18); }
//         }
//       `}</style>
//     </>
//   );
// };

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Stack, Fab, Collapse, Divider,
  Chip, IconButton, Skeleton, Badge, Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  ClipboardList, AlertTriangle, FileText, CreditCard, AlertCircle,
  HardHat, Package, Users, RefreshCw, X, ChevronDown, ChevronRight,
  ChevronLeft, Sparkles, CheckCircle, FileDown,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useResumenPendientes, useRecomendacionesIA } from '../hooks/UseResumenPendientes';
import type { ResumenItem, ResumenCategoria, Recomendacion } from '../../../services/api/resumen.api';

const ROLES_ADMIN = [1, 3, 4, 6, 9];

const ICON_MAP: Record<string, React.ReactNode> = {
  AlertTriangle: <AlertTriangle size={14} />,
  FileText:      <FileText      size={14} />,
  CreditCard:    <CreditCard    size={14} />,
  AlertCircle:   <AlertCircle   size={14} />,
  HardHat:       <HardHat       size={14} />,
  Package:       <Package       size={14} />,
  Users:         <Users         size={14} />,
};

const SEV_COLOR: Record<string, string> = {
  critico:     '#EF4444',
  advertencia: '#F59E0B',
  info:        '#3B82F6',
};

const SEV_LABEL: Record<string, string> = {
  critico:     'Crítico',
  advertencia: 'Advertencia',
  info:        'Informativo',
};

const PRIO_COLOR: Record<string, string> = {
  alta:  '#EF4444',
  media: '#F59E0B',
  baja:  '#22C55E',
};

const LS_KEY = 'edifai_resumen_descartados';

function loadDescartados(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') as Record<string, number>;
    const now = Date.now();
    return new Set(
      Object.entries(raw)
        .filter(([, ts]) => now - ts < 86_400_000)
        .map(([id]) => id)
    );
  } catch { return new Set(); }
}

function saveDescartados(s: Set<string>) {
  try {
    const now = Date.now();
    const raw: Record<string, number> = {};
    s.forEach(id => { raw[id] = now; });
    localStorage.setItem(LS_KEY, JSON.stringify(raw));
  } catch {}
}

// ── PDF Export ────────────────────────────────────────────────
function exportarPDF(
  categorias: ResumenCategoria[],
  filtro: string | null,
  modulosFiltro: ResumenCategoria[]
) {
  const doc  = new jsPDF();
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const titulo = filtro
    ? `Pendientes — ${modulosFiltro.find(m => m.modulo === filtro)?.label ?? filtro}`
    : 'Pendientes — Todos los módulos';

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11);
  doc.text('EdifAI — Panel de seguimiento', 14, 12);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(titulo, 14, 20);
  doc.setFontSize(9);
  doc.text(`Generado: ${fecha}`, 150, 20);

  let startY = 34;

  for (const cat of categorias) {
    if (cat.items.length === 0) continue;

    const color = cat.color;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    doc.setFillColor(r, g, b);
    doc.roundedRect(14, startY, 182, 7, 1, 1, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`${cat.label.toUpperCase()}  (${cat.items.length} pendiente${cat.items.length !== 1 ? 's' : ''})`, 17, startY + 5);

    startY += 9;

    autoTable(doc, {
      startY,
      head: [['Título', 'Subtítulo', 'Detalle', 'Severidad']],
      body: cat.items.map((i: ResumenItem) => [
        i.titulo,
        i.subtitulo,
        i.detalle,
        SEV_LABEL[i.severidad] ?? i.severidad,
      ]),
      styles:      { fontSize: 8, cellPadding: 3 },
      headStyles:  { fillColor: [r, g, b], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 55 },
        2: { cellWidth: 55 },
        3: { cellWidth: 27 },
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 3) {
          const sev = cat.items[hookData.row.index]?.severidad;
          if (sev === 'critico')     hookData.cell.styles.textColor = [239, 68,  68];
          if (sev === 'advertencia') hookData.cell.styles.textColor = [245, 158, 11];
          if (sev === 'info')        hookData.cell.styles.textColor = [59,  130, 246];
        }
      },
      margin: { left: 14, right: 14 },
    });

    startY = (doc as any).lastAutoTable.finalY + 8;
    if (startY > 260 && cat !== categorias[categorias.length - 1]) {
      doc.addPage();
      startY = 14;
    }
  }

  const totalItems = categorias.reduce((a, c) => a + c.items.length, 0);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Total: ${totalItems} pendiente${totalItems !== 1 ? 's' : ''}`, 14, startY + 4);

  const nombreArchivo = filtro
    ? `edifai-pendientes-${filtro}-${Date.now()}.pdf`
    : `edifai-pendientes-todos-${Date.now()}.pdf`;
  doc.save(nombreArchivo);
}

interface ResumenWidgetProps { rolId: number; }

export const ResumenWidget: React.FC<ResumenWidgetProps> = ({ rolId }) => {
  const theme    = useTheme();
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [abierto, setAbierto]         = useState(false);
  const [filtro, setFiltro]           = useState<string | null>(null);
  const [expandidos, setExpandidos]   = useState<Record<string, boolean>>({});
  const [colapsadas, setColapsadas]   = useState<Record<string, boolean>>({});
  const [descartados, setDescartados] = useState<Set<string>>(loadDescartados);
  const [iaAbierta, setIaAbierta]     = useState(false);
  const [pulsando, setPulsando]       = useState(false);
  const [swipeOffset, setSwipeOffset] = useState<Record<string, number>>({});
  const [filterPage, setFilterPage]   = useState(0);

  const prevCriticosRef = useRef(0);
  const touchStartX     = useRef(0);

  const esAdmin = ROLES_ADMIN.includes(rolId);

  const { data, isLoading, refetch, isRefetching } = useResumenPendientes();
  const { data: iaData, isLoading: iaLoading }     = useRecomendacionesIA(iaAbierta && abierto);

  useEffect(() => {
    if (!data) return;
    if (data.total_criticos > prevCriticosRef.current) {
      setPulsando(true);
      setTimeout(() => setPulsando(false), 1500);
    }
    prevCriticosRef.current = data.total_criticos;
  }, [data?.total_criticos]);

  // Resetear página de filtros al abrir/cerrar
  useEffect(() => { setFilterPage(0); }, [abierto]);

  const categoriasFiltradas = useMemo(() => {
    if (!data?.categorias) return [];
    return data.categorias
      .filter((c: ResumenCategoria) => !filtro || c.modulo === filtro)
      .map((c: ResumenCategoria) => ({
        ...c,
        items: c.items.filter((i: ResumenItem) => !descartados.has(i.id)),
      }))
      .filter((c: ResumenCategoria) => c.items.length > 0);
  }, [data, filtro, descartados]);

  const totalVisible = useMemo(() =>
    categoriasFiltradas.reduce((a: number, c: ResumenCategoria) => a + c.items.length, 0),
  [categoriasFiltradas]);

  const modulosFiltro = useMemo(() =>
    data?.categorias?.filter((c: ResumenCategoria) =>
      c.items.filter((i: ResumenItem) => !descartados.has(i.id)).length > 0
    ) ?? [],
  [data, descartados]);

  // Chips paginados para desktop (4 por página)
  const CHIPS_PER_PAGE = 4;
  const totalPages = Math.ceil(modulosFiltro.length / CHIPS_PER_PAGE);
  const chipsVisibles = isDesktop
    ? modulosFiltro.slice(filterPage * CHIPS_PER_PAGE, (filterPage + 1) * CHIPS_PER_PAGE)
    : modulosFiltro;

  const descartarItem = useCallback((id: string) => {
    setDescartados(prev => {
      const n = new Set(prev);
      n.add(id);
      saveDescartados(n);
      return n;
    });
    setSwipeOffset(prev => ({ ...prev, [id]: 0 }));
  }, []);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchMove  = (e: React.TouchEvent, id: string) => {
    const diff = e.touches[0].clientX - touchStartX.current;
    if (diff > 0) setSwipeOffset(prev => ({ ...prev, [id]: Math.min(diff, 120) }));
  };
  const onTouchEnd = (id: string) => {
    if ((swipeOffset[id] ?? 0) > 80) descartarItem(id);
    else setSwipeOffset(prev => ({ ...prev, [id]: 0 }));
  };

  const handleExportPDF = () => {
    exportarPDF(categoriasFiltradas, filtro, modulosFiltro);
  };

  if (!esAdmin) return null;

  return (
    <>
      {/* Panel */}
      <Collapse in={abierto} sx={{
        position: 'fixed',
        bottom: { xs: 'calc(88px + env(safe-area-inset-bottom))', sm: 88 },
        right:  { xs: 12, sm: 88 },
        left:   { xs: 12, sm: 'auto' },
        zIndex: 1299,
        width:  { xs: 'auto', sm: 390 },
      }}>
        <Paper elevation={0} sx={{
          display: 'flex', flexDirection: 'column',
          height:    { xs: '72dvh', sm: 540 },
          maxHeight: { xs: '72dvh', sm: 540 },
          border:    `1px solid ${theme.palette.divider}`,
          borderRadius: 3, overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.6)'
            : '0 8px 32px rgba(0,0,0,0.15)',
        }}>

          {/* Header */}
          <Box sx={{
            px: 2, py: 1.5, bgcolor: '#1E3A5F', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ClipboardList size={16} color="#F59E0B" />
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
                {t('resumen.title')}
              </Typography>
              {data && data.total_pendientes > 0 && (
                <Chip label={`${data.total_pendientes}`} size="small"
                  sx={{ bgcolor: 'rgba(245,158,11,0.2)', color: '#F59E0B', height: 18, fontSize: 10 }} />
              )}
              {data && data.total_criticos > 0 && (
                <Chip
                  label={`${data.total_criticos} crítico${data.total_criticos !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(239,68,68,0.2)', color: '#EF4444', height: 18, fontSize: 10 }}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip title={t('resumen.exportar_pdf')}>
                <IconButton size="small" onClick={handleExportPDF}
                  disabled={isLoading || totalVisible === 0}>
                  <FileDown size={14} color="#94A3B8" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('resumen.refrescar')}>
                <IconButton size="small" onClick={() => refetch()} disabled={isRefetching}>
                  <RefreshCw size={14} color="#94A3B8"
                    style={{ animation: isRefetching ? 'spin 1s linear infinite' : undefined }} />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => setAbierto(false)}>
                <X size={14} color="#94A3B8" />
              </IconButton>
            </Stack>
          </Box>

          {/* Filter bar — desktop: paginado con flechas / mobile: scroll horizontal */}
          {!isLoading && modulosFiltro.length > 1 && (
            <Box sx={{
              px: 1, py: 0.75, flexShrink: 0,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {/* Flecha izquierda — solo desktop */}
                {isDesktop && (
                  <IconButton
                    size="small"
                    onClick={() => setFilterPage(p => Math.max(0, p - 1))}
                    disabled={filterPage === 0}
                    sx={{ width: 22, height: 22, flexShrink: 0 }}
                  >
                    <ChevronLeft size={14} />
                  </IconButton>
                )}

                {/* Chips */}
                <Box sx={{
                  flex: 1,
                  display: 'flex',
                  gap: '5px',
                  // Mobile: scroll horizontal. Desktop: wrap estático
                  overflowX: isDesktop ? 'visible' : 'auto',
                  flexWrap: isDesktop ? 'wrap' : 'nowrap',
                  // Ocultar scrollbar en mobile
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                  py: 0.25,
                }}>
                  {/* Chip "Todos" — siempre visible */}
                  {(!isDesktop || filterPage === 0) && (
                    <Chip
                      label={t('resumen.todos')} size="small"
                      onClick={() => setFiltro(null)}
                      sx={{
                        fontSize: 11, height: 24, flexShrink: 0, cursor: 'pointer',
                        bgcolor: !filtro ? '#1E3A5F' : theme.palette.action.hover,
                        color:   !filtro ? '#F8FAFC' : 'text.secondary',
                        border:  !filtro ? '1px solid #1E3A5F' : `1px solid ${theme.palette.divider}`,
                      }}
                    />
                  )}
                  {chipsVisibles.map((c: ResumenCategoria) => (
                    <Chip
                      key={c.modulo} size="small"
                      label={
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <span>{c.label}</span>
                          <Box sx={{
                            width: 16, height: 16, borderRadius: '50%',
                            bgcolor: c.color + '33',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, color: c.color, fontWeight: 700,
                          }}>
                            {c.items.filter((i: ResumenItem) => !descartados.has(i.id)).length}
                          </Box>
                        </Stack>
                      }
                      onClick={() => setFiltro(filtro === c.modulo ? null : c.modulo)}
                      sx={{
                        fontSize: 11, height: 24, flexShrink: 0, cursor: 'pointer',
                        bgcolor: filtro === c.modulo ? c.color + '22' : theme.palette.action.hover,
                        color:   filtro === c.modulo ? c.color : 'text.secondary',
                        border:  `1px solid ${filtro === c.modulo ? c.color : theme.palette.divider}`,
                        '& .MuiChip-label': { px: 1, display: 'flex', alignItems: 'center' },
                      }}
                    />
                  ))}
                </Box>

                {/* Flecha derecha + contador — solo desktop */}
                {isDesktop && (
                  <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
                    {totalPages > 1 && (
                      <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>
                        {filterPage + 1}/{totalPages}
                      </Typography>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => setFilterPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={filterPage >= totalPages - 1}
                      sx={{ width: 22, height: 22 }}
                    >
                      <ChevronRight size={14} />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
            </Box>
          )}

          {/* Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', minHeight: 0 }}>
            {isLoading ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                {[1, 2, 3, 4].map(i => (
                  <Box key={i}>
                    <Skeleton variant="text" width="50%" sx={{ mb: 0.5 }} />
                    {[1, 2].map(j => <Skeleton key={j} variant="rounded" height={50} sx={{ mb: 0.75 }} />)}
                  </Box>
                ))}
              </Stack>
            ) : totalVisible === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircle size={36} color={theme.palette.text.disabled} />
                <Typography variant="body2" color="text.secondary" mt={1.5} fontWeight={600}>
                  {t('resumen.todo_al_dia')}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {t('resumen.todo_al_dia_sub')}
                </Typography>
              </Box>
            ) : (
              <Stack divider={<Divider />}>
                {categoriasFiltradas.map((cat: ResumenCategoria) => (
                  <Box key={cat.modulo}>

                    {/* Categoría header */}
                    <Stack
                      direction="row" alignItems="center" justifyContent="space-between"
                      onClick={() => setColapsadas(p => ({ ...p, [cat.modulo]: !p[cat.modulo] }))}
                      sx={{
                        px: 2, py: 1, cursor: 'pointer', userSelect: 'none',
                        '&:hover': { bgcolor: theme.palette.action.hover },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: cat.color }}>
                          {ICON_MAP[cat.icono] ?? <ClipboardList size={14} />}
                        </Box>
                        <Typography sx={{
                          fontSize: 11, fontWeight: 700,
                          color: 'text.secondary', letterSpacing: '0.07em',
                        }}>
                          {cat.label.toUpperCase()}
                        </Typography>
                        <Chip label={cat.items.length} size="small"
                          sx={{ height: 17, fontSize: 10, bgcolor: cat.color + '22', color: cat.color }} />
                        {cat.criticos > 0 && (
                          <Chip label={`${cat.criticos} cr.`} size="small"
                            sx={{ height: 17, fontSize: 10, bgcolor: '#EF444422', color: '#EF4444' }} />
                        )}
                      </Stack>
                      {colapsadas[cat.modulo]
                        ? <ChevronRight size={13} color={theme.palette.text.disabled} />
                        : <ChevronDown  size={13} color={theme.palette.text.disabled} />}
                    </Stack>

                    {/* Items */}
                    <Collapse in={!colapsadas[cat.modulo]}>
                      <Stack sx={{ pb: 1 }}>
                        {cat.items.map((item: ResumenItem, idx: number) => (
                          <Box
                            key={item.id}
                            onTouchStart={onTouchStart}
                            onTouchMove={(e) => onTouchMove(e, item.id)}
                            onTouchEnd={() => onTouchEnd(item.id)}
                            sx={{
                              mx: 1.5, mb: 0.75,
                              transform: `translateX(${swipeOffset[item.id] ?? 0}px)`,
                              transition: (swipeOffset[item.id] ?? 0) === 0 ? 'transform 0.2s' : 'none',
                              animation: `fadeSlideIn 0.22s ease forwards`,
                              animationDelay: `${idx * 0.04}s`,
                              opacity: 0,
                            }}
                          >
                            <Box sx={{
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.divider}`,
                              borderLeft: `3px solid ${SEV_COLOR[item.severidad] ?? '#6B7280'}`,
                              bgcolor: 'background.paper',
                              overflow: 'hidden',
                            }}>
                              <Stack
                                direction="row" alignItems="flex-start" justifyContent="space-between"
                                onClick={() => setExpandidos(p => ({ ...p, [item.id]: !p[item.id] }))}
                                sx={{
                                  px: 1.5, py: 1, cursor: 'pointer',
                                  '&:hover': { bgcolor: theme.palette.action.hover },
                                }}
                              >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography sx={{
                                    fontSize: 12, fontWeight: 600, color: 'text.primary',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  }}>
                                    {item.titulo}
                                  </Typography>
                                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                                    {item.subtitulo}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={0.25} alignItems="center" sx={{ ml: 1, flexShrink: 0 }}>
                                  <Tooltip title={t('resumen.descartar')}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => { e.stopPropagation(); descartarItem(item.id); }}
                                      sx={{ width: 20, height: 20 }}
                                    >
                                      <X size={10} color={theme.palette.text.disabled} />
                                    </IconButton>
                                  </Tooltip>
                                  {expandidos[item.id]
                                    ? <ChevronDown  size={12} color={theme.palette.text.disabled} />
                                    : <ChevronRight size={12} color={theme.palette.text.disabled} />}
                                </Stack>
                              </Stack>

                              <Collapse in={!!expandidos[item.id]}>
                                <Box sx={{ px: 1.5, pb: 1.25 }}>
                                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>
                                    {item.detalle}
                                  </Typography>
                                  <Chip
                                    label={t('resumen.ver_detalle')} size="small"
                                    onClick={() => { navigate(item.ruta); setAbierto(false); }}
                                    sx={{
                                      fontSize: 11, height: 22, cursor: 'pointer',
                                      bgcolor: '#1E3A5F', color: '#F8FAFC',
                                      '&:hover': { bgcolor: '#0F172A' },
                                    }}
                                  />
                                </Box>
                              </Collapse>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* AI Recommendations */}
          <Box sx={{ flexShrink: 0, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Stack
              direction="row" alignItems="center" justifyContent="space-between"
              onClick={() => setIaAbierta(p => !p)}
              sx={{ px: 2, py: 1, cursor: 'pointer', '&:hover': { bgcolor: theme.palette.action.hover } }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Sparkles size={13} color="#F59E0B" />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                  {t('resumen.recomendaciones_ia')}
                </Typography>
                {iaLoading && (
                  <Box sx={{
                    width: 10, height: 10, borderRadius: '50%',
                    border: '2px solid #F59E0B', borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                )}
              </Stack>
              {iaAbierta
                ? <ChevronDown  size={13} color={theme.palette.text.disabled} />
                : <ChevronRight size={13} color={theme.palette.text.disabled} />}
            </Stack>

            <Collapse in={iaAbierta}>
              <Box sx={{ px: 1.5, pb: 1.5, maxHeight: 190, overflowY: 'auto' }}>
                {iaLoading ? (
                  <Stack spacing={0.75}>
                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={48} />)}
                  </Stack>
                ) : (iaData?.recomendaciones?.length ?? 0) > 0 ? (
                  <Stack spacing={0.75}>
                    {iaData!.recomendaciones.map((r: Recomendacion, i: number) => (
                      <Box key={i} sx={{
                        p: 1, borderRadius: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        borderLeft: `3px solid ${PRIO_COLOR[r.prioridad as keyof typeof PRIO_COLOR] ?? '#6B7280'}`,
                      }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.primary' }}>
                          {r.titulo}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>
                          {r.descripcion}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    {t('resumen.sin_recomendaciones')}
                  </Typography>
                )}
              </Box>
            </Collapse>
          </Box>
        </Paper>
      </Collapse>

      {/* FAB */}
      <Fab
        onClick={() => setAbierto(p => !p)}
        sx={{
          position: 'fixed',
          bottom: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 24 },
          right:  { xs: 76, sm: 88 },
          zIndex: 1299,
          bgcolor: '#1E3A5F', color: '#F59E0B',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          '&:hover': { bgcolor: '#0F172A' },
          animation: pulsando ? 'pulseScale 0.35s ease 4' : undefined,
        }}
      >
        <Badge
          badgeContent={data?.total_criticos ?? 0}
          max={99}
          sx={{ '& .MuiBadge-badge': { bgcolor: '#EF4444', color: '#fff', fontSize: 10, minWidth: 17, height: 17 } }}
        >
          {abierto ? <X size={22} /> : <ClipboardList size={22} />}
        </Badge>
      </Fab>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.18); }
        }
      `}</style>
    </>
  );
};