import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid,
  IconButton, Paper, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Eye, Pencil, Plus, Settings, Trash2, Clock, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { EspecialidadModal } from '../components/EspecialidadModal';
import { useDeleteTrabajador, useTrabajadoresList } from '../hooks/useTrabajadores';
import { useEspecialidadesList } from '../hooks/useEspecialidades';
import { useLaboresList } from '../../labores/hooks/useLabores';
import { usePagosList } from '../../pagos/hooks/usePagos';
import { PagoEstadoChip } from '../../pagos/components/PagoEstadoChip';
import { useNotify } from '../../../shared/hooks/useNotify';

// Colores para el gráfico de torta
const PIE_COLORS = ['#F59E0B', '#0F172A', '#2563EB', '#16A34A', '#EA580C', '#7C3AED', '#DB2777'];

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const TrabajadoresListPage = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { data, isLoading, isError, refetch } = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: labores = [] } = useLaboresList();
  const { data: pagos = [] } = usePagosList();
  const deleteMutation = useDeleteTrabajador();
  const [search, setSearch] = useState('');
  const [especialidadModalOpen, setEspecialidadModalOpen] = useState(false);

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm({
      title: '¿Eliminar trabajador?',
      message: 'Esta acción no se puede deshacer. ¿Seguro que querés continuar?',
      confirmLabel: 'Sí, eliminar',
      cancelLabel: 'Cancelar',
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success('Trabajador eliminado correctamente.');
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || error?.response?.data?.error || 'No se pudo eliminar el trabajador.';
      notify.error(mensaje);
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((t) =>
      t.nombre?.toLowerCase().includes(term) ||
      t.apellido?.toLowerCase().includes(term) ||
      t.dni?.toLowerCase().includes(term)
    );
  }, [data, search]);

  const getEspecialidadNombre = (id?: number | null) =>
    especialidades.find((e) => e.id === id)?.nombre ?? '-';

  // Último trabajador añadido
  const ultimoAgregado = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )[0];
  }, [data]);

  // Último trabajador modificado
  const ultimoModificado = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) =>
      new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
    )[0];
  }, [data]);

  // Datos para el gráfico de torta por especialidad
  const dataTorta = useMemo(() => {
    if (!data || !especialidades.length) return [];
    const conteo: Record<string, number> = {};
    data.forEach((t) => {
      const nombre = getEspecialidadNombre(t.especialidad_id);
      conteo[nombre] = (conteo[nombre] ?? 0) + 1;
    });
    return Object.entries(conteo).map(([nombre, value]) => ({ nombre, value }));
  }, [data, especialidades]);

  // Trabajadores con más labores asignadas
  const trabajadoresConMasLabores = useMemo(() => {
    if (!data || !labores.length) return [];
    const conteo: Record<number, number> = {};
    labores.forEach((l) => {
      if (l.trabajador_id) conteo[l.trabajador_id] = (conteo[l.trabajador_id] ?? 0) + 1;
    });
    return [...data]
      .filter((t) => conteo[t.id])
      .sort((a, b) => (conteo[b.id] ?? 0) - (conteo[a.id] ?? 0))
      .slice(0, 5)
      .map((t) => ({ ...t, totalLabores: conteo[t.id] ?? 0 }));
  }, [data, labores]);

  // Últimos pagos por trabajador
  const ultimosPagos = useMemo(() => {
    return [...pagos]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 5);
  }, [pagos]);

  return (
    <AppLayout>
      {/* <PageHeader
        title="Trabajadores"
        subtitle="Gestión del personal registrado en el sistema."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Settings size={10} />} onClick={() => setEspecialidadModalOpen(true)}>
              Especialidades
            </Button>
            <Button variant="contained" startIcon={<Plus size={8} />} onClick={() => navigate('/trabajadores/nuevo')}>
              Nuevo trabajador
            </Button>
          </Stack>
        }
      /> */}
      <PageHeader
        // 1. Título responsivo: más pequeño en móvil para que no empuje las acciones
        title={
          <Typography
            variant="inherit"
            sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' }, fontWeight: 700 }}
          >
            Trabajadores
          </Typography>
        }
        // 2. Subtítulo: lo acortamos en móvil o reducimos su tamaño
        subtitle="Gestión de personal."
        actions={
          <Stack
            direction={{ xs: 'column', sm: 'row' }} // Se apilan en vertical si el móvil es muy angosto
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="outlined"
              size="small"
              // Icono tamaño estándar (16) es mejor para el dedo que 10
              startIcon={<Settings size={16} />}
              onClick={() => setEspecialidadModalOpen(true)}
              sx={{
                fontSize: { xs: '0.7rem', md: '0.8125rem' },
                px: { xs: 1, md: 2 }
              }}
            >
              Especialidades
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => navigate('/trabajadores/nuevo')}
              sx={{
                fontSize: { xs: '0.7rem', md: '0.8125rem' },
                px: { xs: 1, md: 2 },
                whiteSpace: 'nowrap'
              }}
            >
              {/* En móvil quitamos "trabajador" para que el botón no sea gigante */}
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Nuevo trabajador
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                Nuevo
              </Box>
            </Button>
          </Stack>
        }
      />

      {/* Buscador */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <TextField fullWidth label="Buscar por nombre, apellido o DNI" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Paper>

      {isLoading && <LoadingState message="Cargando trabajadores..." />}
      {isError && <ErrorState title="Error al cargar trabajadores" message="Revisa la conexión con el microservicio." onRetry={refetch} />}

      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title="No hay trabajadores"
          description="Aún no existen trabajadores o la búsqueda no devolvió resultados."
          action={<Button variant="contained" onClick={() => navigate('/trabajadores/nuevo')}>Crear primero</Button>}
        />
      )}

      {/* Tabla principal */}
      {/* {!isLoading && !isError && filteredData.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>DNI</TableCell>
                <TableCell>Especialidad</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell><Typography fontWeight={600}>{t.nombre} {t.apellido}</Typography></TableCell>
                  <TableCell>{t.dni}</TableCell>
                  <TableCell>{getEspecialidadNombre(t.especialidad_id)}</TableCell>
                  <TableCell>{t.telefono || '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <IconButton onClick={() => navigate(`/trabajadores/${t.id}`)}><Eye size={18} /></IconButton>
                      <IconButton onClick={() => navigate(`/trabajadores/${t.id}/editar`)}><Pencil size={18} /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(t.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )} */}

      {/* Contenedor principal de los datos */}
      {!isLoading && !isError && filteredData.length > 0 && (
        <>
          {/* VISTA PARA TABLET/ESCRITORIO (Tabla normal) */}
          <Paper sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'var(--social-bg)' }}>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>DNI</TableCell>
                  <TableCell>Especialidad</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell >
                      <Typography
                        className="text-[#0000F] font-bold capitalize"
                        fontWeight={600}>{t.nombre} {t.apellido}</Typography></TableCell>
                    <TableCell variant="body">{t.dni}</TableCell>
                    <TableCell variant="body">{getEspecialidadNombre(t.especialidad_id)}</TableCell>
                    <TableCell variant="body">{t.telefono || '-'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <IconButton size="small" onClick={() => navigate(`/trabajadores/${t.id}`)}><Eye size={18} /></IconButton>
                        <IconButton size="small" onClick={() => navigate(`/trabajadores/${t.id}/editar`)}><Pencil size={18} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(t.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* VISTA PARA MÓVILES (Cards verticales) */}
          <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, mb: 3 }}>
            {filteredData.map((t) => (
              <Paper key={t.id} sx={{ p: 2, borderRadius: 3, border: '1px solid var(--border)' }} elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800, // Subimos a 800 para que la fuente Inter se vea más "gruesa"
                        color: '#000000 !important',
                        fontSize: '1rem',
                        textTransform: 'capitalize'
                      }}
                    >
                      {t.nombre} {t.apellido}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      DNI: {t.dni}
                    </Typography>
                  </Box>
                  <Chip
                    label={getEspecialidadNombre(t.especialidad_id)}
                    size="small"
                    sx={{ bgcolor: 'var(--accent-bg)', color: 'var(--accent)', fontWeight: 600 }}
                  />
                </Box>

                <Typography variant="body2" sx={{ mb: 2, color: 'var(--text)' }}>
                  <strong>Tel:</strong> {t.telefono || '-'}
                </Typography>

                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                <Stack direction="row" spacing={2} justifyContent="space-around">
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<Eye size={16} />}
                    onClick={() => navigate(`/trabajadores/${t.id}`)}
                    sx={{ color: 'var(--text)' }}
                  >
                    Ver
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<Pencil size={16} />}
                    onClick={() => navigate(`/trabajadores/${t.id}/editar`)}
                  >
                    Editar
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    color="error"
                    startIcon={<Trash2 size={16} />}
                    onClick={() => handleDelete(t.id)}
                  >
                    Borrar
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </>
      )}

      {/* Sección de estadísticas */}
      {!isLoading && !isError && data && data.length > 0 && (
        <>
          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#64748B', letterSpacing: '0.08em' }}>
              ESTADÍSTICAS Y ACTIVIDAD
            </Typography>
          </Divider>

          <Grid container spacing={3}>
            {/* Último agregado y último modificado */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
                    ACTIVIDAD RECIENTE
                  </Typography>
                  <Stack spacing={2}>
                    {/* Último agregado */}
                    {ultimoAgregado && (
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.1)' }}>
                            <Plus size={16} color="#F59E0B" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                              ÚLTIMO AGREGADO
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {ultimoAgregado.nombre} {ultimoAgregado.apellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(ultimoAgregado.created_at)} — {getEspecialidadNombre(ultimoAgregado.especialidad_id)}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => navigate(`/trabajadores/${ultimoAgregado.id}`)}>
                            <Eye size={14} />
                          </IconButton>
                        </Stack>
                      </Box>
                    )}

                    {/* Último modificado */}
                    {ultimoModificado && (
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.1)' }}>
                            <Clock size={16} color="#2563EB" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                              ÚLTIMO MODIFICADO
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {ultimoModificado.nombre} {ultimoModificado.apellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(ultimoModificado.updated_at)} — {getEspecialidadNombre(ultimoModificado.especialidad_id)}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => navigate(`/trabajadores/${ultimoModificado.id}`)}>
                            <Eye size={14} />
                          </IconButton>
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Gráfico de torta por especialidad */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>
                    TRABAJADORES POR ESPECIALIDAD
                  </Typography>
                  {dataTorta.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Sin datos disponibles.</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={dataTorta}
                          dataKey="value"
                          nameKey="nombre"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {dataTorta.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} trabajadores`, '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Trabajadores con más labores */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <TrendingUp size={16} color="#F59E0B" />
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#64748B' }}>
                      TRABAJADORES CON MÁS LABORES
                    </Typography>
                  </Stack>
                  {trabajadoresConMasLabores.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Sin datos disponibles.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {trabajadoresConMasLabores.map((t, index) => (
                        <Stack key={t.id} direction="row" spacing={1.5} alignItems="center"
                          sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', cursor: 'pointer', '&:hover': { bgcolor: '#F1F5F9' } }}
                          onClick={() => navigate(`/trabajadores/${t.id}`)}>
                          <Typography variant="body2" fontWeight={800} sx={{ color: '#F59E0B', minWidth: 20 }}>
                            #{index + 1}
                          </Typography>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#0F172A', fontSize: 12, fontWeight: 700 }}>
                            {t.nombre[0]}{t.apellido[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>{t.nombre} {t.apellido}</Typography>
                            <Typography variant="caption" color="text.secondary">{getEspecialidadNombre(t.especialidad_id)}</Typography>
                          </Box>
                          <Chip
                            label={`${t.totalLabores} labor${t.totalLabores !== 1 ? 'es' : ''}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#B45309', fontWeight: 700, fontSize: 11 }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Historial de pagos recientes */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#64748B' }}>
                      ÚLTIMOS PAGOS REGISTRADOS
                    </Typography>
                    <Button size="small" onClick={() => navigate('/pagos')} sx={{ fontSize: 11 }}>
                      Ver todos
                    </Button>
                  </Stack>
                  {ultimosPagos.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Sin pagos registrados.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {ultimosPagos.map((p) => (
                        <Stack key={p.id} direction="row" spacing={1.5} alignItems="center"
                          sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', cursor: 'pointer', '&:hover': { bgcolor: '#F1F5F9' } }}
                          onClick={() => navigate(`/pagos/${p.id}`)}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {p.trabajador_nombre} {p.trabajador_apellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(p.fecha)} — {p.motivo || 'Sin motivo'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" fontWeight={700} sx={{ color: '#0F172A' }}>
                              ${Number(p.monto).toLocaleString('es-AR')}
                            </Typography>
                            <PagoEstadoChip estado={p.estado} />
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <EspecialidadModal open={especialidadModalOpen} onClose={() => setEspecialidadModalOpen(false)} />
    </AppLayout>
  );
};