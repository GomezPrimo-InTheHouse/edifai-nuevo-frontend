import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button,
  Box, Typography, TextField, MenuItem, CircularProgress, Table, TableHead,
  TableBody, TableRow, TableCell, Chip, useTheme,
} from '@mui/material';
import { Close, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useObrasList } from '../../obras/hooks/useObras';
import { useSectoresPorObra } from '../../obras/hooks/useSectores';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { useMaterialesList } from '../../materiales/hooks/useMateriales';
import {
  useUploadComprobante,
  useAnalizarComprobanteMultiItemConIA,
  useCreateComprasBulk,
} from '../hooks/useCompras';
import { flattenSectorTree, nombreCompletoSector, type Sector } from '../../obras/types/sector.types';
import type { ItemRevisionRow } from '../types/compra.types';
import type { CreateCompraPayload } from '../types/compra.types';

interface ComprobanteMultiItemDialogProps {
  open: boolean;
  onClose: () => void;
}

function esHoja(sector: Sector, todos: Sector[]): boolean {
  return !todos.some((s) => s.parent_id === sector.id);
}

let tempIdCounter = 0;

function FilaItem({
  row,
  onChange,
  onRemove,
}: {
  row: ItemRevisionRow;
  onChange: (updated: ItemRevisionRow) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { data: obras = [] } = useObrasList();
  const { data: sectores = [] } = useSectoresPorObra(row.obra_id ?? 0);
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: materiales = [] } = useMaterialesList();

  const arbolSectores = flattenSectorTree(sectores);

  return (
    <TableRow>
      <TableCell sx={{ minWidth: 180 }}>
        <TextField
          fullWidth size="small" value={row.descripcion}
          onChange={(e) => onChange({ ...row, descripcion: e.target.value })}
        />
      </TableCell>

      <TableCell sx={{ minWidth: 130 }}>
        <TextField
          fullWidth size="small" type="number" value={row.monto}
          onChange={(e) => onChange({ ...row, monto: Number(e.target.value) })}
        />
      </TableCell>

      <TableCell sx={{ minWidth: 160 }}>
        <TextField
          select fullWidth size="small" value={row.obra_id ?? ''}
          onChange={(e) => onChange({ ...row, obra_id: Number(e.target.value), sector_id: null })}
        >
          {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
        </TextField>
      </TableCell>

      <TableCell sx={{ minWidth: 160 }}>
        <TextField
          select fullWidth size="small" value={row.sector_id ?? ''}
          disabled={!row.obra_id || sectores.length === 0}
          onChange={(e) => onChange({ ...row, sector_id: e.target.value ? Number(e.target.value) : null })}
        >
          <MenuItem value="">{t('compras.form.sin_sector')}</MenuItem>
          {arbolSectores.map(({ sector, depth }) => {
            const hoja = esHoja(sector, sectores);
            return (
              <MenuItem key={sector.id} value={sector.id} disabled={!hoja} sx={{ pl: 2 + depth * 2 }}>
                {nombreCompletoSector(sector)}
              </MenuItem>
            );
          })}
        </TextField>
      </TableCell>

      <TableCell sx={{ minWidth: 160 }}>
        <TextField
          select fullWidth size="small" value={row.especialidad_id ?? ''}
          onChange={(e) => onChange({ ...row, especialidad_id: e.target.value ? Number(e.target.value) : null })}
        >
          <MenuItem value="">—</MenuItem>
          {especialidades.map((esp) => <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>)}
        </TextField>
      </TableCell>

      <TableCell sx={{ minWidth: 180 }}>
        {row.es_compra_material ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <TextField
              select fullWidth size="small" value={row.material_id ?? ''}
              onChange={(e) => onChange({ ...row, material_id: e.target.value ? Number(e.target.value) : null })}
            >
              <MenuItem value="">—</MenuItem>
              {materiales.map((m) => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
            </TextField>
            <TextField
              size="small" type="number" placeholder={t('compras.form.cantidad')}
              value={row.cantidad ?? ''}
              onChange={(e) => onChange({ ...row, cantidad: e.target.value ? Number(e.target.value) : null })}
            />
          </Box>
        ) : (
          <Chip
            size="small" label={t('compras.multi_item.marcar_material')}
            onClick={() => onChange({ ...row, es_compra_material: true })}
            variant="outlined"
          />
        )}
        {row.es_compra_material && (
          <Chip
            size="small" label={t('compras.multi_item.es_gasto')}
            onClick={() => onChange({ ...row, es_compra_material: false, material_id: null, cantidad: null })}
            sx={{ mt: 0.5 }}
          />
        )}
      </TableCell>

      <TableCell>
        <IconButton size="small" onClick={onRemove}><Delete fontSize="small" /></IconButton>
      </TableCell>
    </TableRow>
  );
}

export function ComprobanteMultiItemDialog({ open, onClose }: ComprobanteMultiItemDialogProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const { data: materiales = [] } = useMaterialesList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: obras = [] } = useObrasList();

  const uploadComprobante = useUploadComprobante();
  const analizarMultiItem = useAnalizarComprobanteMultiItemConIA();
  const createBulk = useCreateComprasBulk();

  const [comprobanteUrl, setComprobanteUrl] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<ItemRevisionRow[]>([]);
  const [analizando, setAnalizando] = React.useState(false);

  const obraUnica = obras.length === 1 ? obras[0].id : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadComprobante.mutateAsync(file);
    setComprobanteUrl(url);

    setAnalizando(true);
    try {
      const resultado = await analizarMultiItem.mutateAsync({
        imageUrl: url,
        materiales: materiales.map((m) => ({ id: m.id, nombre: m.nombre, unidad: m.unidad })),
        especialidades: especialidades.map((esp) => ({ id: esp.id, nombre: esp.nombre })),
      });

      setRows(
        resultado.items.map((item) => ({
          ...item,
          tempId: `item-${tempIdCounter++}`,
          obra_id: obraUnica,
          sector_id: null,
          es_compra_material: Boolean(item.material_id),
        }))
      );
    } finally {
      setAnalizando(false);
    }
  };

  const handleRowChange = (tempId: string, updated: ItemRevisionRow) => {
    setRows((prev) => prev.map((r) => (r.tempId === tempId ? updated : r)));
  };

  const handleRowRemove = (tempId: string) => {
    setRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleGuardarTodas = async () => {
    const payloads: CreateCompraPayload[] = rows
      .filter((r) => r.obra_id && r.especialidad_id)
      .map((r) => ({
        obra_id: r.obra_id!,
        sector_id: r.sector_id,
        especialidad_id: r.especialidad_id!,
        descripcion: r.descripcion,
        proveedor: undefined,
        monto: r.monto,
        fecha: new Date().toISOString().slice(0, 10),
        comprobante_url: comprobanteUrl ?? undefined,
        material_id: r.es_compra_material ? r.material_id : null,
        cantidad: r.es_compra_material ? r.cantidad : null,
      }));

    await createBulk.mutateAsync(payloads);
    handleClose();
  };

  const handleClose = () => {
    setComprobanteUrl(null);
    setRows([]);
    onClose();
  };

  const filasIncompletas = rows.some((r) => !r.obra_id || !r.especialidad_id);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {t('compras.multi_item.title')}
        <IconButton onClick={handleClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!comprobanteUrl && (
          <Button variant="outlined" component="label" disabled={uploadComprobante.isPending}>
            {t('compras.form.subir_comprobante')}
            <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
          </Button>
        )}

        {analizando && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">{t('compras.multi_item.analizando')}</Typography>
          </Box>
        )}

        {rows.length > 0 && (
          <Table sx={{ mt: 2 }}>
            <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell>{t('compras.tabla.descripcion')}</TableCell>
                <TableCell>{t('compras.tabla.monto')}</TableCell>
                <TableCell>{t('compras.form.obra')}</TableCell>
                <TableCell>{t('compras.form.sector')}</TableCell>
                <TableCell>{t('compras.form.especialidad')}</TableCell>
                <TableCell>{t('compras.form.material')}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <FilaItem
                  key={row.tempId}
                  row={row}
                  onChange={(updated) => handleRowChange(row.tempId, updated)}
                  onRemove={() => handleRowRemove(row.tempId)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t('compras.acciones.cancelar')}</Button>
        <Button
          variant="contained"
          disabled={rows.length === 0 || filasIncompletas || createBulk.isPending}
          onClick={handleGuardarTodas}
        >
          {createBulk.isPending
            ? <CircularProgress size={18} sx={{ color: '#fff' }} />
            : t('compras.multi_item.guardar_todas', { count: rows.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}