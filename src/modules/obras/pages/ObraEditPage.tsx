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

export const ObraEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const obraId = Number(id);

  const { data: obra, isLoading } = useObraDetail(obraId);
  const updateMutation = useUpdateObra();
  const { data: tiposObra = [] } = useTiposObraOptions();
  const { data: estados = [] } = useEstadosObraOptions();

  if (isLoading) return <LoadingState message="Cargando obra..." />;

  // Handler de edición — redirige al detalle al completarse
  const handleSubmit = async (values: any) => {
    await updateMutation.mutateAsync({ id: obraId, ...values });
    navigate(`/obras/${obraId}`);
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
        estados={estados}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </AppLayout>
  );
};