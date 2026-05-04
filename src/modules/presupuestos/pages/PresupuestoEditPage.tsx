import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { PresupuestoForm } from '../components/PresupuestoForm';
import { usePresupuestoDetail, useUpdatePresupuesto } from '../hooks/usePresupuestos';
import { useNotify } from '../../../shared/hooks/useNotify';

export const PresupuestoEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const presupuestoId = Number(id);
  const notify = useNotify();
  const { data: presupuesto, isLoading } = usePresupuestoDetail(presupuestoId);
  const updateMutation = useUpdatePresupuesto();

  if (isLoading) return <LoadingState message="Cargando presupuesto..." />;

const handleSubmit = async (values: any) => {
  console.log('handleSubmit llamado con values:', values); // ← agregar
  try {
    await updateMutation.mutateAsync({
      id: presupuestoId,
      nombre: values.nombre,
      descripcion: values.descripcion,
      estado_id: values.estado_id === '' ? undefined : Number(values.estado_id),
      costo_mano_obra: values.costo_mano_obra === '' ? 0 : Number(values.costo_mano_obra),
    });
    notify.success('Presupuesto actualizado.');
    navigate(`/presupuestos/${presupuestoId}`);
  } catch {
    notify.error('No se pudo actualizar.');
  }
};

  return (
    <AppLayout>
      <PageHeader
        title="Editar presupuesto"
        subtitle="Modificar información del presupuesto."
        actions={<Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/presupuestos/${presupuestoId}`)}>Volver</Button>}
      />
      <PresupuestoForm initialData={presupuesto} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} />
    </AppLayout>
  );
};