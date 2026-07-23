
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Add } from '@mui/icons-material';
import { useComprasList } from '../hooks/useCompras';
import { ComprasTable } from '../components/ComprasTable';

export function ComprasListPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: compras = [], isLoading } = useComprasList();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          {t('compras.title')}
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/compras/nueva')}>
          {t('compras.nueva')}
        </Button>
      </Box>

      <ComprasTable compras={compras} isLoading={isLoading} isMobile={isMobile} />
    </Box>
  );
}