// import React, { useState } from 'react';
// import {
//   Box, Button, Dialog, DialogContent, DialogTitle, Divider,
//   IconButton, InputAdornment, MenuItem, Stack, TextField,
//   Table, TableHead, TableRow, TableCell, TableBody, Typography, Paper,
// } from '@mui/material';
// import { Plus, Search, Trash2, X } from 'lucide-react';
// import { useMaterialesListAll } from '../../materiales/hooks/useMateriales';
// import { useAddMaterialToPresupuesto } from '../hooks/usePresupuestoMateriales';
// import { NuevoMaterialRapidoModal } from './NuevoMaterialRapidoModal';
// import { useNotify } from '../../../shared/hooks/useNotify';
// import { useQueryClient } from '@tanstack/react-query';

// interface MaterialRow { material_id: number; nombre: string; unidad: string; precio_unitario: number; cantidad: number; }
// interface Props { open: boolean; onClose: () => void; presupuestoId: number; }

// export const AgregarMaterialModal: React.FC<Props> = ({ open, onClose, presupuestoId }) => {
//   const notify = useNotify();
//   const queryClient = useQueryClient();
//   const [search, setSearch] = useState('');
//   const [materialId, setMaterialId] = useState<number | ''>('');
//   const [cantidad, setCantidad] = useState('');
//   const [lista, setLista] = useState<MaterialRow[]>([]);
//   const [nuevoMaterialOpen, setNuevoMaterialOpen] = useState(false);

//   const { data: materiales = [] } = useMaterialesListAll();
//   const addMutation = useAddMaterialToPresupuesto(presupuestoId);

//   const materialesFiltrados = materiales.filter((m) =>
//     m.nombre.toLowerCase().includes(search.toLowerCase())
//   );
//   const materialSeleccionado = materiales.find((m) => m.id === materialId);

//   // Agrega a la lista local
//   const handleAgregarALista = () => {
//     if (!materialId || !cantidad || !materialSeleccionado) return;
//     const existe = lista.find((r) => r.material_id === materialId);
//     if (existe) { notify.warning('Este material ya está en la lista.'); return; }
//     setLista((prev) => [...prev, {
//       material_id: Number(materialId),
//       nombre: materialSeleccionado.nombre,
//       unidad: materialSeleccionado.unidad,
//       precio_unitario: Number(materialSeleccionado.precio_unitario),
//       cantidad: Number(cantidad),
//     }]);
//     setMaterialId('');
//     setCantidad('');
//     setSearch('');
//   };

//   const handleQuitarDeLista = (material_id: number) => {
//     setLista((prev) => prev.filter((r) => r.material_id !== material_id));
//   };

//   // Guarda todos los materiales de la lista
//   const handleGuardar = async () => {
//     if (lista.length === 0) return;
//     try {
//       for (const item of lista) {
//         await addMutation.mutateAsync({ presupuesto_id: presupuestoId, material_id: item.material_id, cantidad: item.cantidad });
//       }
//       notify.success(`${lista.length} material(es) agregado(s) al presupuesto.`);
//       setLista([]);
//       onClose();
//     } catch {
//       notify.error('Error al agregar materiales.');
//     }
//   };

//   const subtotalLista = lista.reduce((acc, r) => acc + r.precio_unitario * r.cantidad, 0);

//   return (
//     <>
//       <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" disableEnforceFocus>
//         <DialogTitle>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Typography variant="h6" fontWeight={700}>Agregar materiales</Typography>
//             <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Stack spacing={2} sx={{ mt: 1 }}>
//             {/* Selector de material */}
//             <TextField
//               fullWidth size="small" placeholder="Buscar material..."
//               value={search} onChange={(e) => setSearch(e.target.value)}
//               InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
//             />
//             <Stack direction="row" spacing={2}>
//               <TextField
//                 select fullWidth label="Material"
//                 value={materialId}
//                 onChange={(e) => setMaterialId(e.target.value === '' ? '' : Number(e.target.value))}
//               >
//                 <MenuItem value="">Seleccionar</MenuItem>
//                 {materialesFiltrados.map((m) => (
//                   <MenuItem key={m.id} value={m.id}>
//                     {m.nombre} — Stock: {m.stock_actual} {m.unidad} — ${Number(m.precio_unitario).toLocaleString('es-AR')}
//                   </MenuItem>
//                 ))}
//               </TextField>
//               <TextField
//                 label="Cantidad" type="number"
//                 value={cantidad} onChange={(e) => setCantidad(e.target.value)}
//                 inputProps={{ min: 0.01, step: 0.01 }}
//                 sx={{ width: 140 }}
//               />
//               <Button variant="outlined" startIcon={<Plus size={16} />} onClick={handleAgregarALista} disabled={!materialId || !cantidad}>
//                 Añadir
//               </Button>
//             </Stack>

//             {/* Info material seleccionado */}
//             {materialSeleccionado && (
//               <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
//                 <Typography variant="caption" color="text.secondary">
//                   Precio: ${Number(materialSeleccionado.precio_unitario).toLocaleString('es-AR')} / {materialSeleccionado.unidad} — Stock: {materialSeleccionado.stock_actual}
//                   {cantidad && ` — Subtotal: $${(Number(materialSeleccionado.precio_unitario) * Number(cantidad)).toLocaleString('es-AR')}`}
//                 </Typography>
//               </Box>
//             )}

//             <Divider />

//             {/* Lista de materiales a agregar */}
//             {lista.length > 0 && (
//               <>
//                 <Typography variant="body2" fontWeight={700} sx={{ color: '#64748B' }}>MATERIALES A AGREGAR ({lista.length})</Typography>
//                 <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Material</TableCell>
//                         <TableCell>Cantidad</TableCell>
//                         <TableCell>Precio unit.</TableCell>
//                         <TableCell>Subtotal</TableCell>
//                         <TableCell />
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {lista.map((r) => (
//                         <TableRow key={r.material_id}>
//                           <TableCell><Typography fontWeight={600}>{r.nombre}</Typography></TableCell>
//                           <TableCell>{r.cantidad} {r.unidad}</TableCell>
//                           <TableCell>${r.precio_unitario.toLocaleString('es-AR')}</TableCell>
//                           <TableCell><Typography fontWeight={600}>${(r.precio_unitario * r.cantidad).toLocaleString('es-AR')}</Typography></TableCell>
//                           <TableCell>
//                             <IconButton size="small" color="error" onClick={() => handleQuitarDeLista(r.material_id)}>
//                               <Trash2 size={14} />
//                             </IconButton>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </Paper>
//                 <Stack direction="row" justifyContent="flex-end">
//                   <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0F172A', color: '#fff', minWidth: 180, textAlign: 'right' }}>
//                     <Typography variant="caption" sx={{ color: '#94A3B8' }}>SUBTOTAL LISTA</Typography>
//                     <Typography fontWeight={800}>${subtotalLista.toLocaleString('es-AR')}</Typography>
//                   </Box>
//                 </Stack>
//               </>
//             )}

//             <Divider />

//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Button size="small" startIcon={<Plus size={14} />} onClick={() => setNuevoMaterialOpen(true)} sx={{ color: '#64748B' }}>
//                 Crear nuevo material
//               </Button>
//               <Stack direction="row" spacing={1}>
//                 <Button variant="outlined" onClick={onClose}>Cancelar</Button>
//                 <Button variant="contained" onClick={handleGuardar} disabled={lista.length === 0 || addMutation.isPending}>
//                   {addMutation.isPending ? 'Guardando...' : `Guardar ${lista.length > 0 ? `(${lista.length})` : ''}`}
//                 </Button>
//               </Stack>
//             </Stack>
//           </Stack>
//         </DialogContent>
//       </Dialog>

//       <NuevoMaterialRapidoModal
//         open={nuevoMaterialOpen}
//         onClose={() => setNuevoMaterialOpen(false)}
//         onCreated={() => queryClient.invalidateQueries({ queryKey: ['materiales'] })}
//       />
//     </>
//   );
// };

import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle, Divider,
  IconButton, InputAdornment, MenuItem, Stack, TextField,
  Table, TableHead, TableRow, TableCell, TableBody, Typography, Paper,
  useTheme,
} from '@mui/material';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMaterialesListAll } from '../../materiales/hooks/useMateriales';
import { useAddMaterialToPresupuesto } from '../hooks/usePresupuestoMateriales';
import { NuevoMaterialRapidoModal } from './NuevoMaterialRapidoModal';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useQueryClient } from '@tanstack/react-query';

interface MaterialRow { material_id: number; nombre: string; unidad: string; precio_unitario: number; cantidad: number; }
interface Props { open: boolean; onClose: () => void; presupuestoId: number; }

export const AgregarMaterialModal: React.FC<Props> = ({ open, onClose, presupuestoId }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [materialId, setMaterialId] = useState<number | ''>('');
  const [cantidad, setCantidad] = useState('');
  const [lista, setLista] = useState<MaterialRow[]>([]);
  const [nuevoMaterialOpen, setNuevoMaterialOpen] = useState(false);

  const { data: materiales = [] } = useMaterialesListAll();
  const addMutation = useAddMaterialToPresupuesto(presupuestoId);

  const materialesFiltrados = materiales.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase())
  );
  const materialSeleccionado = materiales.find((m) => m.id === materialId);

  const handleAgregarALista = () => {
    if (!materialId || !cantidad || !materialSeleccionado) return;
    const existe = lista.find((r) => r.material_id === materialId);
    if (existe) { notify.warning(t('agregar_material.ya_en_lista')); return; }
    setLista((prev) => [...prev, {
      material_id: Number(materialId),
      nombre: materialSeleccionado.nombre,
      unidad: materialSeleccionado.unidad,
      precio_unitario: Number(materialSeleccionado.precio_unitario),
      cantidad: Number(cantidad),
    }]);
    setMaterialId('');
    setCantidad('');
    setSearch('');
  };

  const handleQuitarDeLista = (material_id: number) => {
    setLista((prev) => prev.filter((r) => r.material_id !== material_id));
  };

  const handleGuardar = async () => {
    if (lista.length === 0) return;
    try {
      for (const item of lista) {
        await addMutation.mutateAsync({ presupuesto_id: presupuestoId, material_id: item.material_id, cantidad: item.cantidad });
      }
      notify.success(t('agregar_material.success', { count: lista.length }));
      setLista([]);
      onClose();
    } catch {
      notify.error(t('agregar_material.error'));
    }
  };

  const subtotalLista = lista.reduce((acc, r) => acc + r.precio_unitario * r.cantidad, 0);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" disableEnforceFocus
        PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}
      >
        <DialogTitle sx={{ borderBottom: `0.5px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>{t('agregar_material.titulo')}</Typography>
            <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>

            <TextField
              fullWidth size="small" placeholder={t('agregar_material.buscar')}
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                select fullWidth label={t('agregar_material.material')}
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <MenuItem value="">{t('agregar_material.seleccionar')}</MenuItem>
                {materialesFiltrados.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.nombre} — {t('agregar_material.stock')}: {m.stock_actual} {m.unidad} — ${Number(m.precio_unitario).toLocaleString('es-AR')}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label={t('agregar_material.cantidad')} type="number"
                value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                inputProps={{ min: 0.01, step: 0.01 }}
                sx={{ width: 140 }}
              />
              <Button
                variant="outlined" startIcon={<Plus size={16} />}
                onClick={handleAgregarALista}
                disabled={!materialId || !cantidad}
              >
                {t('agregar_material.aniadir')}
              </Button>
            </Stack>

            {materialSeleccionado && (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                  {t('agregar_material.precio_label')}: ${Number(materialSeleccionado.precio_unitario).toLocaleString('es-AR')} / {materialSeleccionado.unidad} — {t('agregar_material.stock')}: {materialSeleccionado.stock_actual}
                  {cantidad && ` — ${t('agregar_material.subtotal_label')}: $${(Number(materialSeleccionado.precio_unitario) * Number(cantidad)).toLocaleString('es-AR')}`}
                </Typography>
              </Box>
            )}

            <Divider />

            {lista.length > 0 && (
              <>
                <Typography variant="body2" fontWeight={700} sx={{ color: 'text.secondary' }}>
                  {t('agregar_material.lista_titulo', { count: lista.length })}
                </Typography>
                <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableRow>
                        <TableCell>{t('agregar_material.tabla.material')}</TableCell>
                        <TableCell>{t('agregar_material.tabla.cantidad')}</TableCell>
                        <TableCell>{t('agregar_material.tabla.precio_unit')}</TableCell>
                        <TableCell>{t('agregar_material.tabla.subtotal')}</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lista.map((r) => (
                        <TableRow key={r.material_id}>
                          <TableCell><Typography fontWeight={600}>{r.nombre}</Typography></TableCell>
                          <TableCell>{r.cantidad} {r.unidad}</TableCell>
                          <TableCell>${r.precio_unitario.toLocaleString('es-AR')}</TableCell>
                          <TableCell><Typography fontWeight={600}>${(r.precio_unitario * r.cantidad).toLocaleString('es-AR')}</Typography></TableCell>
                          <TableCell>
                            <IconButton size="small" color="error" onClick={() => handleQuitarDeLista(r.material_id)}>
                              <Trash2 size={14} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
                <Stack direction="row" justifyContent="flex-end">
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0F172A', color: '#fff', minWidth: 180, textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {t('agregar_material.subtotal_lista')}
                    </Typography>
                    <Typography fontWeight={800}>${subtotalLista.toLocaleString('es-AR')}</Typography>
                  </Box>
                </Stack>
              </>
            )}

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                size="small" startIcon={<Plus size={14} />}
                onClick={() => setNuevoMaterialOpen(true)}
                sx={{ color: 'text.secondary' }}
              >
                {t('agregar_material.crear_nuevo')}
              </Button>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={onClose}>{t('agregar_material.cancelar')}</Button>
                <Button
                  variant="contained"
                  onClick={handleGuardar}
                  disabled={lista.length === 0 || addMutation.isPending}
                >
                  {addMutation.isPending
                    ? t('agregar_material.guardando')
                    : lista.length > 0
                      ? t('agregar_material.guardar_count', { count: lista.length })
                      : t('agregar_material.guardar')}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <NuevoMaterialRapidoModal
        open={nuevoMaterialOpen}
        onClose={() => setNuevoMaterialOpen(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['materiales'] })}
      />
    </>
  );
};