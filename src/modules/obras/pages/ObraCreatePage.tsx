import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { ObraForm } from '../components/ObraForm';

import {
  useCreateObra,
  useEstadosObraOptions,
  useTiposObraOptions,
} from '../hooks/useObras';

export const ObraCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const createMutation = useCreateObra();
  const { data: tiposObra = [] } = useTiposObraOptions();
  const { data: estados = [] } = useEstadosObraOptions();

  const handleSubmit = async (values: any) => {
    await createMutation.mutateAsync(values);
    navigate('/obras');
  };

  return (
    <AppLayout>
      <PageHeader
        title="Nueva obra"
        subtitle="Registrar una nueva obra en el sistema."
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/obras')}
          >
            Volver a obras
          </Button>
        }
      />

      <ObraForm
        tiposObra={tiposObra}
        estados={estados}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
    </AppLayout>
  );
};