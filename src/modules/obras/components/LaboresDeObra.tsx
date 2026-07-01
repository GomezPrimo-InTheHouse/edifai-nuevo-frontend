
// import React from 'react';
// import {
//   Box, Card, CardContent, Grid, LinearProgress, Stack, Typography, useTheme,
// } from '@mui/material';
// import { Briefcase, Calendar, User } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useLaborsByObra } from '../../labores/hooks/useLabores';
// import type { LaborDeObra } from '../../labores/types/labor.types';

// function getProgressColor(progreso: number): string {
//   if (progreso === 100) return '#16A34A';
//   if (progreso >= 75)   return '#2563EB';
//   if (progreso >= 50)   return '#F59E0B';
//   if (progreso >= 25)   return '#EA580C';
//   return '#94A3B8';
// }

// const ESTADO_PROGRESO: Record<number, number> = {
//   10: 0, 11: 25, 12: 50, 13: 75, 14: 100,
// };

// function LaborEstadoBadge({ estadoNombre, progreso }: { estadoNombre?: string | null; progreso: number }) {
//   const color = getProgressColor(progreso);
//   const bgMap: Record<number, string> = {
//     0: '#F1F5F9', 25: '#FFF7ED', 50: '#FFFBEB', 75: '#EFF6FF', 100: '#F0FDF4',
//   };
//   return (
//     <Box sx={{
//       display: 'inline-flex', alignItems: 'center', gap: 0.5,
//       px: 1.25, py: 0.4, borderRadius: 99,
//       bgcolor: bgMap[progreso] ?? '#F1F5F9', flexShrink: 0,
//     }}>
//       <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
//       <Typography sx={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1 }}>
//         {estadoNombre ?? 'Sin estado'}
//       </Typography>
//     </Box>
//   );
// }

// function formatDate(v?: string | null) {
//   if (!v) return '-';
//   return new Date(v).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
// }

// function LaborCard({ labor, onClick }: { labor: LaborDeObra; onClick: () => void }) {
//   const theme = useTheme();
//   const progreso = labor.estado_id ? (ESTADO_PROGRESO[labor.estado_id] ?? 0) : 0;
//   const color    = getProgressColor(progreso);

//   return (
//     <Card
//       onClick={onClick}
//       sx={{
//         borderRadius: 3,
//         border: `1px solid ${theme.palette.divider}`,
//         boxShadow: 'none',
//         bgcolor: 'background.paper',
//         cursor: 'pointer',
//         height: '100%',
//         overflow: 'hidden',
//         transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
//         '&:hover': {
//           boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
//           transform: 'translateY(-3px)',
//           borderColor: color,
//         },
//       }}
//     >
//       {/* Acento superior */}
//       <Box sx={{ height: 4, bgcolor: color, width: '100%' }} />

//       <CardContent sx={{ p: 2.5 }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }} spacing={1}>
//           <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.3, flex: 1 }}>
//             {labor.nombre}
//           </Typography>
//           <LaborEstadoBadge estadoNombre={labor.estado_nombre} progreso={progreso} />
//         </Stack>

//         {labor.descripcion && (
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             sx={{
//               mb: 1.5, lineHeight: 1.5,
//               display: '-webkit-box', overflow: 'hidden',
//               WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
//             }}
//           >
//             {labor.descripcion}
//           </Typography>
//         )}

//         <Box sx={{ mb: 2 }}>
//           <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
//             <Typography variant="caption" sx={{
//               color: 'text.disabled', fontWeight: 700, fontSize: 10,
//               textTransform: 'uppercase', letterSpacing: 0.5,
//             }}>
//               PROGRESO
//             </Typography>
//             <Typography variant="caption" fontWeight={800} sx={{ color }}>{progreso}%</Typography>
//           </Stack>
//           <LinearProgress
//             variant="determinate" value={progreso}
//             sx={{
//               height: 7, borderRadius: 4,
//               bgcolor: theme.palette.action.hover,
//               '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: color },
//             }}
//           />
//         </Box>

//         <Stack spacing={0.75}>
//           {labor.especialidad_nombre && (
//             <Stack direction="row" alignItems="center" spacing={0.75}>
//               <Briefcase size={12} color={theme.palette.text.disabled} />
//               <Typography variant="caption" color="text.secondary">{labor.especialidad_nombre}</Typography>
//             </Stack>
//           )}
//           {labor.trabajador_nombre && (
//             <Stack direction="row" alignItems="center" spacing={0.75}>
//               <User size={12} color={theme.palette.text.disabled} />
//               <Typography variant="caption" color="text.secondary">{labor.trabajador_nombre}</Typography>
//             </Stack>
//           )}
//           <Stack direction="row" alignItems="center" spacing={0.75}>
//             <Calendar size={12} color={theme.palette.text.disabled} />
//             <Typography variant="caption" color="text.secondary">
//               {formatDate(labor.fecha_inicio_estimada)} → {formatDate(labor.fecha_fin_estimada)}
//             </Typography>
//           </Stack>
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// }

// interface Props { obraId: number; }

// export const LaboresDeObra: React.FC<Props> = ({ obraId }) => {
//   // const theme = useTheme();
//   const navigate = useNavigate();
//   const { data: labores = [], isLoading } = useLaborsByObra(obraId);

//   if (isLoading) return <Box sx={{ py: 3 }}><LinearProgress sx={{ borderRadius: 2 }} /></Box>;

//   if (labores.length === 0) {
//     return (
//       <Box sx={{ py: 5, textAlign: 'center' }}>
//         <Typography variant="body2" color="text.disabled">
//           No hay labores asociadas a esta obra.
//         </Typography>
//       </Box>
//     );
//   }

//   const finalizadas  = labores.filter(l => l.estado_id === 14).length;
//   const enCurso      = labores.filter(l => l.estado_id && [11, 12, 13].includes(l.estado_id)).length;
//   const planificadas = labores.filter(l => l.estado_id === 10).length;

//   return (
//     <Box>
//       <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
//         <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{
//           textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5,
//         }}>
//           LABORES ({labores.length})
//         </Typography>
//         <Stack direction="row" spacing={1.5}>
//           {finalizadas > 0 && (
//             <Stack direction="row" alignItems="center" spacing={0.5}>
//               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16A34A' }} />
//               <Typography variant="caption" color="text.secondary" fontWeight={600}>
//                 {finalizadas} finalizada{finalizadas > 1 ? 's' : ''}
//               </Typography>
//             </Stack>
//           )}
//           {enCurso > 0 && (
//             <Stack direction="row" alignItems="center" spacing={0.5}>
//               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB' }} />
//               <Typography variant="caption" color="text.secondary" fontWeight={600}>
//                 {enCurso} en curso
//               </Typography>
//             </Stack>
//           )}
//           {planificadas > 0 && (
//             <Stack direction="row" alignItems="center" spacing={0.5}>
//               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#94A3B8' }} />
//               <Typography variant="caption" color="text.secondary" fontWeight={600}>
//                 {planificadas} planificada{planificadas > 1 ? 's' : ''}
//               </Typography>
//             </Stack>
//           )}
//         </Stack>
//       </Stack>

//       <Grid container spacing={2}>
//         {labores.map((labor) => (
//           <Grid key={labor.id} size={{ xs: 12, sm: 6, lg: 4 }}>
//             <LaborCard
//               labor={labor}
//               onClick={() => navigate(`/labores/${labor.id}`, {
//                 state: { from: 'obra', obraId, obraLabel: `Obra #${obraId}` },
//               })}
//             />
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// };

import React, { useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Grid, IconButton, LinearProgress,
  MenuItem, Pagination, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { Briefcase, Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLaborsByObra } from '../../labores/hooks/useLabores';
import { useSectoresPorObra } from '../hooks/useSectores';
import {
  flattenSectorTree, getDescendantIds, nombreCompletoSector,
} from '../types/sector.types';
import type { LaborDeObra } from '../../labores/types/labor.types';

const PAGE_SIZE = 5;

function getProgressColor(progreso: number): string {
  if (progreso === 100) return '#16A34A';
  if (progreso >= 75)   return '#2563EB';
  if (progreso >= 50)   return '#F59E0B';
  if (progreso >= 25)   return '#EA580C';
  return '#94A3B8';
}

const ESTADO_PROGRESO: Record<number, number> = { 10: 0, 11: 25, 12: 50, 13: 75, 14: 100 };

function LaborEstadoBadge({ estadoNombre, progreso }: { estadoNombre?: string | null; progreso: number }) {
  const color = getProgressColor(progreso);
  const bgMap: Record<number, string> = { 0: '#F1F5F9', 25: '#FFF7ED', 50: '#FFFBEB', 75: '#EFF6FF', 100: '#F0FDF4' };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 1.25, py: 0.4, borderRadius: 99, bgcolor: bgMap[progreso] ?? '#F1F5F9', flexShrink: 0,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
      <Typography sx={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1 }}>
        {estadoNombre ?? 'Sin estado'}
      </Typography>
    </Box>
  );
}

function formatDate(v?: string | null) {
  if (!v) return '-';
  return new Date(v).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function LaborCard({ labor, onClick }: { labor: LaborDeObra; onClick: () => void }) {
  const theme = useTheme();
  const progreso = labor.estado_id ? (ESTADO_PROGRESO[labor.estado_id] ?? 0) : 0;
  const color    = getProgressColor(progreso);

  return (
    <Card onClick={onClick} sx={{
      borderRadius: 3, border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none', bgcolor: 'background.paper',
      cursor: 'pointer', height: '100%', overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.10)', transform: 'translateY(-3px)', borderColor: color },
    }}>
      <Box sx={{ height: 4, bgcolor: color, width: '100%' }} />
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }} spacing={1}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.3, flex: 1 }}>
            {labor.nombre}
          </Typography>
          <LaborEstadoBadge estadoNombre={labor.estado_nombre} progreso={progreso} />
        </Stack>

        {labor.descripcion && (
          <Typography variant="caption" color="text.secondary" sx={{
            mb: 1.5, lineHeight: 1.5, display: '-webkit-box', overflow: 'hidden',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {labor.descripcion}
          </Typography>
        )}

        {/* Sector badge */}
        {(labor as any).sector_tipo && (labor as any).sector_valor && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.25, borderRadius: 1,
              bgcolor: theme.palette.action.hover, color: 'text.secondary',
              fontSize: 10, fontWeight: 600,
            }}>
              📍 {nombreCompletoSector({ tipo: (labor as any).sector_tipo, valor: (labor as any).sector_valor })}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              PROGRESO
            </Typography>
            <Typography variant="caption" fontWeight={800} sx={{ color }}>{progreso}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progreso} sx={{
            height: 7, borderRadius: 4, bgcolor: theme.palette.action.hover,
            '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: color },
          }} />
        </Box>

        <Stack spacing={0.75}>
          {labor.especialidad_nombre && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Briefcase size={12} color={theme.palette.text.disabled} />
              <Typography variant="caption" color="text.secondary">{labor.especialidad_nombre}</Typography>
            </Stack>
          )}
          {labor.trabajador_nombre && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <User size={12} color={theme.palette.text.disabled} />
              <Typography variant="caption" color="text.secondary">{labor.trabajador_nombre}</Typography>
            </Stack>
          )}
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Calendar size={12} color={theme.palette.text.disabled} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(labor.fecha_inicio_estimada)} → {formatDate(labor.fecha_fin_estimada)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface Props {
  obraId: number;
  selectedSectorId?: number | null;
  onSectorChange?: (id: number | null) => void;
}

export const LaboresDeObra: React.FC<Props> = ({ obraId, selectedSectorId, onSectorChange }) => {
  const navigate = useNavigate();
  const [page, setPage]               = useState(1);
  const [localSectorId, setLocalSectorId] = useState<string>('todos');

  const { data: labores  = [], isLoading } = useLaborsByObra(obraId);
  const { data: sectores = [] }            = useSectoresPorObra(obraId);

  // El filtro activo viene del panel (selectedSectorId) o del dropdown local
  // Si viene del panel, usamos ese; el dropdown local lo sincroniza
  const activeSectorId: number | null | 'sin_sector' = (() => {
    if (selectedSectorId !== undefined && selectedSectorId !== null) return selectedSectorId;
    if (localSectorId === 'sin_sector') return 'sin_sector';
    if (localSectorId === 'todos') return null;
    return Number(localSectorId);
  })();

  const handleDropdownChange = (value: string) => {
    setLocalSectorId(value);
    setPage(1);
    if (onSectorChange) {
      if (value === 'todos' || value === 'sin_sector') onSectorChange(null);
      else onSectorChange(Number(value));
    }
  };

  // Sync dropdown when panel changes
  React.useEffect(() => {
    if (selectedSectorId !== undefined) {
      setLocalSectorId(selectedSectorId === null ? 'todos' : String(selectedSectorId));
      setPage(1);
    }
  }, [selectedSectorId]);

  // Compute IDs to include when filtering by sector
  const includedSectorIds = useMemo(() => {
    if (activeSectorId === null || activeSectorId === 'sin_sector') return null;
    const descendants = getDescendantIds(activeSectorId, sectores);
    return new Set([activeSectorId, ...descendants]);
  }, [activeSectorId, sectores]);

  // Filter labores
  const filteredLabores = useMemo(() => {
    if (activeSectorId === null) return labores;
    if (activeSectorId === 'sin_sector') return labores.filter(l => !(l as any).sector_id);
    if (includedSectorIds) return labores.filter(l => includedSectorIds.has((l as any).sector_id));
    return labores;
  }, [labores, activeSectorId, includedSectorIds]);

  // Pagination
  const totalPages   = Math.max(1, Math.ceil(filteredLabores.length / PAGE_SIZE));
  const currentPage  = Math.min(page, totalPages);
  const paginatedLabores = filteredLabores.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const flattenedSectors = flattenSectorTree(sectores);

  if (isLoading) return <Box sx={{ py: 3 }}><LinearProgress sx={{ borderRadius: 2 }} /></Box>;

  const finalizadas  = labores.filter(l => l.estado_id === 14).length;
  const enCurso      = labores.filter(l => l.estado_id && [11, 12, 13].includes(l.estado_id)).length;
  const planificadas = labores.filter(l => l.estado_id === 10).length;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
        <Typography variant="body2" fontWeight={700} color="text.secondary"
          sx={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
          LABORES ({filteredLabores.length}{filteredLabores.length !== labores.length ? ` de ${labores.length}` : ''})
        </Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {finalizadas > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16A34A' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {finalizadas} finalizada{finalizadas > 1 ? 's' : ''}
              </Typography>
            </Stack>
          )}
          {enCurso > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {enCurso} en curso
              </Typography>
            </Stack>
          )}
          {planificadas > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#94A3B8' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {planificadas} planificada{planificadas > 1 ? 's' : ''}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* Filtro por sector */}
      {sectores.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <TextField select size="small" label="Filtrar por sector"
            value={localSectorId}
            onChange={(e) => handleDropdownChange(e.target.value)}
            sx={{ minWidth: 220 }}>
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="sin_sector">Sin sector asignado</MenuItem>
            {flattenedSectors.map(({ sector, depth }) => (
              <MenuItem key={sector.id} value={String(sector.id)} sx={{ pl: 2 + depth * 2 }}>
                {depth > 0 ? '└ ' : ''}{nombreCompletoSector(sector)}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {filteredLabores.length === 0 ? (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            {labores.length === 0
              ? 'No hay labores asociadas a esta obra.'
              : 'No hay labores para el sector seleccionado.'}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Paginación superior */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.disabled">
              Página {currentPage} de {totalPages}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton size="small" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft size={16} />
              </IconButton>
              <Pagination
                count={totalPages} page={currentPage}
                onChange={(_, v) => setPage(v)}
                size="small" hidePrevButton hideNextButton
                sx={{ '& .MuiPaginationItem-root': { fontSize: 12 } }}
              />
              <IconButton size="small" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight size={16} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Grid de labores */}
          <Grid container spacing={2}>
            {paginatedLabores.map((labor) => (
              <Grid key={labor.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <LaborCard
                  labor={labor}
                  onClick={() => navigate(`/labores/${labor.id}`, {
                    state: { from: 'obra', obraId, obraLabel: `Obra #${obraId}` },
                  })}
                />
              </Grid>
            ))}
          </Grid>

          {/* Paginación inferior */}
          <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
            <Pagination
              count={totalPages} page={currentPage}
              onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              size="small"
            />
          </Stack>
        </>
      )}
    </Box>
  );
};