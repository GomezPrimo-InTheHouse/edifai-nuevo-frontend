import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button,
  Box, Typography, TextField, MenuItem, CircularProgress, Table, TableHead,
  TableBody, TableRow, TableCell, Paper, Switch, FormControlLabel, useTheme, useMediaQuery,
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

function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

function recalcularMonto(row: ItemRevisionRow): ItemRevisionRow {
  if (row.es_compra_material && row.cantidad && row.precio_unitario) {
    return { ...row, monto: +(row.cantidad * row.precio_unitario).toFixed(2) };
  }
  return row;
}

let tempIdCounter = 0;

// ── Toggle material/gasto con texto explicativo ──
function ToggleMaterial({ row, onChange }: { row: ItemRevisionRow; onChange: (updated: ItemRevisionRow) => void }) {
  const { t } = useTranslation();
  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={row.es_compra_material}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? { ...row, es_compra_material: true }
                  : { ...row, es_compra_material: false, material_id: null, cantidad: null, precio_unitario: null }
              )
            }
          />
        }
        label={
          <Typography variant="caption" fontWeight={600}>
            {t('compras.multi_item.es_material')}
          </Typography>
        }
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4.5, mt: -0.5 }}>
        {row.es_compra_material
          ? t('compras.multi_item.ayuda_material')
          : t('compras.multi_item.ayuda_gasto')}
      </Typography>
    </Box>
  );
}

// ── Selects compartidos (obra/sector/especialidad/material) — usado en card mobile ──
function SelectsItem({
  row,
  onChange,
}: {
  row: ItemRevisionRow;
  onChange: (updated: ItemRevisionRow) => void;
}) {
  const { t } = useTranslation();
  const { data: obras = [] } = useObrasList();
  const { data: sectores = [] } = useSectoresPorObra(row.obra_id ?? 0);
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: materiales = [] } = useMaterialesList();
  const arbolSectores = flattenSectorTree(sectores);

  return (
    <>
      <TextField
        select fullWidth size="small" label={t('compras.form.obra')}
        value={row.obra_id ?? ''}
        onChange={(e) => onChange({ ...row, obra_id: Number(e.target.value), sector_id: null })}
      >
        {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
      </TextField>

      <TextField
        select fullWidth size="small" label={t('compras.form.sector')}
        value={row.sector_id ?? ''}
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

      <TextField
        select fullWidth size="small" label={t('compras.form.especialidad')}
        value={row.especialidad_id ?? ''}
        onChange={(e) => onChange({ ...row, especialidad_id: e.target.value ? Number(e.target.value) : null })}
      >
        <MenuItem value="">—</MenuItem>
        {especialidades.map((esp) => <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>)}
      </TextField>

      <ToggleMaterial row={row} onChange={onChange} />

      {row.es_compra_material && (
        <>
          <TextField
            select fullWidth size="small" label={t('compras.form.material')}
            value={row.material_id ?? ''}
            onChange={(e) => onChange({ ...row, material_id: e.target.value ? Number(e.target.value) : null })}
          >
            <MenuItem value="">—</MenuItem>
            {materiales.map((m) => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small" fullWidth type="number" label={t('compras.form.cantidad')}
              value={row.cantidad ?? ''}
              onChange={(e) => onChange(recalcularMonto({ ...row, cantidad: e.target.value ? Number(e.target.value) : null }))}
            />
            <TextField
              size="small" fullWidth type="number" label={t('compras.form.precio_unitario')}
              value={row.precio_unitario ?? ''}
              onChange={(e) => onChange(recalcularMonto({ ...row, precio_unitario: e.target.value ? Number(e.target.value) : null }))}
            />
          </Box>
        </>
      )}
    </>
  );
}

// ── Fila desktop (tabla) ──
function FilaItemDesktop({
  row, onChange, onRemove,
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
    <TableRow sx={{ verticalAlign: 'top' }}>
      <TableCell sx={{ minWidth: 180 }}>
        <TextField fullWidth size="small" label={t('compras.tabla.descripcion')} value={row.descripcion} onChange={(e) => onChange({ ...row, descripcion: e.target.value })} />
      </TableCell>
      <TableCell sx={{ minWidth: 150 }}>
        <TextField
          fullWidth size="small" type="number"
          label={t(row.es_compra_material ? 'compras.form.total_calculado' : 'compras.tabla.monto')}
          value={row.monto}
          disabled={row.es_compra_material}
          onChange={(e) => onChange({ ...row, monto: Number(e.target.value) })}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 160 }}>
        <TextField select fullWidth size="small" label={t('compras.form.obra')} value={row.obra_id ?? ''}
          onChange={(e) => onChange({ ...row, obra_id: Number(e.target.value), sector_id: null })}>
          {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
        </TextField>
      </TableCell>
      <TableCell sx={{ minWidth: 160 }}>
        <TextField select fullWidth size="small" label={t('compras.form.sector')} value={row.sector_id ?? ''}
          disabled={!row.obra_id || sectores.length === 0}
          onChange={(e) => onChange({ ...row, sector_id: e.target.value ? Number(e.target.value) : null })}>
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
        <TextField select fullWidth size="small" label={t('compras.form.especialidad')} value={row.especialidad_id ?? ''}
          onChange={(e) => onChange({ ...row, especialidad_id: e.target.value ? Number(e.target.value) : null })}>
          <MenuItem value="">—</MenuItem>
          {especialidades.map((esp) => <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>)}
        </TextField>
      </TableCell>
      <TableCell sx={{ minWidth: 260 }}>
        <ToggleMaterial row={row} onChange={onChange} />
        {row.es_compra_material && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
            <TextField select fullWidth size="small" label={t('compras.form.material')} value={row.material_id ?? ''}
              onChange={(e) => onChange({ ...row, material_id: e.target.value ? Number(e.target.value) : null })}>
              <MenuItem value="">—</MenuItem>
              {materiales.map((m) => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <TextField size="small" fullWidth type="number" label={t('compras.form.cantidad')}
                value={row.cantidad ?? ''}
                onChange={(e) => onChange(recalcularMonto({ ...row, cantidad: e.target.value ? Number(e.target.value) : null }))} />
              <TextField size="small" fullWidth type="number" label={t('compras.form.precio_unitario')}
                value={row.precio_unitario ?? ''}
                onChange={(e) => onChange(recalcularMonto({ ...row, precio_unitario: e.target.value ? Number(e.target.value) : null }))} />
            </Box>
          </Box>
        )}
      </TableCell>
      <TableCell>
        <IconButton size="small" onClick={onRemove}><Delete fontSize="small" /></IconButton>
      </TableCell>
    </TableRow>
  );
}

// ── Card mobile ──
function FilaItemCard({
  row, onChange, onRemove,
}: {
  row: ItemRevisionRow;
  onChange: (updated: ItemRevisionRow) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Paper sx={{
      p: 2, borderRadius: 3, boxShadow: 'none',
      border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <TextField
          fullWidth size="small" label={t('compras.tabla.descripcion')} value={row.descripcion}
          onChange={(e) => onChange({ ...row, descripcion: e.target.value })}
          sx={{ mr: 1 }}
        />
        <IconButton size="small" onClick={onRemove} sx={{ flexShrink: 0 }}>
          <Delete fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <SelectsItem row={row} onChange={onChange} />
      </Box>

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}`, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {t('compras.tabla.monto')}
        </Typography>
        <Typography variant="body1" fontWeight={800} color="text.primary">
          {formatMoney(row.monto)}
        </Typography>
      </Box>
    </Paper>
  );
}

export function ComprobanteMultiItemDialog({ open, onClose }: ComprobanteMultiItemDialogProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: materiales = [] } = useMaterialesList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: obras = [] } = useObrasList();

  const uploadComprobante = useUploadComprobante();
  const analizarMultiItem = useAnalizarComprobanteMultiItemConIA();
  const createBulk = useCreateComprasBulk();

  const [comprobanteUrl, setComprobanteUrl] = React.useState<string | null>(null);
  const [proveedor, setProveedor] = React.useState('');
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

      setProveedor(resultado.proveedor ?? '');

      setRows(
        resultado.items.map((item) => {
          const precioUnitario = item.precio_unitario ?? (item.cantidad ? +(item.monto / item.cantidad).toFixed(2) : null);
          return {
            ...item,
            precio_unitario: precioUnitario,
            tempId: `item-${tempIdCounter++}`,
            obra_id: obraUnica,
            sector_id: null,
            es_compra_material: Boolean(item.material_id),
          };
        })
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
        proveedor: proveedor || undefined,
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
    setProveedor('');
    setRows([]);
    onClose();
  };

  const filasIncompletas = rows.some((r) => !r.obra_id || !r.especialidad_id);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={isMobile ? 'sm' : 'xl'} fullWidth fullScreen={isMobile}>
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
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, mt: 3, py: 5, px: 3,
            borderRadius: 3, bgcolor: theme.palette.action.hover,
            border: `1px dashed ${theme.palette.divider}`,
          }}>
            <CircularProgress size={40} thickness={4} sx={{ color: '#F59E0B' }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>
                {t('compras.multi_item.analizando')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('compras.multi_item.analizando_sub')}
              </Typography>
            </Box>
          </Box>
        )}

        {rows.length > 0 && (
          <>
            <TextField
              fullWidth size="small" label={t('compras.form.proveedor')}
              value={proveedor} onChange={(e) => setProveedor(e.target.value)}
              placeholder={t('compras.multi_item.proveedor_placeholder')}
              sx={{ mt: 2, mb: 2, maxWidth: 360 }}
            />

            {isMobile ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {rows.map((row) => (
                  <FilaItemCard
                    key={row.tempId}
                    row={row}
                    onChange={(updated) => handleRowChange(row.tempId, updated)}
                    onRemove={() => handleRowRemove(row.tempId)}
                  />
                ))}
              </Box>
            ) : (
              <Table>
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
                    <FilaItemDesktop
                      key={row.tempId}
                      row={row}
                      onChange={(updated) => handleRowChange(row.tempId, updated)}
                      onRemove={() => handleRowRemove(row.tempId)}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </>
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