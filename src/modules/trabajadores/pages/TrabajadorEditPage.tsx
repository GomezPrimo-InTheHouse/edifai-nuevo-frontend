// import React from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Button } from '@mui/material';
// import { ArrowLeft } from 'lucide-react';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { TrabajadorForm } from '../components/TrabajadorForm';
// import { useTrabajadorDetail, useUpdateTrabajador } from '../hooks/useTrabajadores';
// import { useEspecialidadesList } from '../hooks/useEspecialidades';

// export const TrabajadorEditPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const trabajadorId = Number(id);

//   const { data: trabajador, isLoading } = useTrabajadorDetail(trabajadorId);
//   const updateMutation = useUpdateTrabajador();
//   const { data: especialidades = [] } = useEspecialidadesList();

//   if (isLoading) return <LoadingState message="Cargando trabajador..." />;

//  const handleSubmit = async (values: any) => {
//   const cleanValues = {
//     ...values,
//     jefe_id: values.jefe_id === '' ? null : values.jefe_id,
//     especialidad_id: values.especialidad_id === '' ? null : values.especialidad_id,
//     estado_id: values.estado_id === '' ? null : values.estado_id,
//   };
//   await updateMutation.mutateAsync({ id: trabajadorId, ...cleanValues });
//   navigate(`/trabajadores/${trabajadorId}`);
// };

//   return (
//     <AppLayout>
//       <PageHeader
//         title="Editar trabajador"
//         subtitle="Modificar información del trabajador."
//         actions={
//           <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/trabajadores')}>
//             Volver
//           </Button>
//         }
//       />
//       <TrabajadorForm initialData={trabajador} especialidades={especialidades} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} />
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
import { TrabajadorForm } from '../components/TrabajadorForm';
import { useTrabajadorDetail, useUpdateTrabajador, useTrabajadoresList } from '../hooks/useTrabajadores';
import { useEspecialidadesList } from '../hooks/useEspecialidades';
import { useNotify } from '../../../shared/context/NotifyContext';

export const TrabajadorEditPage: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { id } = useParams<{ id: string }>();
  const trabajadorId = Number(id);

  // Hooks de datos
  const { data: trabajador, isLoading: loadingDetail } = useTrabajadorDetail(trabajadorId);
  const { data: trabajadores = [], isLoading: loadingList } = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  
  // Mutación
  const updateMutation = useUpdateTrabajador();

  if (loadingDetail || loadingList) {
    return <LoadingState message="Cargando información del trabajador..." />;
  }

  const handleSubmit = async (values: any) => {
    // 1. VALIDACIÓN DE EMAIL DUPLICADO EN FRONTEND
    // Buscamos si existe otro trabajador con el mismo email (ignorando mayúsculas)
    const existeEmail = trabajadores.find(
      (t) => 
        t.email && t.email.toLowerCase() === values.email.toLowerCase() && 
        t.id !== trabajadorId // Que no sea el mismo que estamos editando
    );

    if (existeEmail) {
      return notify.error(
        `El email "${values.email}" ya pertenece a otro trabajador (${existeEmail.nombre} ${existeEmail.apellido}).`
      );
    }

    // 2. LIMPIEZA DE DATOS (No enviamos password y formateamos IDs)
    const { password, ...restOfValues } = values;

    const cleanValues = {
      ...restOfValues,
      jefe_id: restOfValues.jefe_id === '' ? null : restOfValues.jefe_id,
      especialidad_id: restOfValues.especialidad_id === '' ? null : restOfValues.especialidad_id,
      estado_id: restOfValues.estado_id === '' ? null : restOfValues.estado_id,
    };

    try {
      // 3. EJECUCIÓN DE LA ACTUALIZACIÓN
      await updateMutation.mutateAsync({ 
        id: trabajadorId, 
        ...cleanValues 
      });

      // Notificación de éxito
      notify.success('Información actualizada correctamente');
      
      // Navegación al detalle
      navigate(`/trabajadores/${trabajadorId}`);
    } catch (error: any) {
      // Manejo de errores de API
      const errorMsg = error.response?.data?.message || 'Error al intentar actualizar el trabajador';
      notify.error(errorMsg);
      console.error('Error update:', error);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Editar trabajador"
        subtitle="Modificar información del trabajador y sus permisos."
        actions={
          <Button 
            variant="outlined" 
            startIcon={<ArrowLeft size={16} />} 
            onClick={() => navigate('/trabajadores')}
          >
            Volver
          </Button>
        }
      />
      
      <TrabajadorForm 
        initialData={trabajador} 
        especialidades={especialidades} 
        onSubmit={handleSubmit} 
        isSubmitting={updateMutation.isPending} 
      />
    </AppLayout>
  );
};