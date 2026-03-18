import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { TrabajadorForm } from '../components/TrabajadorForm';
import { useTrabajadorDetail, useUpdateTrabajador } from '../hooks/useTrabajadores';
import { useEspecialidadesList } from '../hooks/useEspecialidades';

export const TrabajadorEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const trabajadorId = Number(id);

  const { data: trabajador, isLoading } = useTrabajadorDetail(trabajadorId);
  const updateMutation = useUpdateTrabajador();
  const { data: especialidades = [] } = useEspecialidadesList();

  if (isLoading) return <LoadingState message="Cargando trabajador..." />;

  const handleSubmit = async (values: any) => {
    await updateMutation.mutateAsync({ id: trabajadorId, ...values });
    navigate(`/trabajadores/${trabajadorId}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Editar trabajador"
        subtitle="Modificar información del trabajador."
        actions={
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/trabajadores')}>
            Volver
          </Button>
        }
      />
      <TrabajadorForm initialData={trabajador} especialidades={especialidades} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} />
    </AppLayout>
  );
};