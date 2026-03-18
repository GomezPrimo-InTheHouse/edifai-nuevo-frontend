import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { TrabajadorForm } from '../components/TrabajadorForm';
import { useCreateTrabajador } from '../hooks/useTrabajadores';
import { useEspecialidadesList } from '../hooks/useEspecialidades';

export const TrabajadorCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateTrabajador();
  const { data: especialidades = [] } = useEspecialidadesList();

  const handleSubmit = async (values: any) => {
    await createMutation.mutateAsync(values);
    navigate('/trabajadores');
  };

  return (
    <AppLayout>
      <PageHeader
        title="Nuevo trabajador"
        subtitle="Registrar un nuevo trabajador en el sistema."
        actions={
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/trabajadores')}>
            Volver
          </Button>
        }
      />
      <TrabajadorForm especialidades={especialidades} onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </AppLayout>
  );
};