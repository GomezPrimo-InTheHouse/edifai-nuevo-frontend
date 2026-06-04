// src/modules/trabajadores/pages/TrabajadoresPorEspecialidadPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar, Box, Card, CardContent, Chip, Collapse,
  Divider, Grid, IconButton, Stack, Typography,
} from '@mui/material';
import { Eye, Pencil, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { useEspecialidadesList } from '../hooks/useEspecialidades';
import { useJefesConEquipo } from '../hooks/useTrabajadores';
import type { JefeConEquipo } from '../types/trabajador.types';

type NavigateFn = (path: string, options?: { state?: any }) => void;

function MiembroRow({ trabajador, onView, onEdit }: {
  trabajador: any;
  onView: () => void;
  onEdit: () => void;
}) {
  return (
    <Stack
      direction="row" justifyContent="space-between" alignItems="center"
      sx={{ py: 1, px: 1.5, borderRadius: 2, '&:hover': { backgroundColor: '#F8FAFC' } }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 32, height: 32, bgcolor: '#E2E8F0', color: '#64748B', fontSize: 12, fontWeight: 700 }}>
          {trabajador.nombre[0]}{trabajador.apellido[0]}
        </Avatar>
        <Box>
          <Typography fontSize={13} fontWeight={600}>{trabajador.nombre} {trabajador.apellido}</Typography>
          <Typography fontSize={11} color="text.secondary">DNI: {trabajador.dni}</Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={0.5}>
        <IconButton size="small" onClick={onView}><Eye size={14} /></IconButton>
        <IconButton size="small" onClick={onEdit}><Pencil size={14} /></IconButton>
      </Stack>
    </Stack>
  );
}

function JefeCard({ jefe, onNavigate }: { jefe: JefeConEquipo; onNavigate: NavigateFn }) {
  const [equipoOpen, setEquipoOpen] = React.useState(false);

  const verJefe  = () => onNavigate(`/trabajadores/${jefe.id}`, {
    state: { breadcrumbLabel: `${jefe.nombre} ${jefe.apellido}` },
  });
  const editJefe = () => onNavigate(`/trabajadores/${jefe.id}/editar`, {
    state: { breadcrumbLabel: `${jefe.nombre} ${jefe.apellido}` },
  });

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 42, height: 42, bgcolor: '#0F172A', fontSize: 14, fontWeight: 700 }}>
              {jefe.nombre[0]}{jefe.apellido[0]}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={700} fontSize={15}>
                  {jefe.nombre} {jefe.apellido}
                </Typography>
                <Chip label="Jefe" size="small"
                  sx={{ fontSize: 10, height: 18, bgcolor: '#F59E0B', color: '#fff', fontWeight: 700 }} />
              </Stack>
              <Typography variant="caption" color="text.secondary">DNI: {jefe.dni}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton size="small" onClick={verJefe}><Eye size={16} /></IconButton>
            <IconButton size="small" onClick={editJefe}><Pencil size={16} /></IconButton>
          </Stack>
        </Stack>

        {jefe.equipo.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1} alignItems="center"
              onClick={() => setEquipoOpen(p => !p)}
              sx={{ cursor: 'pointer', color: '#64748B', '&:hover': { color: '#0F172A' } }}>
              <Users size={14} />
              <Typography fontSize={12} fontWeight={600}>
                Equipo ({jefe.equipo.length} {jefe.equipo.length === 1 ? 'miembro' : 'miembros'})
              </Typography>
              {equipoOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Stack>
            <Collapse in={equipoOpen} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 1 }}>
                {jefe.equipo.map((miembro) => (
                  <MiembroRow
                    key={miembro.id}
                    trabajador={miembro}
                    onView={() => onNavigate(`/trabajadores/${miembro.id}`, {
                      state: { breadcrumbLabel: `${miembro.nombre} ${miembro.apellido}` },
                    })}
                    onEdit={() => onNavigate(`/trabajadores/${miembro.id}/editar`, {
                      state: { breadcrumbLabel: `${miembro.nombre} ${miembro.apellido}` },
                    })}
                  />
                ))}
              </Box>
            </Collapse>
          </>
        )}

        {jefe.equipo.length === 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography fontSize={12} color="text.secondary">Sin equipo asignado</Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const TrabajadoresPorEspecialidadPage: React.FC = () => {
  const navigate = useNavigate();
  const { especialidad_id } = useParams<{ especialidad_id: string }>();
  const espId = Number(especialidad_id);

  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: jefes = [], isLoading, isError, refetch } = useJefesConEquipo(espId);

  const especialidadNombre = especialidades.find(e => e.id === espId)?.nombre ?? 'Especialidad';

  if (isLoading) return <LoadingState message="Cargando equipo..." />;
  if (isError)   return <ErrorState title="Error" message="No se pudo cargar el equipo." onRetry={refetch} />;

  const handleNavigate: NavigateFn = (path, options) => navigate(path, options);

  return (
    <AppLayout>
      <PageHeader
        title={especialidadNombre}
        subtitle={`Jefes y equipos de trabajo — ${especialidadNombre}`}
      />

      {jefes.length === 0 && (
        <EmptyState
          title="Sin jefes registrados"
          description={`No hay jefes registrados para la especialidad ${especialidadNombre}.`}
        />
      )}

      <Grid container spacing={2}>
        {jefes.map((jefe) => (
          <Grid key={jefe.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <JefeCard jefe={jefe} onNavigate={handleNavigate} />
          </Grid>
        ))}
      </Grid>
    </AppLayout>
  );
};