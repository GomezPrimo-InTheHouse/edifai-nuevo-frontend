import { Avatar, Box, Card, CardContent, Chip, Grid, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LaborEstadoChip } from './LaborEstadoChip';
import type { Labor } from '../types/labor.types';

interface Trabajador {
  id: number;
  nombre: string;
  apellido: string;
  especialidad_id?: number | null;
}

interface Props {
  laboresConTrabajador: Labor[];
  getObraNombre: (id?: number | null) => string;
  getEstadoNombre: (id?: number | null) => string | undefined;
  getTrabajador: (id?: number | null) => Trabajador | undefined;
  getEspecialidadNombre: (id?: number | null) => string;
  getProgreso: (estadoId?: number | null) => number;
  getProgressColor: (progreso: number) => string;
  esWorker: boolean;
}

export function TrabajadoresAsignados({
  laboresConTrabajador,
  getObraNombre,
  getEstadoNombre,
  getTrabajador,
  getEspecialidadNombre,
  getProgreso,
  getProgressColor,
  esWorker,
}: Props) {
  const navigate = useNavigate();

  if (laboresConTrabajador.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
        TRABAJADORES ASIGNADOS ({laboresConTrabajador.length})
      </Typography>

      <Grid container spacing={2}>
        {laboresConTrabajador.map((l) => {
          const trabajador = getTrabajador(l.trabajador_id);
          const especialidadNombre = getEspecialidadNombre(trabajador?.especialidad_id);
          const estadoNombre = getEstadoNombre(l.estado_id);
          const progreso = getProgreso(l.estado_id);
          const color = getProgressColor(progreso);

          return (
            <Grid key={l.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <Card
                onClick={() => navigate(`/labores/${l.id}`)}
                sx={{
                  borderRadius: 3,
                  boxShadow: 'none',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#F59E0B', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
                }}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }} spacing={0.5}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#0F172A', fontSize: 12, lineHeight: 1.3, flex: 1, minWidth: 0 }} noWrap>
                      {l.nombre}
                    </Typography>
                    <LaborEstadoChip estadoNombre={estadoNombre} />
                  </Stack>

                  <Box sx={{ mb: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Progreso</Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color, fontSize: 10 }}>{progreso}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progreso}
                      sx={{
                        height: 5, borderRadius: 3, backgroundColor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: color },
                      }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: 10 }} noWrap>
                    {getObraNombre(l.obra_id)}
                  </Typography>

                  {trabajador && (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#0F172A', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                        {trabajador.nombre[0]}{trabajador.apellido[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: 11 }}>
                          {trabajador.nombre} {trabajador.apellido}
                        </Typography>
                        <Chip
                          label={especialidadNombre}
                          size="small"
                          sx={{ fontSize: 9, height: 15, bgcolor: 'rgba(245,158,11,0.12)', color: '#B45309', fontWeight: 700 }}
                        />
                      </Box>
                      {!esWorker && (
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); navigate(`/trabajadores/${trabajador.id}`); }}
                          sx={{ p: 0.25, flexShrink: 0 }}
                        >
                          <User size={12} />
                        </IconButton>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}