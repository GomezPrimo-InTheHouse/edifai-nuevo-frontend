import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import  {MaterialForm}  from '../components/MaterialForm';
import { useCreateMaterial } from '../hooks/useMateriales';
import { useNotify } from '../../../shared/hooks/useNotify';

export const MaterialCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const createMutation = useCreateMaterial();

 const handleSubmit = async (values: any) => {
  const cleanValues = {
    ...values,
    tipo_material_id: values.tipo_material_id === '' ? null : values.tipo_material_id,
    porcentaje_aumento_mensual: values.porcentaje_aumento_mensual === '' ? null : values.porcentaje_aumento_mensual,
    imagen_url: values.imagen_url === '' ? null : values.imagen_url,
  };
  try {
    await createMutation.mutateAsync(cleanValues);
    notify.success('Material creado correctamente.');
    navigate('/materiales');
  } catch {
    notify.error('No se pudo crear el material.');
  }
};

  return (
    <AppLayout>
      <PageHeader
        title="Nuevo material"
        subtitle="Registrar un nuevo material en el sistema."
        actions={<Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/materiales')}>Volver</Button>}
      />
      <MaterialForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </AppLayout>
  );
};