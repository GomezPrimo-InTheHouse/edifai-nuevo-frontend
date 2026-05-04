// import React from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Button } from '@mui/material';
// import { ArrowLeft } from 'lucide-react';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { UsuarioForm } from '../components/UsuarioForm';
// import { useUpdateUsuario, useUsuarioDetail } from '../hooks/useUsuarios';
// import { useNotify } from '../../../shared/hooks/useNotify';

// export const UsuarioEditPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const usuarioId = Number(id);
//   const notify = useNotify();
//   const { data: usuario, isLoading } = useUsuarioDetail(usuarioId);
//   const updateMutation = useUpdateUsuario();

//   if (isLoading) return <LoadingState message="Cargando usuario..." />;

//   const handleSubmit = async (values: any) => {
//     try {
//       await updateMutation.mutateAsync({ id: usuarioId, nombre: values.nombre, email: values.email, rol_id: Number(values.rol_id) });
//       notify.success('Usuario actualizado.');
//       navigate(`/usuarios/${usuarioId}`);
//     } catch (error: any) {
//       notify.error(error?.response?.data?.message || 'No se pudo actualizar.');
//     }
//   };

//   return (
//     <AppLayout>
//       <PageHeader
//         title="Editar usuario"
//         subtitle="Modificar información del usuario."
//         actions={<Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/usuarios/${usuarioId}`)}>Volver</Button>}
//       />
//       <UsuarioForm initialData={usuario} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} isEdit />
//     </AppLayout>
//   );
// };

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { UsuarioForm } from '../components/UsuarioForm';
import { useUpdateUsuario, useUsuarioDetail } from '../hooks/useUsuarios';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useAuthStore } from '../../../app/store/auth.store';

const ROLES_TRABAJADOR = [7, 8];

export const UsuarioEditPage: React.FC = () => {
  const navigate   = useNavigate();
  const { id }     = useParams<{ id: string }>();
  const usuarioId  = Number(id);
  const notify     = useNotify();
  const user       = useAuthStore((s) => s.user);

  const { data: usuario, isLoading } = useUsuarioDetail(usuarioId);
  const updateMutation = useUpdateUsuario();

  if (isLoading) return <LoadingState message="Cargando usuario..." />;

  const esTrabajador = ROLES_TRABAJADOR.includes(Number(usuario?.rol_id));

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        id:                    usuarioId,
        email:                 values.email,
        usuario_modificador_id: user?.id ?? null,
      };

      if (esTrabajador) {
        // Trabajadores: solo email y password (si vino algo)
        if (values.password) payload.password = values.password;
      } else {
        // Admins y otros: nombre + rol también
        payload.nombre  = values.nombre;
        payload.rol_id  = Number(values.rol_id);
      }

      await updateMutation.mutateAsync(payload);
      notify.success('Usuario actualizado.');
      navigate(`/usuarios/${usuarioId}`);
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo actualizar.');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Editar usuario"
        subtitle={
          esTrabajador
            ? 'Solo podés modificar el acceso al sistema de este trabajador.'
            : 'Modificar información del usuario.'
        }
        actions={
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/usuarios/${usuarioId}`)}>
            Volver
          </Button>
        }
      />
      <UsuarioForm
        initialData={usuario}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        isEdit
      />
    </AppLayout>
  );
};