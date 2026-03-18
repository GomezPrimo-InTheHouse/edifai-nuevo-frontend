import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  LinearProgress,
  Button,
  Avatar,
  Divider,
} from '@mui/material';

import {
  TrendingUp,
  Group,
  Construction,
  AssignmentTurnedIn,
  ArrowOutward,
} from '@mui/icons-material';

import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';

const statCards = [
  {
    title: 'Proyectos activos',
    value: '12',
    subtitle: '+2 esta semana',
    icon: <Construction />,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.10)',
  },
  {
    title: 'Trabajadores hoy',
    value: '156',
    subtitle: '92% presentismo',
    icon: <Group />,
    color: '#2563EB',
    bg: 'rgba(37, 99, 235, 0.10)',
  },
  {
    title: 'Labores en curso',
    value: '28',
    subtitle: '5 requieren revisión',
    icon: <TrendingUp />,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.10)',
  },
  {
    title: 'Asistencias del día',
    value: '143',
    subtitle: '13 ausencias',
    icon: <AssignmentTurnedIn />,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.10)',
  },
];

const recentActivity = [
  {
    title: 'Juan Pérez marcó presentismo',
    subtitle: 'Obra Norte · hace 12 min',
  },
  {
    title: 'Se asignó nueva labor de encofrado',
    subtitle: 'Obra Centro · hace 27 min',
  },
  {
    title: 'Ingreso de materiales registrado',
    subtitle: 'Cemento x120 · hace 45 min',
  },
  {
    title: 'Presupuesto actualizado',
    subtitle: 'Edificio Sur · hace 1 h',
  },
];

const activeWorks = [
  { name: 'Obra Norte', progress: 78, status: 'En tiempo' },
  { name: 'Edificio Centro', progress: 54, status: 'En seguimiento' },
  { name: 'Complejo Sur', progress: 31, status: 'Demorado' },
];

const DashboardPage: React.FC = () => {
  return (
    <AppLayout>
    <PageHeader
        title="Dashboard"
        subtitle="Resumen general del sistema."
        />

      <Stack spacing={3}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            background:
              'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #334155 100%)',
            color: '#FFFFFF',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 24, md: 34 },
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    mb: 1,
                  }}
                >
                  Bienvenido de nuevo, Julián
                </Typography>

                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.75)',
                    maxWidth: 720,
                    fontSize: 15,
                    lineHeight: 1.7,
                  }}
                >
                  Aquí tienes un resumen general de obras, personal y operaciones.
                  Hoy tienes actividad en 3 obras, 156 trabajadores registrados y 5
                  alertas operativas que conviene revisar.
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#F59E0B',
                      color: '#0F172A',
                      fontWeight: 700,
                      borderRadius: 3,
                      px: 2.5,
                      '&:hover': { bgcolor: '#D97706' },
                    }}
                  >
                    Ver obras activas
                  </Button>

                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#FFFFFF',
                      borderRadius: 3,
                      px: 2.5,
                    }}
                  >
                    Revisar alertas
                  </Button>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                    Resumen rápido
                  </Typography>

                  <Stack spacing={1.2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ color: '#CBD5E1', fontSize: 14 }}>
                        Obras activas
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>12</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ color: '#CBD5E1', fontSize: 14 }}>
                        Presentismo hoy
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>92%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ color: '#CBD5E1', fontSize: 14 }}>
                        Alertas pendientes
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: '#FBBF24' }}>
                        5
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {statCards.map((item) => (
            <Grid key={item.title} size={{ xs: 12, sm: 6, xl: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: '#64748B',
                          mb: 0.8,
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 34,
                          lineHeight: 1,
                          fontWeight: 800,
                          color: '#0F172A',
                          letterSpacing: '-0.04em',
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color,
                        backgroundColor: item.bg,
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Box>

                  <Chip
                    label={item.subtitle}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      backgroundColor: '#F8FAFC',
                      color: '#334155',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid #E2E8F0',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2.5,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                      Actividad reciente
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#64748B', mt: 0.5 }}>
                      Últimos movimientos del sistema
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    endIcon={<ArrowOutward sx={{ fontSize: 16 }} />}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Ver todo
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {recentActivity.map((item, index) => (
                    <React.Fragment key={item.title}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: '#EFF6FF',
                            color: '#2563EB',
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A' }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: '#64748B' }}>
                            {item.subtitle}
                          </Typography>
                        </Box>
                      </Box>

                      {index !== recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid #E2E8F0',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  Obras activas
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#64748B', mt: 0.5, mb: 3 }}>
                  Estado general de avance
                </Typography>

                <Stack spacing={2.5}>
                  {activeWorks.map((work) => (
                    <Box key={work.name}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A' }}>
                            {work.name}
                          </Typography>
                          <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                            {work.status}
                          </Typography>
                        </Box>

                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                          {work.progress}%
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={work.progress}
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          backgroundColor: '#E2E8F0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 999,
                            background:
                              work.progress < 40
                                ? '#EF4444'
                                : work.progress < 70
                                ? '#F59E0B'
                                : '#22C55E',
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </AppLayout>
  );
};

export default DashboardPage;