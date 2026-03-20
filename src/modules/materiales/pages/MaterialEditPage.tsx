import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { MaterialForm } from '../components/MaterialForm';
import { useMaterialDetail, useUpdateMaterial } from '../hooks/useMateriales';
import { useNotify } from '../../../shared/hooks/useNotify';

export const MaterialEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const materialId = Number(id);
  const notify = useNotify();
  const { data: material, isLoading } = useMaterialDetail(materialId);
  const updateMutation = useUpdateMaterial();

  if (isLoading) return <LoadingState message="Cargando material..." />;
const handleSubmit = async (values: any) => {
  const cleanValues = {
    ...values,
    tipo_material_id: values.tipo_material_id === '' ? null : values.tipo_material_id,
    porcentaje_aumento_mensual: values.porcentaje_aumento_mensual === '' ? null : values.porcentaje_aumento_mensual,
    imagen_url: values.imagen_url === '' ? null : values.imagen_url,
  };
  try {
    await updateMutation.mutateAsync({ id: materialId, ...cleanValues });
    notify.success('Material actualizado.');
    navigate(`/materiales/${materialId}`);
  } catch {
    notify.error('No se pudo actualizar el material.');
  }
};

  return (
    <AppLayout>
      <PageHeader
        title="Editar material"
        subtitle="Modificar información del material."
        actions={<Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/materiales')}>Volver</Button>}
      />
      <MaterialForm initialData={material} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} />
    </AppLayout>
  );
};