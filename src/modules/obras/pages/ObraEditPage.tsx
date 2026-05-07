// import React from 'react';
// import { useNavigate, useParams } from 'react-router-dom';

// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';

// import { ObraForm } from '../components/ObraForm';

// import {
//   useObraDetail,
//   useUpdateObra,
//   useTiposObraOptions,
//   useEstadosObraOptions,
// } from '../hooks/useObras';


// export const ObraEditPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();

//   const obraId = Number(id);

//   const { data: obra, isLoading } = useObraDetail(obraId);

//   const updateMutation = useUpdateObra();

//   const { data: tiposObra = [] } = useTiposObraOptions();
//   const { data: estados = [] } = useEstadosObraOptions();

//   if (isLoading) return <LoadingState message="Cargando obra..." />;

//   const handleSubmit = async (values: any) => {
//     await updateMutation.mutateAsync({
//       id: obraId,
//       ...values,
//     });

//     navigate(`/obras/${obraId}`);
//   };

// return (
//     <AppLayout>
//       <PageHeader
//         title="Editar obra"
//         subtitle="Modificar información de la obra."
//       />

//       <ObraForm
//         initialData={obra}
//         tiposObra={tiposObra}
//         estados={estados}
//         onSubmit={handleSubmit}
//         isSubmitting={updateMutation.isPending}
//       />
//     </AppLayout>
//   );

// };

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

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
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const obraId = Number(id);
  const { data: clientes = [] } = useClientesList();

  const { data: obra, isLoading } = useObraDetail(obraId);
  const updateMutation = useUpdateObra();
  const { data: tiposObra = [] } = useTiposObraOptions();
  const { data: estados = [] } = useEstadosObraOptions();

  if (isLoading) return <LoadingState message="Cargando obra..." />;

  // Handler de edición — redirige al detalle al completarse
 
    const notify = useNotify(); 
    
    const handleSubmit = async (values: any) => {

  try {
    await updateMutation.mutateAsync({ id: obraId, ...values });
    notify.success('La obra se ha registrado exitosamente.');
    navigate(`/obras/${obraId}`);
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
        title="Editar obra"
        subtitle="Modificar información de la obra."
        actions={
          <Stack direction="row" spacing={1}>
            {/* Botón para volver al listado de obras */}
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/obras')}
            >
              Volver a obras
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