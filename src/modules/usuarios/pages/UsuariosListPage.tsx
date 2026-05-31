
// import React, { useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Avatar, Box, Button, Chip, Divider, IconButton, MenuItem, Paper,
//   Stack, Table, TableBody, TableCell, TableHead, TableRow,
//   TextField, Tooltip, Typography, useMediaQuery, useTheme,
// } from '@mui/material';
// import { Eye, Plus, RefreshCw, Trash2 } from 'lucide-react';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
// import { UsuarioEstadoChip } from '../components/UsuarioEstadoChip';
// import { QRCodeModal } from '../components/QRCodeModal';
// import { useDarDeBajaUsuario, useUsuariosList, useRegenerarTotp } from '../hooks/useUsuarios';
// import { useNotify } from '../../../shared/hooks/useNotify';

// function getInitials(nombre?: string, email?: string): string {
//   if (nombre) return nombre.slice(0, 2).toUpperCase();
//   if (email) return email.slice(0, 2).toUpperCase();
//   return '??';
// }

// function getRolColor(rolNombre?: string): string {
//   if (!rolNombre) return '#94A3B8';
//   if (rolNombre.includes('administrador')) return '#2563EB';
//   if (rolNombre.includes('jefe')) return '#D97706';
//   return '#64748B';
// }

// export const UsuariosListPage: React.FC = () => {
//   const navigate = useNavigate();
//   const notify = useNotify();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   const { data, isLoading, isError, refetch } = useUsuariosList();
//   const darDeBajaMutation = useDarDeBajaUsuario();
//   const regenerarTotpMutation = useRegenerarTotp();

//   const [search, setSearch] = useState('');
//   const [filtroRol, setFiltroRol] = useState('');
//   const [qrData, setQrData] = useState<{ qrUrl: string; email: string; totpSeed: string } | null>(null);

//   // Roles únicos para el filtro
//   const roles = useMemo(() => {
//     if (!data) return [];
//     const seen = new Set<string>();
//     return data
//       .filter((u) => u.rol_nombre && !seen.has(u.rol_nombre) && seen.add(u.rol_nombre))
//       .map((u) => ({ id: u.rol_id, nombre: u.rol_nombre }));
//   }, [data]);

//   const filteredData = useMemo(() => {
//     if (!data) return [];
//     return data.filter((u) => {
//       const term = search.trim().toLowerCase();
//       const termOk = !term || u.nombre?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
//       const rolOk = !filtroRol || String(u.rol_id) === filtroRol;
//       return termOk && rolOk;
//     });
//   }, [data, search, filtroRol]);

//   const handleDarDeBaja = async (id: number) => {
//     const confirmed = await notify.confirm({
//       title: '¿Dar de baja este usuario?',
//       message: 'El usuario perderá acceso al sistema.',
//       confirmLabel: 'Dar de baja',
//       severity: 'error',
//     });
//     if (!confirmed) return;
//     try {
//       await darDeBajaMutation.mutateAsync(id);
//       notify.success('Usuario dado de baja.');
//     } catch (error: any) {
//       notify.error(error?.response?.data?.message || 'No se pudo dar de baja.');
//     }
//   };

//   const handleRegenerarTotp = async (id: number, email: string) => {
//     const confirmed = await notify.confirm({
//       title: '¿Regenerar TOTP?',
//       message: `Se generará un nuevo código para ${email}. El anterior dejará de funcionar.`,
//       confirmLabel: 'Regenerar',
//       severity: 'warning',
//     });
//     if (!confirmed) return;
//     try {
//       const result = await regenerarTotpMutation.mutateAsync(id);
//       setQrData({ qrUrl: result.qrCodeDataURL, email, totpSeed: result.totp_seed });
//     } catch (error: any) {
//       notify.error(error?.response?.data?.message || 'No se pudo regenerar el TOTP.');
//     }
//   };

//   const hayFiltros = search || filtroRol;

//   return (
//     <AppLayout>
//       <PageHeader
//         title="Usuarios"
//         subtitle="Gestión de usuarios administradores del sistema."
//         actions={
//           <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/usuarios/nuevo')}>
//             Nuevo usuario
//           </Button>
//         }
//       />

//       {/* Filtros */}
//       <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
//           <TextField
//             fullWidth size="small" label="Buscar por nombre o email"
//             value={search} onChange={(e) => setSearch(e.target.value)}
//           />
//           <TextField
//             select fullWidth size="small" label="Filtrar por rol"
//             value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}
//           >
//             <MenuItem value="">Todos los roles</MenuItem>
//             {roles.map((r) => (
//               <MenuItem key={r.id} value={String(r.id)}>{r.nombre}</MenuItem>
//             ))}
//           </TextField>
//           {hayFiltros && (
//             <Button size="small" variant="outlined" onClick={() => { setSearch(''); setFiltroRol(''); }}>
//               Limpiar
//             </Button>
//           )}
//         </Stack>
//       </Paper>

//       {isLoading && <LoadingState message="Cargando usuarios..." />}
//       {isError && <ErrorState title="Error" message="No se pudieron cargar los usuarios." onRetry={refetch} />}
//       {!isLoading && !isError && filteredData.length === 0 && (
//         <EmptyState
//           title="Sin usuarios"
//           description={hayFiltros ? 'No hay resultados para los filtros aplicados.' : 'No hay usuarios registrados.'}
//           action={!hayFiltros ? <Button variant="contained" onClick={() => navigate('/usuarios/nuevo')}>Crear primero</Button> : undefined}
//         />
//       )}

//       {/* VISTA MÓVIL — cards */}
//       {!isLoading && !isError && filteredData.length > 0 && isMobile && (
//         <Stack spacing={2}>
//           {filteredData.map((u) => (
//             <Paper key={u.id} sx={{ p: 2, borderRadius: 3, border: '1px solid var(--border)', boxShadow: 'none' }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
//                 <Avatar sx={{ width: 40, height: 40, bgcolor: '#0F172A', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
//                   {getInitials(u.nombre, u.email)}
//                 </Avatar>
//                 <Box sx={{ flex: 1, minWidth: 0 }}>
//                   <Typography variant="subtitle2" fontWeight={700} noWrap>{u.nombre}</Typography>
//                   <Typography variant="caption" color="text.secondary" noWrap>{u.email}</Typography>
//                 </Box>
//                 <UsuarioEstadoChip estado={u.estado_nombre} />
//               </Box>

//               <Box sx={{ mb: 1.5 }}>
//                 <Chip
//                   label={u.rol_nombre ?? '-'}
//                   size="small"
//                   sx={{ bgcolor: `${getRolColor(u.rol_nombre)}18`, color: getRolColor(u.rol_nombre), fontWeight: 600, fontSize: 11 }}
//                 />
//               </Box>

//               <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

//               <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                 <Button size="small" startIcon={<Eye size={16} />} onClick={() => navigate(`/usuarios/${u.id}`)}>
//                   Ver
//                 </Button>
//                 <Button
//                   size="small" color="warning"
//                   startIcon={<RefreshCw size={16} />}
//                   onClick={() => handleRegenerarTotp(u.id, u.email)}
//                   disabled={regenerarTotpMutation.isPending}
//                 >
//                   TOTP
//                 </Button>
//                 <IconButton
//                   color="error" size="small"
//                   onClick={() => handleDarDeBaja(u.id)}
//                   disabled={darDeBajaMutation.isPending}
//                 >
//                   <Trash2 size={16} />
//                 </IconButton>
//               </Box>
//             </Paper>
//           ))}
//         </Stack>
//       )}

//       {/* VISTA DESKTOP — tabla */}
//       {!isLoading && !isError && filteredData.length > 0 && !isMobile && (
//         <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'none' }}>
//           <Table>
//             <TableHead sx={{ bgcolor: 'var(--social-bg)' }}>
//               <TableRow>
//                 <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
//                 <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
//                 <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
//                 <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
//                 <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredData.map((u) => (
//                 <TableRow key={u.id} hover>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                       <Avatar sx={{ width: 32, height: 32, bgcolor: '#0F172A', fontSize: 11, fontWeight: 700 }}>
//                         {getInitials(u.nombre, u.email)}
//                       </Avatar>
//                       <Typography variant="body2" fontWeight={600}>{u.nombre}</Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
//                   <TableCell>
//                     <Chip
//                       label={u.rol_nombre ?? '-'}
//                       size="small"
//                       sx={{ bgcolor: `${getRolColor(u.rol_nombre)}18`, color: getRolColor(u.rol_nombre), fontWeight: 600 }}
//                     />
//                   </TableCell>
//                   <TableCell><UsuarioEstadoChip estado={u.estado_nombre} /></TableCell>
//                   <TableCell align="right">
//                     <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
//                       <Tooltip title="Ver detalle">
//                         <IconButton size="small" onClick={() => navigate(`/usuarios/${u.id}`)}>
//                           <Eye size={18} />
//                         </IconButton>
//                       </Tooltip>
//                       <Tooltip title="Regenerar TOTP">
//                         <IconButton
//                           size="small" color="warning"
//                           onClick={() => handleRegenerarTotp(u.id, u.email)}
//                           disabled={regenerarTotpMutation.isPending}
//                         >
//                           <RefreshCw size={18} />
//                         </IconButton>
//                       </Tooltip>
//                       <Tooltip title="Dar de baja">
//                         <IconButton
//                           size="small" color="error"
//                           onClick={() => handleDarDeBaja(u.id)}
//                           disabled={darDeBajaMutation.isPending}
//                         >
//                           <Trash2 size={18} />
//                         </IconButton>
//                       </Tooltip>
//                     </Stack>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Paper>
//       )}

//       {qrData && (
//         <QRCodeModal
//           open={!!qrData}
//           onClose={() => setQrData(null)}
//           qrUrl={qrData.qrUrl}
//           email={qrData.email}
//           totpSeed={qrData.totpSeed}
//         />
//       )}
//     </AppLayout>
//   );
// };

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Chip, Divider, IconButton, MenuItem, Paper,
  Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { Eye, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { UsuarioEstadoChip } from '../components/UsuarioEstadoChip';
import { QRCodeModal } from '../components/QRCodeModal';
import { useDarDeBajaUsuario, useUsuariosList, useRegenerarTotp } from '../hooks/useUsuarios';
import { useNotify } from '../../../shared/hooks/useNotify';

function getInitials(nombre?: string, email?: string): string {
  if (nombre) return nombre.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '??';
}

function getRolColor(rolNombre?: string): string {
  if (!rolNombre) return '#94A3B8';
  if (rolNombre.includes('administrador')) return '#2563EB';
  if (rolNombre.includes('jefe')) return '#D97706';
  return '#64748B';
}

export const UsuariosListPage: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, isLoading, isError, refetch } = useUsuariosList();
  const darDeBajaMutation = useDarDeBajaUsuario();
  const regenerarTotpMutation = useRegenerarTotp();

  const [search, setSearch] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [qrData, setQrData] = useState<{ qrUrl: string; email: string; totpSeed: string } | null>(null);

  const roles = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    return data
      .filter((u) => u.rol_nombre && !seen.has(u.rol_nombre) && seen.add(u.rol_nombre))
      .map((u) => ({ id: u.rol_id, nombre: u.rol_nombre }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((u) => {
      const term = search.trim().toLowerCase();
      const termOk = !term || u.nombre?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
      const rolOk = !filtroRol || String(u.rol_id) === filtroRol;
      return termOk && rolOk;
    });
  }, [data, search, filtroRol]);

  const handleDarDeBaja = async (id: number) => {
    const confirmed = await notify.confirm({
      title: t('usuarios.confirm.baja_title'),
      message: t('usuarios.confirm.baja_msg'),
      confirmLabel: t('usuarios.confirm.baja_btn'),
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await darDeBajaMutation.mutateAsync(id);
      notify.success(t('usuarios.notify.baja_ok'));
    } catch (error: any) {
      notify.error(error?.response?.data?.message || t('usuarios.notify.error_baja'));
    }
  };

  const handleRegenerarTotp = async (id: number, email: string) => {
    const confirmed = await notify.confirm({
      title: t('usuarios.confirm.totp_title'),
      message: t('usuarios.confirm.totp_msg', { email }),
      confirmLabel: t('usuarios.confirm.totp_btn'),
      severity: 'warning',
    });
    if (!confirmed) return;
    try {
      const result = await regenerarTotpMutation.mutateAsync(id);
      setQrData({ qrUrl: result.qrCodeDataURL, email, totpSeed: result.totp_seed });
    } catch (error: any) {
      notify.error(error?.response?.data?.message || t('usuarios.notify.error_totp'));
    }
  };

  const hayFiltros = search || filtroRol;

  return (
    <AppLayout>
      <PageHeader
        title={t('usuarios.title')}
        subtitle={t('usuarios.subtitle')}
        actions={
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/usuarios/nuevo')}>
            {t('usuarios.nuevo')}
          </Button>
        }
      />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth size="small" label={t('usuarios.buscar')}
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            select fullWidth size="small" label={t('usuarios.filtro_rol')}
            value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}
          >
            <MenuItem value="">{t('usuarios.todos_roles')}</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r.id} value={String(r.id)}>{r.nombre}</MenuItem>
            ))}
          </TextField>
          {hayFiltros && (
            <Button size="small" variant="outlined" onClick={() => { setSearch(''); setFiltroRol(''); }}>
              {t('usuarios.limpiar')}
            </Button>
          )}
        </Stack>
      </Paper>

      {isLoading && <LoadingState message={t('usuarios.loading')} />}
      {isError && <ErrorState title="Error" message={t('usuarios.error')} onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title={t('usuarios.empty.title')}
          description={hayFiltros ? t('usuarios.empty.sin_resultados') : t('usuarios.empty.desc')}
          action={!hayFiltros ? <Button variant="contained" onClick={() => navigate('/usuarios/nuevo')}>{t('usuarios.empty.crear')}</Button> : undefined}
        />
      )}

      {/* MÓVIL */}
      {!isLoading && !isError && filteredData.length > 0 && isMobile && (
        <Stack spacing={2}>
          {filteredData.map((u) => (
            <Paper key={u.id} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#0F172A', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {getInitials(u.nombre, u.email)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap color="text.primary">{u.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{u.email}</Typography>
                </Box>
                <UsuarioEstadoChip estado={u.estado_nombre} />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Chip
                  label={u.rol_nombre ?? '-'}
                  size="small"
                  sx={{ bgcolor: `${getRolColor(u.rol_nombre)}18`, color: getRolColor(u.rol_nombre), fontWeight: 600, fontSize: 11 }}
                />
              </Box>

              <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Button size="small" startIcon={<Eye size={16} />} onClick={() => navigate(`/usuarios/${u.id}`)}>
                  {t('usuarios.acciones.ver')}
                </Button>
                <Button
                  size="small" color="warning"
                  startIcon={<RefreshCw size={16} />}
                  onClick={() => handleRegenerarTotp(u.id, u.email)}
                  disabled={regenerarTotpMutation.isPending}
                >
                  TOTP
                </Button>
                <IconButton color="error" size="small" onClick={() => handleDarDeBaja(u.id)} disabled={darDeBajaMutation.isPending}>
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* DESKTOP */}
      {!isLoading && !isError && filteredData.length > 0 && !isMobile && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{t('usuarios.tabla.usuario')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('usuarios.tabla.email')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('usuarios.tabla.rol')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('usuarios.tabla.estado')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{t('usuarios.tabla.acciones')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#0F172A', fontSize: 11, fontWeight: 700 }}>
                        {getInitials(u.nombre, u.email)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{u.nombre}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
                  <TableCell>
                    <Chip
                      label={u.rol_nombre ?? '-'}
                      size="small"
                      sx={{ bgcolor: `${getRolColor(u.rol_nombre)}18`, color: getRolColor(u.rol_nombre), fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell><UsuarioEstadoChip estado={u.estado_nombre} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                      <Tooltip title={t('usuarios.acciones.ver')}>
                        <IconButton size="small" onClick={() => navigate(`/usuarios/${u.id}`)}>
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('usuarios.acciones.totp')}>
                        <IconButton size="small" color="warning" onClick={() => handleRegenerarTotp(u.id, u.email)} disabled={regenerarTotpMutation.isPending}>
                          <RefreshCw size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('usuarios.acciones.baja')}>
                        <IconButton size="small" color="error" onClick={() => handleDarDeBaja(u.id)} disabled={darDeBajaMutation.isPending}>
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {qrData && (
        <QRCodeModal
          open={!!qrData}
          onClose={() => setQrData(null)}
          qrUrl={qrData.qrUrl}
          email={qrData.email}
          totpSeed={qrData.totpSeed}
        />
      )}
    </AppLayout>
  );
};