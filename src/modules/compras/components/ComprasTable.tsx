import React from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Box, Typography, useTheme, CircularProgress, IconButton, Pagination, Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil } from 'lucide-react';
import type { Compra } from '../types/compra.types';
import { ComprasCards } from './ComprasCards';

interface ComprasTableProps {
  compras: Compra[];
  isLoading: boolean;
  isMobile: boolean;
  onView: (compra: Compra) => void;
  onEdit: (compra: Compra) => void;
}

const ITEMS_POR_PAGINA = 10;

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export function ComprasTable({ compras, isLoading, isMobile, onView, onEdit }: ComprasTableProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);

  const totalPaginas = Math.max(1, Math.ceil(compras.length / ITEMS_POR_PAGINA));
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * ITEMS_POR_PAGINA;
    return compras.slice(start, start + ITEMS_POR_PAGINA);
  }, [compras, page]);

  React.useEffect(() => {
    setPage(1);
  }, [compras.length]);

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
    return <ComprasCards compras={compras} onView={onView} onEdit={onEdit} />;
  }

  return (
    <>
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
              <TableCell align="right">{t('compras.tabla.acciones')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((compra) => (
              <TableRow key={compra.id} hover>
                <TableCell>{new Date(compra.fecha).toLocaleDateString('es-AR')}</TableCell>
                <TableCell>{compra.obra_nombre}</TableCell>
                <TableCell>{compra.descripcion}</TableCell>
                <TableCell>{compra.especialidad_nombre}</TableCell>
                <TableCell>{compra.material_nombre ?? '—'}</TableCell>
                <TableCell align="right">{formatMoney(compra.monto)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                    <IconButton size="small" onClick={() => onView(compra)}>
                      <Eye size={18} />
                    </IconButton>
                    <IconButton size="small" onClick={() => onEdit(compra)}>
                      <Pencil size={18} />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {totalPaginas > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Pagination
            count={totalPaginas}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}
    </>
  );
}