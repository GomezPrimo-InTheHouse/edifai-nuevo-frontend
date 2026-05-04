import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/auth.store';

export const SinAccesoPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Redirigir al home correcto según rol
  const handleVolver = () => {
    const esWorker = user?.rol_id === 7 || user?.rol_id === 8;
    navigate(esWorker ? '/labores' : '/obras');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        gap: 2,
      }}
    >
      <ShieldOff size={48} color="#94A3B8" />
      <Typography variant="h5" fontWeight={700} color="#0F172A">
        Acceso restringido
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={320}>
        No tenés permisos para ver esta sección.
        Contactá al administrador si creés que es un error.
      </Typography>
      <Button
        variant="contained"
        onClick={handleVolver}
        sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 700, '&:hover': { bgcolor: '#D97706' } }}
      >
        Volver al inicio
      </Button>
    </Box>
  );
};