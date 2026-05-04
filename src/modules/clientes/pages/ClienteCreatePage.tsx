import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { ClienteForm } from '../components/ClienteForm';
import { useCreateCliente } from '../hooks/useClientes';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { ClienteFormValues } from '../types/cliente.types';

export const ClienteCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const createMutation = useCreateCliente();

  const handleSubmit = async (values: ClienteFormValues) => {
    try {
      await createMutation.mutateAsync({
        nombre:       values.nombre,
        apellido:     values.apellido     || null,
        razon_social: values.razon_social || null,
        dni_cuit:     values.dni_cuit     || null,
        telefono:     values.telefono,
        direccion:    values.direccion    || null,
        email:        values.email        || null,
      });
      notify.success('Cliente creado correctamente.');
      navigate('/clientes');
    } catch {
      notify.error('No se pudo crear el cliente.');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Nuevo cliente"
        subtitle="Registrar un nuevo cliente en el sistema."
        actions={
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/clientes')}>
            Volver
          </Button>
        }
      />
      <ClienteForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </AppLayout>
  );
};