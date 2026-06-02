
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
import { useNotify } from '../../../shared/context/NotifyContext';
import { useClientesList } from '../../clientes/hooks/useClientes';

export const ObraEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const obraId = Number(id);
  const { data: clientes = [] } = useClientesList();

  const { data: obra, isLoading } = useObraDetail(obraId);
  const updateMutation = useUpdateObra();
  const { data: tiposObra = [] } = useTiposObraOptions();
  const { data: estados = [] } = useEstadosObraOptions();

  if (isLoading) return <LoadingState message={t('obras.detail.loading')} />;

  const notify = useNotify();

  const handleSubmit = async (values: any) => {
    try {
      await updateMutation.mutateAsync({ id: obraId, ...values });
      notify.success(t('obras.notify.actualizada'));
      navigate(`/obras/${obraId}`);
    } catch (error: any) {
      console.error("DEBUG ERROR COMPLETO:", error);
      console.log("DATA DEL ERROR:", error.response?.data);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        t('obras.notify.error_desconocido');

      console.log("MENSAJE EXTRAÍDO PARA NOTIFICACIÓN:", errorMessage);
      console.log('RESPONSE DATA:', error.response?.data);
      console.log('STATUS:', error.response?.status);

      notify.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('obras.edit.title')}
        subtitle={t('obras.edit.subtitle')}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/obras')}
            >
              {t('obras.acciones.volver')}
            </Button>
          </Stack>
        }
      />

      <ObraForm
        initialData={obra}
        tiposObra={tiposObra}
        clientes={clientes}
        estados={estados}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </AppLayout>
  );
};