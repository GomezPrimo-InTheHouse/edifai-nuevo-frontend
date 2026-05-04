import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, useTheme, useMediaQuery } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { ObraForm } from '../components/ObraForm';
import { useNotify } from '../../../shared/context/NotifyContext'; 

import {
  useCreateObra,
  useEstadosObraOptions,
  useTiposObraOptions,
} from '../hooks/useObras';

export const ObraCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const createMutation = useCreateObra();
  const { data: tiposObra = [] } = useTiposObraOptions();
  const { data: estados = [] } = useEstadosObraOptions();

  const handleSubmit = async (values: any) => {
  try {
    await createMutation.mutateAsync(values);
    notify.success('La obra se ha registrado exitosamente.');
    navigate('/obras');
  } catch (error: any) {
    // 1. Log para diagnóstico (Míralo en la consola F12)
    console.error("DEBUG ERROR COMPLETO:", error);
    console.log("DATA DEL ERROR:", error.response?.data);

    // 2. Extracción ultra-flexible del mensaje
    const errorMessage = 
      error.response?.data?.error ||        // Caso: { error: "..." }
      error.response?.data?.message ||      // Caso: { message: "..." }
      error.response?.data ||               // Caso: "Mensaje directo"
      error.message ||                      // Error genérico de JS/Network
      'Error desconocido al procesar la solicitud';

    // 3. Lanzar la notificación
    console.log("MENSAJE EXTRAÍDO PARA NOTIFICACIÓN:", errorMessage);
    console.log('RESPONSE DATA:', error.response?.data);
    console.log('STATUS:', error.response?.status);
    
    notify.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
};

  return (
    <AppLayout>
      <PageHeader
        title="Nueva obra"
        subtitle="Registrar una nueva obra en el sistema."
        actions={
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/obras')}
            sx={{ borderRadius: 2 }}
          >
            {isMobile ? "Volver" : "Volver a obras"}
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