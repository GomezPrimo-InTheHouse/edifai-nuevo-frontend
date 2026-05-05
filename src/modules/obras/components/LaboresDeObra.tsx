import React from 'react';
import {
  Box, Card, CardContent, Grid, LinearProgress, Stack, Typography,
} from '@mui/material';
import { Briefcase, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLaborsByObra } from '../../labores/hooks/useLabores';
import type { LaborDeObra } from '../../labores/types/labor.types';

function getProgressColor(progreso: number): string {
  if (progreso === 100) return '#16A34A';
  if (progreso >= 75)   return '#2563EB';
  if (progreso >= 50)   return '#F59E0B';
  if (progreso >= 25)   return '#EA580C';
  return '#94A3B8';
}

const ESTADO_PROGRESO: Record<number, number> = {
  10: 0,
  11: 25,
  12: 50,
  13: 75,
  14: 100,
};

function LaborEstadoBadge({ estadoNombre, progreso }: { estadoNombre?: string | null; progreso: number }) {
  const color = getProgressColor(progreso);
  const bgMap: Record<number, string> = {
    0: '#F1F5F9', 25: '#FFF7ED', 50: '#FFFBEB', 75: '#EFF6FF', 100: '#F0FDF4',
  };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 1.25, py: 0.4, borderRadius: 99,
      bgcolor: bgMap[progreso] ?? '#F1F5F9', flexShrink: 0,
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
  const progreso = labor.estado_id ? (ESTADO_PROGRESO[labor.estado_id] ?? 0) : 0;
  const color    = getProgressColor(progreso);

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none',
        cursor: 'pointer', height: '100%', overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
        '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.10)', transform: 'translateY(-3px)', borderColor: color },
      }}
    >
      {/* Acento superior */}
      <Box sx={{ height: 4, bgcolor: color, width: '100%' }} />

      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }} spacing={1}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0F172A', lineHeight: 1.3, flex: 1 }}>
            {labor.nombre}
          </Typography>
          <LaborEstadoBadge estadoNombre={labor.estado_nombre} progreso={progreso} />
        </Stack>

        {labor.descripcion && (
          <Typography
            variant="caption"
            sx={{
              color: '#64748B', mb: 1.5, lineHeight: 1.5,
              display: '-webkit-box', overflow: 'hidden',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}
          >
            {labor.descripcion}
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              PROGRESO
            </Typography>
            <Typography variant="caption" fontWeight={800} sx={{ color }}>{progreso}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate" value={progreso}
            sx={{
              height: 7, borderRadius: 4, bgcolor: '#F1F5F9',
              '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: color },
            }}
          />
        </Box>

        <Stack spacing={0.75}>
          {labor.especialidad_nombre && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Briefcase size={12} color="#94A3B8" />
              <Typography variant="caption" sx={{ color: '#64748B' }}>{labor.especialidad_nombre}</Typography>
            </Stack>
          )}
          {labor.trabajador_nombre && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <User size={12} color="#94A3B8" />
              <Typography variant="caption" sx={{ color: '#64748B' }}>{labor.trabajador_nombre}</Typography>
            </Stack>
          )}
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Calendar size={12} color="#94A3B8" />
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {formatDate(labor.fecha_inicio_estimada)} → {formatDate(labor.fecha_fin_estimada)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface Props { obraId: number; }

export const LaboresDeObra: React.FC<Props> = ({ obraId }) => {
  const navigate = useNavigate();
  const { data: labores = [], isLoading } = useLaborsByObra(obraId);

  if (isLoading) return <Box sx={{ py: 3 }}><LinearProgress sx={{ borderRadius: 2 }} /></Box>;

  if (labores.length === 0) {
    return (
      <Box sx={{ py: 5, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>No hay labores asociadas a esta obra.</Typography>
      </Box>
    );
  }

  const finalizadas  = labores.filter(l => l.estado_id === 14).length;
  const enCurso      = labores.filter(l => l.estado_id && [11, 12, 13].includes(l.estado_id)).length;
  const planificadas = labores.filter(l => l.estado_id === 10).length;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography variant="body2" fontWeight={700} sx={{ color: '#64748B', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
          LABORES ({labores.length})
        </Typography>
        <Stack direction="row" spacing={1.5}>
          {finalizadas > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16A34A' }} />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{finalizadas} finalizada{finalizadas > 1 ? 's' : ''}</Typography>
            </Stack>
          )}
          {enCurso > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB' }} />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{enCurso} en curso</Typography>
            </Stack>
          )}
          {planificadas > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#94A3B8' }} />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{planificadas} planificada{planificadas > 1 ? 's' : ''}</Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {labores.map((labor) => (
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
    </Box>
  );
};