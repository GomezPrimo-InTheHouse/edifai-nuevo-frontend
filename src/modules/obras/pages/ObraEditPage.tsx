import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';

import { ObraForm } from '../components/ObraForm';

import {
  useObraDetail,
  useUpdateObra,
  useTiposObraOptions,
  useEstadosObraOptions,
} from '../hooks/useObras';


export const ObraEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const obraId = Number(id);

  const { data: obra, isLoading } = useObraDetail(obraId);

  const updateMutation = useUpdateObra();

  const { data: tiposObra = [] } = useTiposObraOptions();
  const { data: estados = [] } = useEstadosObraOptions();

  if (isLoading) return <LoadingState message="Cargando obra..." />;

  const handleSubmit = async (values: any) => {
    await updateMutation.mutateAsync({
      id: obraId,
      ...values,
    });

    navigate(`/obras/${obraId}`);
  };

return (
    <AppLayout>
      <PageHeader
        title="Editar obra"
        subtitle="Modificar información de la obra."
      />

      <ObraForm
        initialData={obra}
        tiposObra={tiposObra}
        estados={estados}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </AppLayout>
  );

};