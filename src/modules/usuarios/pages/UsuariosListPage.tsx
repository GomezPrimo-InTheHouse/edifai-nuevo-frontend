// import React, { useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Button, IconButton, Paper, Stack, Table, TableBody,
//   TableCell, TableHead, TableRow, TextField, Typography,
// } from '@mui/material';
// import { Eye, Plus, Trash2 } from 'lucide-react';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
// import { UsuarioEstadoChip } from '../components/UsuarioEstadoChip';
// import { useDarDeBajaUsuario, useUsuariosList } from '../hooks/useUsuarios';
// import { useNotify } from '../../../shared/hooks/useNotify';

// export const UsuariosListPage: React.FC = () => {
//   const navigate = useNavigate();
//   const notify = useNotify();
//   const { data, isLoading, isError, refetch } = useUsuariosList();
//   const darDeBajaMutation = useDarDeBajaUsuario();
//   const [search, setSearch] = useState('');

//   const filteredData = useMemo(() => {
//     if (!data) return [];
//     const term = search.trim().toLowerCase();
//     if (!term) return data;
//     return data.filter((u) =>
//       u.nombre?.toLowerCase().includes(term) ||
//       u.email?.toLowerCase().includes(term)
//     );
//   }, [data, search]);

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

//       <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
//         <TextField fullWidth label="Buscar por nombre o email" value={search} onChange={(e) => setSearch(e.target.value)} />
//       </Paper>

//       {isLoading && <LoadingState message="Cargando usuarios..." />}
//       {isError && <ErrorState title="Error" message="No se pudieron cargar los usuarios." onRetry={refetch} />}
//       {!isLoading && !isError && filteredData.length === 0 && (
//         <EmptyState title="Sin usuarios" description="No hay usuarios registrados."
//           action={<Button variant="contained" onClick={() => navigate('/usuarios/nuevo')}>Crear primero</Button>} />
//       )}

//       {!isLoading && !isError && filteredData.length > 0 && (
//         <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Nombre</TableCell>
//                 <TableCell>Email</TableCell>
//                 <TableCell>Rol</TableCell>
//                 <TableCell>Estado</TableCell>
//                 <TableCell align="right">Acciones</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredData.map((u) => (
//                 <TableRow key={u.id} hover>
//                   <TableCell><Typography fontWeight={600}>{u.nombre}</Typography></TableCell>
//                   <TableCell>{u.email}</TableCell>
//                   <TableCell>{u.rol_nombre ?? '-'}</TableCell>
//                   <TableCell><UsuarioEstadoChip estado={u.estado_nombre} /></TableCell>
//                   <TableCell align="right">
//                     <Stack direction="row" justifyContent="flex-end" spacing={1}>
//                       <IconButton onClick={() => navigate(`/usuarios/${u.id}`)}><Eye size={18} /></IconButton>
//                       <IconButton color="error" onClick={() => handleDarDeBaja(u.id)} disabled={darDeBajaMutation.isPending}>
//                         <Trash2 size={18} />
//                       </IconButton>
//                     </Stack>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Paper>
//       )}
//     </AppLayout>
//   );
// };

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, IconButton, Paper, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Eye, Plus, Trash2, RefreshCw } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { UsuarioEstadoChip } from '../components/UsuarioEstadoChip';
import { QRCodeModal } from '../components/QRCodeModal';
import { useDarDeBajaUsuario, useUsuariosList, useRegenerarTotp } from '../hooks/useUsuarios';
import { useNotify } from '../../../shared/hooks/useNotify';

export const UsuariosListPage: React.FC = () => {
  const navigate  = useNavigate();
  const notify    = useNotify();

  const { data, isLoading, isError, refetch } = useUsuariosList();
  const darDeBajaMutation   = useDarDeBajaUsuario();
  const regenerarTotpMutation = useRegenerarTotp();

  const [search, setSearch] = useState('');

  // Estado del modal de QR
  const [qrData, setQrData] = useState<{
    qrUrl:    string;
    email:    string;
    totpSeed: string;
  } | null>(null);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((u) =>
      u.nombre?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  }, [data, search]);

  const handleDarDeBaja = async (id: number) => {
    const confirmed = await notify.confirm({
      title:        '¿Dar de baja este usuario?',
      message:      'El usuario perderá acceso al sistema.',
      confirmLabel: 'Dar de baja',
      severity:     'error',
    });
    if (!confirmed) return;
    try {
      await darDeBajaMutation.mutateAsync(id);
      notify.success('Usuario dado de baja.');
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo dar de baja.');
    }
  };

  const handleRegenerarTotp = async (id: number, email: string) => {
    const confirmed = await notify.confirm({
      title:        '¿Regenerar TOTP?',
      message:      `Se generará un nuevo código para ${email}. El anterior dejará de funcionar.`,
      confirmLabel: 'Regenerar',
      severity:     'warning',
    });
    if (!confirmed) return;

    try {
      const result = await regenerarTotpMutation.mutateAsync(id);
      setQrData({
        qrUrl:    result.qrCodeDataURL,
        email,
        totpSeed: result.totp_seed,
      });
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo regenerar el TOTP.');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de usuarios administradores del sistema."
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate('/usuarios/nuevo')}
          >
            Nuevo usuario
          </Button>
        }
      />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <TextField
          fullWidth
          label="Buscar por nombre o email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>

      {isLoading && <LoadingState message="Cargando usuarios..." />}
      {isError && <ErrorState title="Error" message="No se pudieron cargar los usuarios." onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title="Sin usuarios"
          description="No hay usuarios registrados."
          action={<Button variant="contained" onClick={() => navigate('/usuarios/nuevo')}>Crear primero</Button>}
        />
      )}

      {!isLoading && !isError && filteredData.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell><Typography fontWeight={600}>{u.nombre}</Typography></TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.rol_nombre ?? '-'}</TableCell>
                  <TableCell><UsuarioEstadoChip estado={u.estado_nombre} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>

                      <Tooltip title="Ver detalle">
                        <IconButton onClick={() => navigate(`/usuarios/${u.id}`)}>
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Regenerar TOTP">
                        <IconButton
                          color="warning"
                          onClick={() => handleRegenerarTotp(u.id, u.email)}
                          disabled={regenerarTotpMutation.isPending}
                        >
                          <RefreshCw size={18} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Dar de baja">
                        <IconButton
                          color="error"
                          onClick={() => handleDarDeBaja(u.id)}
                          disabled={darDeBajaMutation.isPending}
                        >
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

      {/* Modal QR — reutiliza el mismo de crear usuario */}
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