import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { TrabajadorForm } from '../components/TrabajadorForm';
import { useTrabajadorDetail, useUpdateTrabajador, useTrabajadoresList } from '../hooks/useTrabajadores';
import { useEspecialidadesList } from '../hooks/useEspecialidades';
import { useNotify } from '../../../shared/context/NotifyContext';

export const TrabajadorEditPage: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const trabajadorId = Number(id);

  const { data: trabajador, isLoading: loadingDetail } = useTrabajadorDetail(trabajadorId);
  const { data: trabajadores = [], isLoading: loadingList } = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const updateMutation = useUpdateTrabajador();

  if (loadingDetail || loadingList) {
    return <LoadingState message={t('trabajadores.edit.loading')} />;
  }

  const handleSubmit = async (values: any) => {
    const existeEmail = trabajadores.find(
      (t) =>
        t.email && t.email.toLowerCase() === values.email.toLowerCase() &&
        t.id !== trabajadorId
    );

    if (existeEmail) {
      return notify.error(
        t('trabajadores.edit.email_duplicado', {
          email: values.email,
          nombre: existeEmail.nombre,
          apellido: existeEmail.apellido,
        })
      );
    }

    const { password, ...restOfValues } = values;

    const cleanValues = {
      ...restOfValues,
      jefe_id: restOfValues.jefe_id === '' ? null : restOfValues.jefe_id,
      especialidad_id: restOfValues.especialidad_id === '' ? null : restOfValues.especialidad_id,
      estado_id: restOfValues.estado_id === '' ? null : restOfValues.estado_id,
    };

    try {
      await updateMutation.mutateAsync({ id: trabajadorId, ...cleanValues });
      notify.success(t('trabajadores.edit.success'));
      navigate(`/trabajadores/${trabajadorId}`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t('trabajadores.edit.error');
      notify.error(errorMsg);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('trabajadores.edit.title')}
        subtitle={t('trabajadores.edit.subtitle')}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/trabajadores')}
          >
            {t('trabajadores.acciones.volver')}
          </Button>
        }
      />
      <TrabajadorForm
        initialData={trabajador}
        especialidades={especialidades}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </AppLayout>
  );
};