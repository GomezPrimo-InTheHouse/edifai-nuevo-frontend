import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LaborForm } from '../components/LaborForm';
import { useCreateLabor } from '../hooks/useLabores';

export const LaborCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const obraIdFijo = searchParams.get('obra_id') ? Number(searchParams.get('obra_id')) : undefined;
  const createMutation = useCreateLabor();

  const handleSubmit = async (values: any) => {
    await createMutation.mutateAsync(values);
    navigate(obraIdFijo ? `/labores?obra_id=${obraIdFijo}` : '/labores');
  };

  return (
    <AppLayout>
      <PageHeader
        title="Nueva labor"
        subtitle="Registrar una nueva labor en el sistema."
        actions={
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/labores')}>
            Volver
          </Button>
        }
      />
      <LaborForm obraIdFijo={obraIdFijo} onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </AppLayout>
  );
};