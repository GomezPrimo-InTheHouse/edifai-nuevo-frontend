
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Box, Typography, useTheme, CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Compra } from '../types/compra.types';
import { ComprasCards } from './ComprasCards';

interface ComprasTableProps {
  compras: Compra[];
  isLoading: boolean;
  isMobile: boolean;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export function ComprasTable({ compras, isLoading, isMobile }: ComprasTableProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>;
  }

  if (compras.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
        <Typography color="text.secondary">{t('compras.empty.desc')}</Typography>
      </Paper>
    );
  }

  if (isMobile) {
    return <ComprasCards compras={compras} />;
  }

  return (
    <Paper sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
      <Table>
        <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
          <TableRow>
            <TableCell>{t('compras.tabla.fecha')}</TableCell>
            <TableCell>{t('compras.tabla.obra')}</TableCell>
            <TableCell>{t('compras.tabla.descripcion')}</TableCell>
            <TableCell>{t('compras.tabla.especialidad')}</TableCell>
            <TableCell>{t('compras.tabla.material')}</TableCell>
            <TableCell align="right">{t('compras.tabla.monto')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {compras.map((compra) => (
            <TableRow
              key={compra.id}
              hover
              onClick={() => navigate(`/compras/${compra.id}`)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{new Date(compra.fecha).toLocaleDateString('es-AR')}</TableCell>
              <TableCell>{compra.obra_nombre}</TableCell>
              <TableCell>{compra.descripcion}</TableCell>
              <TableCell>{compra.especialidad_nombre}</TableCell>
              <TableCell>{compra.material_nombre ?? '—'}</TableCell>
              <TableCell align="right">{formatMoney(compra.monto)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}