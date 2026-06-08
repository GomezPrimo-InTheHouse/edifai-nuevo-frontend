import { useState } from 'react';

import { Box, Badge, Button, Grid, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
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
import { MessageSquare, ShoppingBag, PackageCheck } from 'lucide-react';
import { useMensajesNoLeidos } from '../hooks/useChatTransaccion';
import { useTransacciones } from '../hooks/useTransacciones';
import { useAuthStore } from '../../../app/store/auth.store';

export const MarketPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // en el componente:
  const { data: noLeidos = [] } = useMensajesNoLeidos();
  const totalNoLeidos = noLeidos.reduce((acc, item) => acc + Number(item.cantidad), 0);

  const { data: publicaciones = [], isLoading, isError, refetch } = usePublicaciones();
  const [search, setSearch] = useState('');
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // en el componente, después de usePublicaciones:
  const { data: misTransacciones = [] } = useTransacciones();
  const user = useAuthStore((s) => s.user);


  const filtradas = publicaciones.filter((p) =>
    p.nombre_material.toLowerCase().includes(search.toLowerCase()) ||
    p.vendedor_nombre.toLowerCase().includes(search.toLowerCase())
  );

  // función helper
  const yaTieneSolicitud = (publicacion_id: number): boolean => {
    return misTransacciones.some(
      (tx) => tx.publicacion_id === publicacion_id &&
        tx.comprador_id === user?.id &&
        tx.estado === 'pendiente'
    );
  };
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
  <Stack direction="row" spacing={1} alignItems="center">
    <Badge badgeContent={totalNoLeidos} color="warning" invisible={totalNoLeidos === 0}>
      <Button
        variant="outlined"
        onClick={() => navigate('/market/inbox')}
        sx={{ minWidth: 0, px: isMobile ? 1.25 : 2 }}
        startIcon={!isMobile ? <MessageSquare size={16} /> : undefined}
      >
        {isMobile ? <MessageSquare size={18} /> : 'Inbox'}
      </Button>
    </Badge>
    <Button
      variant="outlined"
      onClick={() => navigate('/market/mis-publicaciones')}
      sx={{ minWidth: 0, px: isMobile ? 1.25 : 2 }}
      startIcon={!isMobile ? <ShoppingBag size={16} /> : undefined}
    >
      {isMobile ? <ShoppingBag size={18} /> : t('market.mis_publicaciones')}
    </Button>
    <Button
      variant="outlined"
      onClick={() => navigate('/market/mis-compras')}
      sx={{ minWidth: 0, px: isMobile ? 1.25 : 2 }}
      startIcon={!isMobile ? <PackageCheck size={16} /> : undefined}
    >
      {isMobile ? <PackageCheck size={18} /> : 'Mis compras'}
    </Button>
  </Stack>
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
                <PublicacionCard
                  publicacion={pub}
                  onComprar={handleComprar}
                  yaTieneSolicitud={yaTieneSolicitud(pub.id)}
                />
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