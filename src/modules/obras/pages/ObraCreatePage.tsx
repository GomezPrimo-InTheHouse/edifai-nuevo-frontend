import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { ObraForm } from '../components/ObraForm';
import { useCreateObra, useTiposObraOptions, useEstadosObraOptions } from '../hooks/useObras';
import { useClientesList } from '../../clientes/hooks/useClientes';
import { useNotify } from '../../../shared/hooks/useNotify';
import { sectorApi } from '../../../services/api/sector.api';
import type { ObraFormValues } from '../types/obra.types';

export const ObraCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const createMutation = useCreateObra();
  const { data: tiposObra = [] } = useTiposObraOptions();
  const { data: estados = [] }   = useEstadosObraOptions();
  const { data: clientes = [] }  = useClientesList();

  const handleSubmit = async (values: ObraFormValues) => {
    const { sectores, ...obraPayload } = values;
    try {
      const response = await createMutation.mutateAsync(obraPayload as any);
      const obraId: number = (response as any).obra?.id ?? (response as any).id;

      if (sectores && sectores.length > 0 && obraId) {
        try {
          await sectorApi.createWithHierarchy(obraId, sectores as any);
        } catch {
          notify.warning?.('Obra creada, pero hubo un error al guardar algunos sectores.');
        }
      }

      notify.success(t('obras.notify.creada'));
      navigate(`/obras/${obraId}`);
    } catch {
      notify.error(t('obras.notify.error_crear'));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('obras.create.title')}
        subtitle={t('obras.create.subtitle')}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/obras')}>
              {t('obras.acciones.volver')}
            </Button>
          </Stack>
        }
      />
      <ObraForm
        tiposObra={tiposObra} estados={estados} clientes={clientes}
        onSubmit={handleSubmit} isSubmitting={createMutation.isPending}
      />
    </AppLayout>
  );
};