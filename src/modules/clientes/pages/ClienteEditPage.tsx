// import React from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Button } from '@mui/material';
// import { ArrowLeft } from 'lucide-react';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ClienteForm } from '../components/ClienteForm';
// import { useClienteDetail, useUpdateCliente } from '../hooks/useClientes';
// import { useNotify } from '../../../shared/hooks/useNotify';
// import type { ClienteFormValues } from '../types/cliente.types';

// export const ClienteEditPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const clienteId = Number(id);
//   const notify = useNotify();
//   const { data: cliente, isLoading } = useClienteDetail(clienteId);
//   const updateMutation = useUpdateCliente();

//   if (isLoading) return <LoadingState message="Cargando cliente..." />;

//   const handleSubmit = async (values: ClienteFormValues) => {
//     try {
//       await updateMutation.mutateAsync({
//         id: clienteId,
//         nombre:       values.nombre,
//         apellido:     values.apellido     || null,
//         razon_social: values.razon_social || null,
//         dni_cuit:     values.dni_cuit     || null,
//         telefono:     values.telefono,
//         direccion:    values.direccion    || null,
//         email:        values.email        || null,
//       });
//       notify.success('Cliente actualizado correctamente.');
//       navigate(`/clientes/${clienteId}`);
//     } catch {
//       notify.error('No se pudo actualizar el cliente.');
//     }
//   };

//   return (
//     <AppLayout>
//       <PageHeader
//         title="Editar cliente"
//         subtitle="Modificar información del cliente."
//         actions={
//           <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/clientes/${clienteId}`)}>
//             Volver
//           </Button>
//         }
//       />
//       <ClienteForm initialData={cliente} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} isEdit />
//     </AppLayout>
//   );
// };

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ClienteForm } from '../components/ClienteForm';
import { useClienteDetail, useUpdateCliente } from '../hooks/useClientes';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { ClienteFormValues } from '../types/cliente.types';

export const ClienteEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const clienteId = Number(id);
  const notify = useNotify();
  const { data: cliente, isLoading } = useClienteDetail(clienteId);
  const updateMutation = useUpdateCliente();

  if (isLoading) return <LoadingState message={t('clientes.loading_detail')} />;

  const handleSubmit = async (values: ClienteFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: clienteId,
        nombre:       values.nombre,
        apellido:     values.apellido     || null,
        razon_social: values.razon_social || null,
        dni_cuit:     values.dni_cuit     || null,
        telefono:     values.telefono,
        direccion:    values.direccion    || null,
        email:        values.email        || null,
      });
      notify.success(t('clientes.notify.actualizado'));
      navigate(`/clientes/${clienteId}`);
    } catch {
      notify.error(t('clientes.notify.error_actualizar'));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('clientes.edit.title')}
        subtitle={t('clientes.edit.subtitle')}
        actions={
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/clientes/${clienteId}`)}>
            {t('clientes.acciones.volver')}
          </Button>
        }
      />
      <ClienteForm initialData={cliente} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} isEdit />
    </AppLayout>
  );
};