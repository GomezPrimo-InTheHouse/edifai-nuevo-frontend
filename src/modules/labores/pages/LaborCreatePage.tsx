import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LaborForm } from '../components/LaborForm';
import { useCreateLabor } from '../hooks/useLabores';
import type { LaborFormValues } from '../types/labor.types';

export const LaborCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const obraIdFijo = searchParams.get('obra_id') ? Number(searchParams.get('obra_id')) : undefined;
  const createMutation = useCreateLabor();

const handleSubmit = async (values: LaborFormValues) => {
  console.log('VALUES DEL FORM:', values); // ← agregá esto
  const payload = {
    ...values,
    trabajador_id: values.trabajador_id === '' ? null : values.trabajador_id,
    especialidad_id: values.especialidad_id === '' ? null : values.especialidad_id,
    estado_id: values.estado_id === '' ? null : values.estado_id,
    obra_id: values.obra_id === '' ? null : values.obra_id,
  };
  console.log('PAYLOAD ENVIADO:', payload); // ← y esto
  await createMutation.mutateAsync(payload as any);
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