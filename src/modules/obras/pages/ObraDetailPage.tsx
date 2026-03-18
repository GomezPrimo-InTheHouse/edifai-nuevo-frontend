import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';

import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { StatusChip } from '../../../shared/components/StatusChip/StatusChip';

import { useObraDetail } from '../hooks/useObras';


export const ObraDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const obraId = Number(id);

  const { data: obra, isLoading, isError, refetch } = useObraDetail(obraId);

  if (isLoading) return <LoadingState message="Cargando obra..." />;

  if (isError)
    return (
      <ErrorState
        title="Error"
        message="No se pudo cargar la obra."
        onRetry={refetch}
      />
    );

  if (!obra)
    return (
      <ErrorState
        title="Obra no encontrada"
        message="La obra solicitada no existe."
      />
    );

return (
    <AppLayout>
      <PageHeader
        title={obra.nombre}
        subtitle="Vista detallada de la obra."
        actions={
          <Button
            variant="contained"
            onClick={() => navigate(`/obras/${obra.id}/editar`)}
          >
            Editar obra
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Información general</Typography>

              <Typography><strong>Ubicación:</strong> {obra.ubicacion}</Typography>
              <Typography><strong>Descripción:</strong> {obra.descripcion}</Typography>
              <Typography><strong>Inicio estimado:</strong> {obra.fecha_inicio_estimado}</Typography>
              <Typography><strong>Fin estimado:</strong> {obra.fecha_fin_estimado}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Estado</Typography>

              <StatusChip
                label={obra.estado_id ? `Estado ${obra.estado_id}` : 'Sin estado'}
                variant={obra.estado_id ? 'success' : 'warning'}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );

};