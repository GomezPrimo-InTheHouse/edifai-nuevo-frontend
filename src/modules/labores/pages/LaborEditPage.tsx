import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { LaborForm } from '../components/LaborForm';
import { useLaborDetail, useUpdateLabor } from '../hooks/useLabores';

export const LaborEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const laborId = Number(id);

  const { data: labor, isLoading } = useLaborDetail(laborId);
  const updateMutation = useUpdateLabor();

  if (isLoading) return <LoadingState message="Cargando labor..." />;

  const handleSubmit = async (values: any) => {
    await updateMutation.mutateAsync({ id: laborId, ...values });
    navigate(`/labores/${laborId}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Editar labor"
        subtitle="Modificar información de la labor."
        actions={
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/labores')}>
            Volver
          </Button>
        }
      />
      <LaborForm initialData={labor} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} />
    </AppLayout>
  );
};