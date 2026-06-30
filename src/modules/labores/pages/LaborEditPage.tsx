import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { LaborForm } from '../components/LaborForm';
import { useLaborDetail, useUpdateLabor } from '../hooks/useLabores';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { LaborFormValues } from '../types/labor.types';

export const LaborEditPage: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { id } = useParams<{ id: string }>();
  const laborId = Number(id);

  const { data: labor, isLoading } = useLaborDetail(laborId);
  const updateMutation = useUpdateLabor();

  if (isLoading) return <LoadingState message="Cargando labor..." />;

  const handleSubmit = async (values: LaborFormValues) => {
    const payload = {
      ...values,
      id: laborId,
      trabajador_id: values.trabajador_id === '' ? null : values.trabajador_id,
      especialidad_id: values.especialidad_id === '' ? null : values.especialidad_id,
      estado_id: values.estado_id === '' ? null : values.estado_id,
      obra_id: values.obra_id === '' ? null : values.obra_id,
      costo_estimado: values.costo_estimado === '' ? null : values.costo_estimado,
      fecha_inicio_real: values.fecha_inicio_real === '' ? null : values.fecha_inicio_real,
      fecha_fin_real: values.fecha_fin_real === '' ? null : values.fecha_fin_real,
    };
    try {
      await updateMutation.mutateAsync(payload as any);
      notify.success('Labor actualizada correctamente.');
      navigate(`/labores/${laborId}`);
    } catch {
      notify.error('No se pudo actualizar la labor.');
    }
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