// import React, { useState } from 'react';
// import {
//   Box, Button, Dialog, DialogContent, DialogTitle, Divider,
//   FormControlLabel, IconButton, MenuItem, Stack, Switch,
//   TextField, ToggleButton, ToggleButtonGroup, Typography,
// } from '@mui/material';
// import { X } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
// import { useCreateLaborPresupuesto, useCreateProveedorExterno, useProveedoresExternos } from '../hooks/useLaborPresupuestos';
// import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
// import { useNotify } from '../../../shared/hooks/useNotify';
// import type { CreateLaborPresupuestoPayload, LaborPresupuestoCalidad } from '../types/labor.types';

// interface Props {
//   open: boolean;
//   labor_id: number;
//   onClose: () => void;
// }

// type TipoProveedor = 'trabajador' | 'externo';

// const initialForm = {
//   precio: '',
//   plazo_dias: '',
//   calidad: '' as LaborPresupuestoCalidad | '',
//   garantia: '',
//   notas: '',
//   notificar_trabajador: false,
// };

// export const AgregarPresupuestoModal: React.FC<Props> = ({ open, labor_id, onClose }) => {
//   const { t } = useTranslation();
//   const notify = useNotify();

//   const [tipoProveedor, setTipoProveedor] = useState<TipoProveedor>('trabajador');
//   const [trabajadorId, setTrabajadorId] = useState<number | ''>('');
//   const [proveedorId, setProveedorId] = useState<number | ''>('');
//   const [nuevoProveedorNombre, setNuevoProveedorNombre] = useState('');
//   const [creandoProveedor, setCreandoProveedor] = useState(false);
//   const [form, setForm] = useState(initialForm);

//   const { data: trabajadores = [] } = useTrabajadoresList();
//   const { data: proveedores = [] } = useProveedoresExternos();
//   const createPresupuesto = useCreateLaborPresupuesto(labor_id);
//   const createProveedor = useCreateProveedorExterno();

//   const jefes = trabajadores.filter((tr) => tr.jefe_id === null);

//   const handleClose = () => {
//     setForm(initialForm);
//     setTrabajadorId('');
//     setProveedorId('');
//     setNuevoProveedorNombre('');
//     setCreandoProveedor(false);
//     setTipoProveedor('trabajador');
//     onClose();
//   };

//   const handleCrearProveedor = async () => {
//     if (!nuevoProveedorNombre.trim()) return;
//     try {
//       const nuevo = await createProveedor.mutateAsync({ nombre: nuevoProveedorNombre.trim() });
//       setProveedorId(nuevo.id);
//       setNuevoProveedorNombre('');
//       setCreandoProveedor(false);
//       notify.success(t('labor_presupuestos.proveedor_creado'));
//     } catch {
//       notify.error(t('labor_presupuestos.proveedor_error'));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!form.precio) {
//       notify.error(t('labor_presupuestos.precio_requerido'));
//       return;
//     }
//     if (tipoProveedor === 'trabajador' && !trabajadorId) {
//       notify.error(t('labor_presupuestos.trabajador_requerido'));
//       return;
//     }
//     if (tipoProveedor === 'externo' && !proveedorId) {
//       notify.error(t('labor_presupuestos.proveedor_requerido'));
//       return;
//     }

//     const payload: CreateLaborPresupuestoPayload = {
//       precio_unitario: Number(form.precio),
//       plazo_dias: form.plazo_dias ? Number(form.plazo_dias) : null,
//       calidad: form.calidad || null,
//       garantia: form.garantia || null,
//       notas: form.notas || null,
//       notificar_trabajador: form.notificar_trabajador,
//       trabajador_id: tipoProveedor === 'trabajador' ? Number(trabajadorId) : null,
//       proveedor_externo_id: tipoProveedor === 'externo' ? Number(proveedorId) : null,
//     };

//     try {
//       await createPresupuesto.mutateAsync(payload);
//       notify.success(t('labor_presupuestos.agregado_ok'));
//       handleClose();
//     } catch {
//       notify.error(t('labor_presupuestos.agregado_error'));
//     }
//   };

//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//       <DialogTitle>
//         <Stack direction="row" alignItems="center" justifyContent="space-between">
//           <Typography variant="h6" fontWeight={700}>{t('labor_presupuestos.modal_titulo')}</Typography>
//           <IconButton size="small" onClick={handleClose}><X size={18} /></IconButton>
//         </Stack>
//       </DialogTitle>
//       <Divider />
//       <DialogContent>
//         <Stack spacing={2.5} sx={{ pt: 1 }}>

//           {/* Tipo de proveedor */}
//           <Box>
//             <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
//               {t('labor_presupuestos.tipo_proveedor')}
//             </Typography>
//             <ToggleButtonGroup
//               exclusive fullWidth
//               value={tipoProveedor}
//               onChange={(_, val) => { if (val) setTipoProveedor(val); }}
//             >
//               <ToggleButton value="trabajador" sx={{ py: 1 }}>
//                 {t('labor_presupuestos.tipo_trabajador')}
//               </ToggleButton>
//               <ToggleButton value="externo" sx={{ py: 1 }}>
//                 {t('labor_presupuestos.tipo_externo')}
//               </ToggleButton>
//             </ToggleButtonGroup>
//           </Box>

//           {/* Selector trabajador */}
//           {tipoProveedor === 'trabajador' && (
//             <TextField
//               select fullWidth
//               label={t('labor_presupuestos.trabajador')}
//               value={trabajadorId}
//               onChange={(e) => setTrabajadorId(e.target.value === '' ? '' : Number(e.target.value))}
//             >
//               <MenuItem value="">{t('labor_presupuestos.seleccionar')}</MenuItem>
//               {jefes.map((tr) => (
//                 <MenuItem key={tr.id} value={tr.id}>
//                   {tr.nombre} {tr.apellido}
//                 </MenuItem>
//               ))}
//             </TextField>
//           )}

//           {/* Selector proveedor externo */}
//           {tipoProveedor === 'externo' && (
//             <Box>
//               {!creandoProveedor ? (
//                 <Stack spacing={1}>
//                   <TextField
//                     select fullWidth
//                     label={t('labor_presupuestos.proveedor_externo')}
//                     value={proveedorId}
//                     onChange={(e) => setProveedorId(e.target.value === '' ? '' : Number(e.target.value))}
//                   >
//                     <MenuItem value="">{t('labor_presupuestos.seleccionar')}</MenuItem>
//                     {proveedores.map((p) => (
//                       <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
//                     ))}
//                   </TextField>
//                   <Button size="small" onClick={() => setCreandoProveedor(true)}>
//                     + {t('labor_presupuestos.nuevo_proveedor')}
//                   </Button>
//                 </Stack>
//               ) : (
//                 <Stack direction="row" spacing={1}>
//                   <TextField
//                     fullWidth size="small"
//                     label={t('labor_presupuestos.nombre_proveedor')}
//                     value={nuevoProveedorNombre}
//                     onChange={(e) => setNuevoProveedorNombre(e.target.value)}
//                   />
//                   <Button variant="contained" size="small" onClick={handleCrearProveedor} disabled={createProveedor.isPending}>
//                     {t('labor_presupuestos.guardar')}
//                   </Button>
//                   <Button size="small" onClick={() => setCreandoProveedor(false)}>
//                     {t('labor_presupuestos.cancelar')}
//                   </Button>
//                 </Stack>
//               )}
//             </Box>
//           )}

//           <Divider />

//           {/* Precio */}
//           <TextField
//             fullWidth type="number" label={t('labor_presupuestos.precio')}
//             value={form.precio}
//             onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
//             inputProps={{ min: 0 }}
//           />

//           {/* Plazo */}
//           <TextField
//             fullWidth type="number" label={t('labor_presupuestos.plazo_dias')}
//             value={form.plazo_dias}
//             onChange={(e) => setForm((f) => ({ ...f, plazo_dias: e.target.value }))}
//             inputProps={{ min: 0 }}
//           />

//           {/* Calidad */}
//           <TextField
//             select fullWidth label={t('labor_presupuestos.calidad')}
//             value={form.calidad}
//             onChange={(e) => setForm((f) => ({ ...f, calidad: e.target.value as LaborPresupuestoCalidad | '' }))}
//           >
//             <MenuItem value="">{t('labor_presupuestos.seleccionar')}</MenuItem>
//             <MenuItem value="alta">{t('labor_presupuestos.calidad_alta')}</MenuItem>
//             <MenuItem value="media">{t('labor_presupuestos.calidad_media')}</MenuItem>
//             <MenuItem value="baja">{t('labor_presupuestos.calidad_baja')}</MenuItem>
//           </TextField>

//           {/* Garantía */}
//           <TextField
//             fullWidth label={t('labor_presupuestos.garantia')}
//             value={form.garantia}
//             onChange={(e) => setForm((f) => ({ ...f, garantia: e.target.value }))}
//           />

//           {/* Notas */}
//           <TextField
//             fullWidth multiline minRows={2} label={t('labor_presupuestos.notas')}
//             value={form.notas}
//             onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
//           />

//           {/* Notificar si no es seleccionado — solo trabajadores registrados */}
//           {tipoProveedor === 'trabajador' && (
//             <FormControlLabel
//               control={
//                 <Switch
//                   checked={form.notificar_trabajador}
//                   onChange={(e) => setForm((f) => ({ ...f, notificar_trabajador: e.target.checked }))}
//                 />
//               }
//               label={
//                 <Box>
//                   <Typography variant="body2" fontWeight={600}>{t('labor_presupuestos.notificar_label')}</Typography>
//                   <Typography variant="caption" color="text.secondary">{t('labor_presupuestos.notificar_desc')}</Typography>
//                 </Box>
//               }
//             />
//           )}

//           <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ pt: 1 }}>
//             <Button variant="outlined" onClick={handleClose}>{t('labor_presupuestos.cancelar')}</Button>
//             <Button variant="contained" onClick={handleSubmit} disabled={createPresupuesto.isPending}>
//               {createPresupuesto.isPending ? t('labor_presupuestos.guardando') : t('labor_presupuestos.guardar')}
//             </Button>
//           </Stack>
//         </Stack>
//       </DialogContent>
//     </Dialog>
//   );
// };

import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle, Divider,
  FormControlLabel, IconButton, MenuItem, Stack, Switch,
  TextField, ToggleButton, ToggleButtonGroup, Typography, useTheme,
} from '@mui/material';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useCreateLaborPresupuesto,
  useCreateProveedorExterno,
  useProveedoresExternos,
  useUnidadesMedida,
} from '../hooks/useLaborPresupuestos';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { CreateLaborPresupuestoPayload, LaborPresupuestoCalidad, Labor } from '../types/labor.types';

interface Props {
  open: boolean;
  labor_id: number;
  labor?: Labor | null;
  onClose: () => void;
}

type TipoProveedor = 'trabajador' | 'externo';

const initialForm = {
  precio_unitario: '',
  cantidad: '',
  plazo_dias: '',
  calidad: '' as LaborPresupuestoCalidad | '',
  garantia: '',
  notas: '',
  notificar_trabajador: false,
};

export const AgregarPresupuestoModal: React.FC<Props> = ({ open, labor_id, labor, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const notify = useNotify();

  const [tipoProveedor, setTipoProveedor] = useState<TipoProveedor>('trabajador');
  const [trabajadorId, setTrabajadorId] = useState<number | ''>('');
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [nuevoProveedorNombre, setNuevoProveedorNombre] = useState('');
  const [creandoProveedor, setCreandoProveedor] = useState(false);
  const [form, setForm] = useState(initialForm);

  const { data: trabajadores = [] } = useTrabajadoresList();
  const { data: proveedores = [] } = useProveedoresExternos();
  const { data: unidades = [] } = useUnidadesMedida();
  const createPresupuesto = useCreateLaborPresupuesto(labor_id);
  const createProveedor = useCreateProveedorExterno();

  const jefes = trabajadores.filter((tr) => tr.jefe_id === null);

  // Calcular precio_total en tiempo real
  const precioUnitario = Number(form.precio_unitario) || 0;
  const cantidadForm = Number(form.cantidad) || 0;
  const cantidadLabor = Number(labor?.cantidad) || 0;
  const cantidadUsada = cantidadForm || cantidadLabor;
  const precioTotal = cantidadUsada > 0 ? precioUnitario * cantidadUsada : precioUnitario;

  // Unidad de la labor
  const unidadLabor = unidades.find((u) => u.id === labor?.unidad_id);

  const handleClose = () => {
    setForm(initialForm);
    setTrabajadorId('');
    setProveedorId('');
    setNuevoProveedorNombre('');
    setCreandoProveedor(false);
    setTipoProveedor('trabajador');
    onClose();
  };

  const handleCrearProveedor = async () => {
    if (!nuevoProveedorNombre.trim()) return;
    try {
      const nuevo = await createProveedor.mutateAsync({ nombre: nuevoProveedorNombre.trim() });
      setProveedorId(nuevo.id);
      setNuevoProveedorNombre('');
      setCreandoProveedor(false);
      notify.success(t('labor_presupuestos.proveedor_creado'));
    } catch {
      notify.error(t('labor_presupuestos.proveedor_error'));
    }
  };

  const handleSubmit = async () => {
    if (!form.precio_unitario) {
      notify.error(t('labor_presupuestos.precio_requerido'));
      return;
    }
    if (tipoProveedor === 'trabajador' && !trabajadorId) {
      notify.error(t('labor_presupuestos.trabajador_requerido'));
      return;
    }
    if (tipoProveedor === 'externo' && !proveedorId) {
      notify.error(t('labor_presupuestos.proveedor_requerido'));
      return;
    }

    const payload: CreateLaborPresupuestoPayload = {
      precio_unitario: Number(form.precio_unitario),
      cantidad: form.cantidad ? Number(form.cantidad) : null,
      plazo_dias: form.plazo_dias ? Number(form.plazo_dias) : null,
      calidad: form.calidad || null,
      garantia: form.garantia || null,
      notas: form.notas || null,
      notificar_trabajador: form.notificar_trabajador,
      trabajador_id: tipoProveedor === 'trabajador' ? Number(trabajadorId) : null,
      proveedor_externo_id: tipoProveedor === 'externo' ? Number(proveedorId) : null,
    };

    try {
      await createPresupuesto.mutateAsync(payload);
      notify.success(t('labor_presupuestos.agregado_ok'));
      handleClose();
    } catch {
      notify.error(t('labor_presupuestos.agregado_error'));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>{t('labor_presupuestos.modal_titulo')}</Typography>
          <IconButton size="small" onClick={handleClose}><X size={18} /></IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>

          {/* Referencia de la labor */}
          {(labor?.cantidad || labor?.unidad_id) && (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {t('labor_presupuestos.referencia_labor')}
              </Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {labor.cantidad && unidadLabor
                  ? `${labor.cantidad} ${unidadLabor.simbolo}`
                  : labor.cantidad
                  ? labor.cantidad
                  : unidadLabor?.simbolo ?? '-'}
              </Typography>
            </Box>
          )}

          {/* Tipo de proveedor */}
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
              {t('labor_presupuestos.tipo_proveedor')}
            </Typography>
            <ToggleButtonGroup
              exclusive fullWidth
              value={tipoProveedor}
              onChange={(_, val) => { if (val) setTipoProveedor(val); }}
            >
              <ToggleButton value="trabajador" sx={{ py: 1 }}>
                {t('labor_presupuestos.tipo_trabajador')}
              </ToggleButton>
              <ToggleButton value="externo" sx={{ py: 1 }}>
                {t('labor_presupuestos.tipo_externo')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Selector trabajador */}
          {tipoProveedor === 'trabajador' && (
            <TextField
              select fullWidth
              label={t('labor_presupuestos.trabajador')}
              value={trabajadorId}
              onChange={(e) => setTrabajadorId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">{t('labor_presupuestos.seleccionar')}</MenuItem>
              {jefes.map((tr) => (
                <MenuItem key={tr.id} value={tr.id}>
                  {tr.nombre} {tr.apellido}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Selector proveedor externo */}
          {tipoProveedor === 'externo' && (
            <Box>
              {!creandoProveedor ? (
                <Stack spacing={1}>
                  <TextField
                    select fullWidth
                    label={t('labor_presupuestos.proveedor_externo')}
                    value={proveedorId}
                    onChange={(e) => setProveedorId(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <MenuItem value="">{t('labor_presupuestos.seleccionar')}</MenuItem>
                    {proveedores.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                    ))}
                  </TextField>
                  <Button size="small" onClick={() => setCreandoProveedor(true)}>
                    + {t('labor_presupuestos.nuevo_proveedor')}
                  </Button>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth size="small"
                    label={t('labor_presupuestos.nombre_proveedor')}
                    value={nuevoProveedorNombre}
                    onChange={(e) => setNuevoProveedorNombre(e.target.value)}
                  />
                  <Button variant="contained" size="small" onClick={handleCrearProveedor} disabled={createProveedor.isPending}>
                    {t('labor_presupuestos.guardar')}
                  </Button>
                  <Button size="small" onClick={() => setCreandoProveedor(false)}>
                    {t('labor_presupuestos.cancelar')}
                  </Button>
                </Stack>
              )}
            </Box>
          )}

          <Divider />

          {/* Precio unitario */}
          <TextField
            fullWidth type="number"
            label={t('labor_presupuestos.precio_unitario')}
            value={form.precio_unitario}
            onChange={(e) => setForm((f) => ({ ...f, precio_unitario: e.target.value }))}
            inputProps={{ min: 0 }}
          />

          {/* Cantidad — con referencia de la labor */}
          <TextField
            fullWidth type="number"
            label={`${t('labor_presupuestos.cantidad_presupuesto')}${unidadLabor ? ` (${unidadLabor.simbolo})` : ''}`}
            value={form.cantidad}
            onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
            inputProps={{ min: 0, step: 0.01 }}
            helperText={cantidadLabor > 0 && !form.cantidad
              ? t('labor_presupuestos.cantidad_heredada', { cantidad: cantidadLabor })
              : ''}
          />

          {/* Precio total calculado */}
          {precioUnitario > 0 && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {t('labor_presupuestos.precio_total_calculado')}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="text.primary">
                  ${precioTotal.toLocaleString('es-AR')}
                </Typography>
              </Stack>
              {cantidadUsada > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {precioUnitario.toLocaleString('es-AR')} × {cantidadUsada} {unidadLabor?.simbolo ?? ''}
                </Typography>
              )}
            </Box>
          )}

          {/* Plazo */}
          <TextField
            fullWidth type="number"
            label={t('labor_presupuestos.plazo_dias')}
            value={form.plazo_dias}
            onChange={(e) => setForm((f) => ({ ...f, plazo_dias: e.target.value }))}
            inputProps={{ min: 0 }}
          />

          {/* Calidad */}
          <TextField
            select fullWidth label={t('labor_presupuestos.calidad')}
            value={form.calidad}
            onChange={(e) => setForm((f) => ({ ...f, calidad: e.target.value as LaborPresupuestoCalidad | '' }))}
          >
            <MenuItem value="">{t('labor_presupuestos.seleccionar')}</MenuItem>
            <MenuItem value="alta">{t('labor_presupuestos.calidad_alta')}</MenuItem>
            <MenuItem value="media">{t('labor_presupuestos.calidad_media')}</MenuItem>
            <MenuItem value="baja">{t('labor_presupuestos.calidad_baja')}</MenuItem>
          </TextField>

          {/* Garantía */}
          <TextField
            fullWidth label={t('labor_presupuestos.garantia')}
            value={form.garantia}
            onChange={(e) => setForm((f) => ({ ...f, garantia: e.target.value }))}
          />

          {/* Notas */}
          <TextField
            fullWidth multiline minRows={2}
            label={t('labor_presupuestos.notas')}
            value={form.notas}
            onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
          />

          {/* Notificar — solo trabajadores registrados */}
          {tipoProveedor === 'trabajador' && (
            <FormControlLabel
              control={
                <Switch
                  checked={form.notificar_trabajador}
                  onChange={(e) => setForm((f) => ({ ...f, notificar_trabajador: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>{t('labor_presupuestos.notificar_label')}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('labor_presupuestos.notificar_desc')}</Typography>
                </Box>
              }
            />
          )}

          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ pt: 1 }}>
            <Button variant="outlined" onClick={handleClose}>{t('labor_presupuestos.cancelar')}</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={createPresupuesto.isPending}>
              {createPresupuesto.isPending ? t('labor_presupuestos.guardando') : t('labor_presupuestos.guardar')}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};