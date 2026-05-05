import { Box, Divider, IconButton, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { Calendar, HardHat, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Labor } from '../types/labor.types';

interface Props {
  labor: Labor;
  estadoNombre?: string;
  obraNombre: string;
  progreso: number;
  color: string;
  esWorker: boolean;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export function LaborCardMobile({ labor, estadoNombre, obraNombre, progreso, color, esWorker, onDelete, isDeleting }: Props) {
  const navigate = useNavigate();

  return (
    <Paper
      onClick={() => navigate(`/labores/${labor.id}`)}
      sx={{
        p: 0,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <Box sx={{ width: 6, flexShrink: 0, bgcolor: color }} />
      <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ pr: 1 }}>
            <Typography variant="caption" sx={{ color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
              {estadoNombre}
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#1E293B', lineHeight: 1.2, mt: 0.2 }}>
              {labor.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <HardHat size={12} /> {obraNombre}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ bgcolor: '#F1F5F9', px: 1, py: 0.5, borderRadius: 1.5, fontWeight: 700, color: '#64748B', flexShrink: 0 }}>
            #{labor.id}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: '#F8FAFC', px: 1, py: 0.5, borderRadius: 2, border: '1px solid #F1F5F9' }}>
            <Calendar size={12} color="#64748B" />
            <Typography variant="caption" fontWeight={600} color="#475569">
              {labor.fecha_inicio_estimada ? new Date(labor.fecha_inicio_estimada).toLocaleDateString('es-AR') : '-'}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ alignSelf: 'center', color: '#CBD5E1' }}>→</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: '#F8FAFC', px: 1, py: 0.5, borderRadius: 2, border: '1px solid #F1F5F9' }}>
            <Typography variant="caption" fontWeight={600} color="#475569">
              {labor.fecha_fin_estimada ? new Date(labor.fecha_fin_estimada).toLocaleDateString('es-AR') : '-'}
            </Typography>
          </Stack>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" fontWeight={800} color="text.primary">PROGRESO</Typography>
            <Typography variant="caption" fontWeight={800} sx={{ color }}>{progreso}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progreso}
            sx={{
              height: 10, borderRadius: 5, backgroundColor: '#F1F5F9',
              '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: color },
            }}
          />
        </Box>

        {!esWorker && (
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); navigate(`/labores/${labor.id}/editar`); }}
                sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}
              >
                <Pencil size={16} color="#64748B" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => { e.stopPropagation(); onDelete(labor.id); }}
                disabled={isDeleting}
                sx={{ bgcolor: '#FFF1F2', border: '1px solid #FECACA' }}
              >
                <Trash2 size={16} />
              </IconButton>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}