import { useState } from 'react';
import {
  Box, Button, Grid, Stack, TextField,
  Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PublicacionCard } from '../components/PublicacionCard';
import { TransaccionModal } from '../components/TransaccionModal';
import { usePublicaciones } from '../hooks/usePublicaciones';
import type { Publicacion } from '../types/market.types';
import { useNavigate } from 'react-router-dom';

export const MarketPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: publicaciones = [], isLoading, isError, refetch } = usePublicaciones();
  const [search, setSearch] = useState('');
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtradas = publicaciones.filter((p) =>
    p.nombre_material.toLowerCase().includes(search.toLowerCase()) ||
    p.vendedor_nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleComprar = (publicacion: Publicacion) => {
    setPublicacionSeleccionada(publicacion);
    setModalOpen(true);
  };

  if (isLoading) return <AppLayout><LoadingState message={t('market.loading')} /></AppLayout>;
  if (isError) return <AppLayout><ErrorState title="Error" message={t('market.error')} onRetry={refetch} /></AppLayout>;

  return (
    <AppLayout>
      <PageHeader
        title={t('market.title')}
        subtitle={t('market.subtitle')}
        actions={
          <Button
            variant="outlined"
            startIcon={<ShoppingBag size={16} />}
            onClick={() => navigate('/market/mis-publicaciones')}
          >
            {t('market.mis_publicaciones')}
          </Button>
        }
      />

      {/* Buscador */}
      <Box sx={{
        mb: 3, p: 2,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
      }}>
        <TextField
          fullWidth
          size={isMobile ? 'small' : 'medium'}
          placeholder="Buscar por material o vendedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {filtradas.length === 0 ? (
        <EmptyState
          title={t('market.empty.title')}
          description={t('market.empty.desc')}
        />
      ) : (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {filtradas.length} publicación{filtradas.length !== 1 ? 'es' : ''} disponible{filtradas.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {filtradas.map((pub) => (
              <Grid key={pub.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <PublicacionCard publicacion={pub} onComprar={handleComprar} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <TransaccionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setPublicacionSeleccionada(null); }}
        publicacion={publicacionSeleccionada}
      />
    </AppLayout>
  );
};