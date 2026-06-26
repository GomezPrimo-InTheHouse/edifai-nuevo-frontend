

// import React, { useState } from 'react';
// import {
//     Box, Button, Checkbox, CircularProgress, Dialog, DialogContent,
//     DialogTitle, Divider, IconButton, MenuItem, Stack, Tab, Tabs,
//     Table, TableBody, TableCell, TableHead, TableRow,
//     TextField, Typography, useTheme,
// } from '@mui/material';
// import { FileText, Upload, X, Sparkles, Pencil, Building2 } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
// import { useAnalizarDocumento, useCreateProveedorExterno, useProveedoresExternos } from '../hooks/useLaborPresupuestos';
// import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
// import { useObrasList } from '../../obras/hooks/useObras';
// import { laborApi } from '../../../services/api/labor.api';
// import { laborPresupuestosApi } from '../../../services/api/laborPresupuestos.api';
// import { useNotify } from '../../../shared/hooks/useNotify';
// import { useQueryClient } from '@tanstack/react-query';
// import { laboresQueryKeys } from '../hooks/useLabores';
// import type { LaborSugerencia } from '../types/labor.types';

// interface Props {
//     open: boolean;
//     onClose: () => void;
// }

// type TipoCotizante = 'trabajador' | 'externo_existente' | 'externo_nuevo';

// interface FilaCotizante {
//     tipo: TipoCotizante;
//     trabajador_id: number | '';
//     proveedor_id: number | '';
//     nuevo_nombre: string;
// }

// interface SugerenciaEditable extends LaborSugerencia {
//     descripcion_completa?: string | null;
//     _nombre_edit: string;
//     _unidad_edit: string;
//     _cantidad_edit: string;
//     _precio_unitario_edit: string;
//     _precio_total_edit: string;
// }

// type CotizanteGlobal = {
//     tipo: TipoCotizante;
//     trabajador_id: number | '';
//     proveedor_id: number | '';
//     nuevo_nombre: string;
// };

// const defaultCotizante = (): FilaCotizante => ({
//     tipo: 'externo_nuevo',
//     trabajador_id: '',
//     proveedor_id: '',
//     nuevo_nombre: '',
// });

// const UNIDADES = ['m²', 'm³', 'ml', 'kg', 'tn', 'un', 'gl', 'hr', 'lt', 'm'];

// type Fase = 'obra' | 'input' | 'revision';
// type TabInput = 0 | 1;

// export const AnalizarDocumentoModal: React.FC<Props> = ({ open, onClose }) => {
//     const theme = useTheme();
//     const { t } = useTranslation();
//     const notify = useNotify();
//     const queryClient = useQueryClient();

//     const [fase, setFase] = useState<Fase>('obra');
//     const [obraSeleccionadaId, setObraSeleccionadaId] = useState<number | ''>('');
//     const [tabInput, setTabInput] = useState<TabInput>(0);
//     const [archivo, setArchivo] = useState<File | null>(null);
//     const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//     const [textoLibre, setTextoLibre] = useState('');
//     const [sugerencias, setSugerencias] = useState<SugerenciaEditable[]>([]);
//     const [cotizantes, setCotizantes] = useState<FilaCotizante[]>([]);
//     const [cotizanteGlobal, setCotizanteGlobal] = useState<CotizanteGlobal | null>(null);
//     const [confirmando, setConfirmando] = useState(false);

//     const analizarMutation = useAnalizarDocumento();
//     const createProveedor = useCreateProveedorExterno();
//     const { data: trabajadores = [] } = useTrabajadoresList();
//     const { data: proveedores = [] } = useProveedoresExternos();
//     const { data: obras = [] } = useObrasList();
//     const jefes = trabajadores.filter((tr) => tr.jefe_id === null);

//     const obraSeleccionada = obras.find((o) => o.id === obraSeleccionadaId);

//     const handleClose = () => {
//         setFase('obra');
//         setObraSeleccionadaId('');
//         setTabInput(0);
//         setArchivo(null);
//         setPreviewUrl(null);
//         setTextoLibre('');
//         setSugerencias([]);
//         setCotizantes([]);
//         setCotizanteGlobal(null);
//         onClose();
//     };

//     const handleAnalizar = async () => {
//         try {
//             let resultado;
//             if (tabInput === 0 && archivo) {
//                 const base64 = await fileToBase64(archivo);
//                 resultado = await analizarMutation.mutateAsync({ imagen_base64: base64, media_type: archivo.type });
//             } else if (tabInput === 1 && textoLibre.trim()) {
//                 resultado = await analizarMutation.mutateAsync({ texto_libre: textoLibre });
//             } else {
//                 notify.error(t('analizar_doc.error_sin_input'));
//                 return;
//             }

//             setSugerencias(resultado.labores.map((l: any) => ({
//                 ...l,
//                 seleccionada: true,
//                 _nombre_edit: l.descripcion ?? '',
//                 _unidad_edit: l.unidad_simbolo ?? '',
//                 _cantidad_edit: l.cantidad != null ? String(l.cantidad) : '',
//                 _precio_unitario_edit: l.presupuesto?.precio_unitario != null ? String(l.presupuesto.precio_unitario) : '',
//                 _precio_total_edit: l.presupuesto?.precio_total != null ? String(l.presupuesto.precio_total) : '',
//             })));

//             if (resultado.cotizante_global) {
//                 setCotizanteGlobal({
//                     tipo: 'externo_nuevo',
//                     trabajador_id: '',
//                     proveedor_id: '',
//                     nuevo_nombre: resultado.cotizante_global,
//                 });
//                 setCotizantes(resultado.labores.map(() => defaultCotizante()));
//             } else {
//                 setCotizanteGlobal(null);
//                 setCotizantes(resultado.labores.map(() => defaultCotizante()));
//             }

//             setFase('revision');
//         } catch {
//             notify.error(t('analizar_doc.error_analisis'));
//         }
//     };

//     const toggleSeleccion = (idx: number) => {
//         setSugerencias((prev) => prev.map((s, i) => i === idx ? { ...s, seleccionada: !s.seleccionada } : s));
//     };

//     const updateSugerencia = (idx: number, patch: Partial<SugerenciaEditable>) => {
//         setSugerencias((prev) => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
//     };

//     const updateCotizante = (idx: number, patch: Partial<FilaCotizante>) => {
//         setCotizantes((prev) => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
//     };

//     const resolverCotizante = async (cot: FilaCotizante): Promise<{ trabajador_id: number | null; proveedor_externo_id: number | null }> => {
//         let trabajador_id: number | null = null;
//         let proveedor_externo_id: number | null = null;

//         if (cot.tipo === 'trabajador' && cot.trabajador_id) {
//             trabajador_id = Number(cot.trabajador_id);
//         } else if (cot.tipo === 'externo_existente' && cot.proveedor_id) {
//             proveedor_externo_id = Number(cot.proveedor_id);
//         } else if (cot.tipo === 'externo_nuevo' && cot.nuevo_nombre.trim()) {
//             const existente = proveedores.find(
//                 (p) => p.nombre.toLowerCase() === cot.nuevo_nombre.trim().toLowerCase()
//             );
//             if (existente) {
//                 proveedor_externo_id = existente.id;
//             } else {
//                 const nuevo = await createProveedor.mutateAsync({ nombre: cot.nuevo_nombre.trim() });
//                 proveedor_externo_id = nuevo.id;
//             }
//         }

//         return { trabajador_id, proveedor_externo_id };
//     };

//     const handleConfirmar = async () => {
//         if (!obraSeleccionadaId) return;
//         const seleccionadas = sugerencias.filter((s) => s.seleccionada);
//         if (seleccionadas.length === 0) {
//             notify.error(t('analizar_doc.error_sin_seleccion'));
//             return;
//         }

//         setConfirmando(true);

//         let proveedorGlobalId: number | null = null;
//         let trabajadorGlobalId: number | null = null;

//         if (cotizanteGlobal) {
//             if (cotizanteGlobal.tipo === 'trabajador' && cotizanteGlobal.trabajador_id) {
//                 trabajadorGlobalId = Number(cotizanteGlobal.trabajador_id);
//             } else if (cotizanteGlobal.tipo === 'externo_existente' && cotizanteGlobal.proveedor_id) {
//                 proveedorGlobalId = Number(cotizanteGlobal.proveedor_id);
//             } else if (cotizanteGlobal.tipo === 'externo_nuevo' && cotizanteGlobal.nuevo_nombre.trim()) {
//                 const existente = proveedores.find(
//                     (p) => p.nombre.toLowerCase() === cotizanteGlobal.nuevo_nombre.trim().toLowerCase()
//                 );
//                 if (existente) {
//                     proveedorGlobalId = existente.id;
//                 } else {
//                     const nuevo = await createProveedor.mutateAsync({ nombre: cotizanteGlobal.nuevo_nombre.trim() });
//                     proveedorGlobalId = nuevo.id;
//                 }
//             }
//         }

//         try {
//             for (let i = 0; i < sugerencias.length; i++) {
//                 const sug = sugerencias[i];
//                 if (!sug.seleccionada) continue;

//                 const nombreFinal = sug._nombre_edit.trim() || sug.descripcion;
//                 const cantidadFinal = sug._cantidad_edit ? Number(sug._cantidad_edit) : (sug.cantidad ?? undefined);

//                 const labor = await laborApi.create({
//                     nombre: nombreFinal.substring(0, 490),
//                     descripcion: (sug as any).descripcion_completa ?? sug.descripcion,
//                     obra_id: obraSeleccionadaId,
//                     modo: 'cotizacion',
//                     unidad_id: sug.unidad_id ?? undefined,
//                     cantidad: cantidadFinal,
//                 } as any);

//                 if (sug.presupuesto) {
//                     const precioUnitario = sug._precio_unitario_edit
//                         ? Number(sug._precio_unitario_edit)
//                         : (sug.presupuesto.precio_unitario ?? 0);

//                     let trabajador_id: number | null = null;
//                     let proveedor_externo_id: number | null = null;

//                     if (cotizanteGlobal) {
//                         trabajador_id = trabajadorGlobalId;
//                         proveedor_externo_id = proveedorGlobalId;
//                     } else {
//                         const resuelto = await resolverCotizante(cotizantes[i]);
//                         trabajador_id = resuelto.trabajador_id;
//                         proveedor_externo_id = resuelto.proveedor_externo_id;
//                     }

//                     if (trabajador_id || proveedor_externo_id) {
//                         await laborPresupuestosApi.create(labor.id, {
//                             trabajador_id,
//                             proveedor_externo_id,
//                             precio_unitario: precioUnitario,
//                             cantidad: cantidadFinal,
//                             notas: sug.presupuesto.notas ?? undefined,
//                             plazo_dias: sug.presupuesto.plazo_dias ?? undefined,
//                         });
//                     }
//                 }
//             }

//             queryClient.invalidateQueries({ queryKey: laboresQueryKeys.all });
//             notify.success(t('analizar_doc.registrado_ok', { n: seleccionadas.length }));
//             handleClose();
//         } catch {
//             notify.error(t('analizar_doc.error_registro'));
//         } finally {
//             setConfirmando(false);
//         }
//     };

//     const cardBorder = `1px solid ${theme.palette.divider}`;

//     return (
//         <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
//             <DialogTitle>
//                 <Stack direction="row" alignItems="center" justifyContent="space-between">
//                     <Stack direction="row" alignItems="center" gap={1}>
//                         <Sparkles size={18} color="#F59E0B" />
//                         <Typography variant="h6" fontWeight={700}>{t('analizar_doc.titulo')}</Typography>
//                     </Stack>
//                     <IconButton size="small" onClick={handleClose}><X size={18} /></IconButton>
//                 </Stack>
//             </DialogTitle>
//             <Divider />
//             <DialogContent sx={{ p: 3 }}>

//                 {/* ── FASE OBRA ── */}
//                 {fase === 'obra' && (
//                     <Stack spacing={3}>
//                         <Box sx={{ p: 2.5, borderRadius: 2, border: cardBorder, bgcolor: theme.palette.action.hover }}>
//                             <Stack direction="row" alignItems="center" gap={1} mb={2}>
//                                 <Building2 size={16} color="#F59E0B" />
//                                 <Typography variant="body2" fontWeight={700} color="text.primary">
//                                     {t('analizar_doc.seleccionar_obra')}
//                                 </Typography>
//                             </Stack>
//                             <Typography variant="caption" color="text.secondary" display="block" mb={2}>
//                                 {t('analizar_doc.seleccionar_obra_desc')}
//                             </Typography>
//                             <TextField
//                                 select fullWidth
//                                 label={t('analizar_doc.obra_label')}
//                                 value={obraSeleccionadaId}
//                                 onChange={(e) => setObraSeleccionadaId(e.target.value === '' ? '' : Number(e.target.value))}
//                                 SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 320 } } } }}
//                             >
//                                 <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
//                                 {obras.map((o) => (
//                                     <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>
//                                 ))}
//                             </TextField>
//                         </Box>

//                         {obraSeleccionadaId && (
//                             <Box sx={{ p: 2, borderRadius: 2, border: `1px solid rgba(245,158,11,0.3)`, bgcolor: 'rgba(245,158,11,0.06)' }}>
//                                 <Stack direction="row" alignItems="center" gap={1}>
//                                     <Building2 size={14} color="#F59E0B" />
//                                     <Typography variant="body2" fontWeight={600} color="text.primary">
//                                         {obraSeleccionada?.nombre}
//                                     </Typography>
//                                 </Stack>
//                             </Box>
//                         )}

//                         <Stack direction="row" justifyContent="flex-end">
//                             <Button
//                                 variant="contained"
//                                 disabled={!obraSeleccionadaId}
//                                 onClick={() => setFase('input')}
//                             >
//                                 {t('analizar_doc.continuar')}
//                             </Button>
//                         </Stack>
//                     </Stack>
//                 )}

//                 {/* ── FASE INPUT ── */}
//                 {fase === 'input' && (
//                     <Stack spacing={3}>
//                         {/* Obra seleccionada — pill informativo */}
//                         <Box sx={{ p: 1.5, borderRadius: 2, border: `1px solid rgba(245,158,11,0.3)`, bgcolor: 'rgba(245,158,11,0.06)', display: 'inline-flex', alignSelf: 'flex-start' }}>
//                             <Stack direction="row" alignItems="center" gap={1}>
//                                 <Building2 size={14} color="#F59E0B" />
//                                 <Typography variant="body2" fontWeight={600} color="text.primary">
//                                     {obraSeleccionada?.nombre}
//                                 </Typography>
//                                 <Button size="small" variant="text" sx={{ p: 0, minWidth: 'auto', fontSize: 11 }} onClick={() => setFase('obra')}>
//                                     {t('analizar_doc.cambiar')}
//                                 </Button>
//                             </Stack>
//                         </Box>

//                         <Tabs value={tabInput} onChange={(_, v) => setTabInput(v)}>
//                             <Tab label={t('analizar_doc.tab_archivo')} icon={<Upload size={14} />} iconPosition="start" />
//                             <Tab label={t('analizar_doc.tab_texto')} icon={<FileText size={14} />} iconPosition="start" />
//                         </Tabs>

//                         {tabInput === 0 && (
//                             <Box
//                                 sx={{
//                                     border: `2px dashed ${theme.palette.divider}`,
//                                     borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer',
//                                     bgcolor: theme.palette.action.hover,
//                                     '&:hover': { borderColor: theme.palette.primary.main },
//                                 }}
//                                 onClick={() => document.getElementById('file-input')?.click()}
//                             >
//                                 <input
//                                     id="file-input" type="file" hidden
//                                     accept=".pdf,image/*"
//                                     onChange={(e) => {
//                                         const file = e.target.files?.[0] ?? null;
//                                         setArchivo(file);
//                                         if (file && file.type.startsWith('image/')) {
//                                             setPreviewUrl(URL.createObjectURL(file));
//                                         } else {
//                                             setPreviewUrl(null);
//                                         }
//                                     }}
//                                 />
//                                 <Upload size={32} color={theme.palette.text.disabled} />
//                                 <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                                     {archivo ? archivo.name : t('analizar_doc.drop_hint')}
//                                 </Typography>
//                                 <Typography variant="caption" color="text.disabled">
//                                     {t('analizar_doc.formatos')}
//                                 </Typography>
//                                 {previewUrl && (
//                                     <Box sx={{ mt: 2 }}>
//                                         <img src={previewUrl} alt="preview"
//                                             style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
//                                     </Box>
//                                 )}
//                             </Box>
//                         )}

//                         {tabInput === 1 && (
//                             <TextField
//                                 multiline minRows={8} fullWidth
//                                 label={t('analizar_doc.texto_label')}
//                                 placeholder={t('analizar_doc.texto_placeholder')}
//                                 value={textoLibre}
//                                 onChange={(e) => setTextoLibre(e.target.value)}
//                             />
//                         )}

//                         <Stack direction="row" justifyContent="space-between">
//                             <Button variant="outlined" onClick={() => setFase('obra')}>
//                                 {t('analizar_doc.volver_input')}
//                             </Button>
//                             <Button
//                                 variant="contained"
//                                 startIcon={analizarMutation.isPending
//                                     ? <CircularProgress size={14} color="inherit" />
//                                     : <Sparkles size={14} />}
//                                 onClick={handleAnalizar}
//                                 disabled={analizarMutation.isPending || (tabInput === 0 ? !archivo : !textoLibre.trim())}
//                             >
//                                 {analizarMutation.isPending ? t('analizar_doc.analizando') : t('analizar_doc.analizar')}
//                             </Button>
//                         </Stack>
//                     </Stack>
//                 )}

//                 {/* ── FASE REVISIÓN ── */}
//                 {fase === 'revision' && (
//                     <Stack spacing={2}>
//                         <Stack
//                             direction={{ xs: 'column', sm: 'row' }}
//                             alignItems={{ xs: 'flex-start', sm: 'center' }}
//                             justifyContent="space-between"
//                             gap={1}
//                         >
//                             <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
//                                 <Box sx={{ p: 1, borderRadius: 1.5, border: `1px solid rgba(245,158,11,0.3)`, bgcolor: 'rgba(245,158,11,0.06)' }}>
//                                     <Stack direction="row" alignItems="center" gap={0.5}>
//                                         <Building2 size={12} color="#F59E0B" />
//                                         <Typography variant="caption" fontWeight={600} color="text.primary">
//                                             {obraSeleccionada?.nombre}
//                                         </Typography>
//                                     </Stack>
//                                 </Box>
//                                 <Typography variant="body2" color="text.secondary">
//                                     {t('analizar_doc.revision_desc', {
//                                         n: sugerencias.filter((s) => s.seleccionada).length,
//                                         total: sugerencias.length,
//                                     })}
//                                 </Typography>
//                                 <Stack direction="row" alignItems="center" gap={0.5}>
//                                     <Pencil size={12} color={theme.palette.text.disabled} />
//                                     <Typography variant="caption" color="text.disabled">
//                                         {t('analizar_doc.editable_hint')}
//                                     </Typography>
//                                 </Stack>
//                             </Stack>
//                             <Button size="small" variant="outlined" onClick={() => setFase('input')} sx={{ flexShrink: 0 }}>
//                                 {t('analizar_doc.volver_input')}
//                             </Button>
//                         </Stack>

//                         {/* Cotizante global */}
//                         {cotizanteGlobal !== null && (
//                             <Box sx={{ p: 2, borderRadius: 2, border: cardBorder, bgcolor: theme.palette.action.hover }}>
//                                 <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 1.5 }}>
//                                     {t('analizar_doc.cotizante_global_titulo')}
//                                 </Typography>
//                                 <Stack spacing={1.5}>
//                                     <TextField select size="small" fullWidth
//                                         value={cotizanteGlobal.tipo}
//                                         onChange={(e) => setCotizanteGlobal((prev) => prev ? { ...prev, tipo: e.target.value as TipoCotizante } : prev)}>
//                                         <MenuItem value="externo_nuevo">{t('analizar_doc.cotizante_nuevo')}</MenuItem>
//                                         <MenuItem value="externo_existente">{t('analizar_doc.cotizante_externo')}</MenuItem>
//                                         <MenuItem value="trabajador">{t('analizar_doc.cotizante_trabajador')}</MenuItem>
//                                     </TextField>
//                                     {cotizanteGlobal.tipo === 'externo_nuevo' && (
//                                         <TextField size="small" fullWidth label={t('analizar_doc.nombre_cotizante')}
//                                             value={cotizanteGlobal.nuevo_nombre}
//                                             onChange={(e) => setCotizanteGlobal((prev) => prev ? { ...prev, nuevo_nombre: e.target.value } : prev)} />
//                                     )}
//                                     {cotizanteGlobal.tipo === 'externo_existente' && (
//                                         <TextField select size="small" fullWidth
//                                             value={cotizanteGlobal.proveedor_id}
//                                             onChange={(e) => setCotizanteGlobal((prev) => prev ? { ...prev, proveedor_id: Number(e.target.value) } : prev)}>
//                                             <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
//                                             {proveedores.map((p) => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
//                                         </TextField>
//                                     )}
//                                     {cotizanteGlobal.tipo === 'trabajador' && (
//                                         <TextField select size="small" fullWidth
//                                             value={cotizanteGlobal.trabajador_id}
//                                             onChange={(e) => setCotizanteGlobal((prev) => prev ? { ...prev, trabajador_id: Number(e.target.value) } : prev)}>
//                                             <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
//                                             {jefes.map((tr) => <MenuItem key={tr.id} value={tr.id}>{tr.nombre} {tr.apellido}</MenuItem>)}
//                                         </TextField>
//                                     )}
//                                 </Stack>
//                             </Box>
//                         )}

//                         {/* Desktop: tabla */}
//                         <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
//                             <Table size="small">
//                                 <TableHead>
//                                     <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
//                                         <TableCell padding="checkbox" />
//                                         <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>{t('analizar_doc.col_descripcion')}</TableCell>
//                                         <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>{t('analizar_doc.col_unidad')}</TableCell>
//                                         <TableCell sx={{ fontWeight: 700, minWidth: 90 }}>{t('analizar_doc.col_cantidad')}</TableCell>
//                                         <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>{t('analizar_doc.col_precio_unitario')}</TableCell>
//                                         <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>{t('analizar_doc.col_precio_total')}</TableCell>
//                                         {!cotizanteGlobal && (
//                                             <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>{t('analizar_doc.col_cotizante')}</TableCell>
//                                         )}
//                                     </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                     {sugerencias.map((sug, idx) => {
//                                         const cot = cotizantes[idx];
//                                         return (
//                                             <TableRow key={sug._key}
//                                                 sx={{
//                                                     opacity: sug.seleccionada ? 1 : 0.4,
//                                                     bgcolor: sug.seleccionada ? 'transparent' : theme.palette.action.hover,
//                                                     verticalAlign: 'top',
//                                                 }}>
//                                                 <TableCell padding="checkbox" sx={{ pt: 1.5 }}>
//                                                     <Checkbox checked={sug.seleccionada} onChange={() => toggleSeleccion(idx)} />
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <TextField size="small" fullWidth multiline maxRows={3}
//                                                         value={sug._nombre_edit}
//                                                         onChange={(e) => updateSugerencia(idx, { _nombre_edit: e.target.value })}
//                                                         disabled={!sug.seleccionada}
//                                                         sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <TextField select size="small" fullWidth
//                                                         value={sug._unidad_edit}
//                                                         onChange={(e) => updateSugerencia(idx, { _unidad_edit: e.target.value })}
//                                                         disabled={!sug.seleccionada}>
//                                                         <MenuItem value="">-</MenuItem>
//                                                         {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
//                                                     </TextField>
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <TextField size="small" fullWidth type="number"
//                                                         value={sug._cantidad_edit}
//                                                         onChange={(e) => updateSugerencia(idx, { _cantidad_edit: e.target.value })}
//                                                         disabled={!sug.seleccionada}
//                                                         inputProps={{ min: 0, step: 0.01 }}
//                                                         sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <TextField size="small" fullWidth type="number"
//                                                         value={sug._precio_unitario_edit}
//                                                         onChange={(e) => updateSugerencia(idx, { _precio_unitario_edit: e.target.value })}
//                                                         disabled={!sug.seleccionada}
//                                                         inputProps={{ min: 0 }}
//                                                         sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <TextField size="small" fullWidth type="number"
//                                                         value={sug._precio_total_edit}
//                                                         onChange={(e) => updateSugerencia(idx, { _precio_total_edit: e.target.value })}
//                                                         disabled={!sug.seleccionada}
//                                                         inputProps={{ min: 0 }}
//                                                         sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
//                                                 </TableCell>
//                                                 {!cotizanteGlobal && (
//                                                     <TableCell>
//                                                         {sug.presupuesto && sug.seleccionada ? (
//                                                             <Stack spacing={1}>
//                                                                 <TextField select size="small" fullWidth
//                                                                     value={cot.tipo}
//                                                                     onChange={(e) => updateCotizante(idx, { tipo: e.target.value as TipoCotizante })}>
//                                                                     <MenuItem value="externo_nuevo">{t('analizar_doc.cotizante_nuevo')}</MenuItem>
//                                                                     <MenuItem value="externo_existente">{t('analizar_doc.cotizante_externo')}</MenuItem>
//                                                                     <MenuItem value="trabajador">{t('analizar_doc.cotizante_trabajador')}</MenuItem>
//                                                                 </TextField>
//                                                                 {cot.tipo === 'externo_nuevo' && (
//                                                                     <TextField size="small" fullWidth label={t('analizar_doc.nombre_cotizante')}
//                                                                         value={cot.nuevo_nombre}
//                                                                         onChange={(e) => updateCotizante(idx, { nuevo_nombre: e.target.value })} />
//                                                                 )}
//                                                                 {cot.tipo === 'externo_existente' && (
//                                                                     <TextField select size="small" fullWidth
//                                                                         value={cot.proveedor_id}
//                                                                         onChange={(e) => updateCotizante(idx, { proveedor_id: Number(e.target.value) })}>
//                                                                         <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
//                                                                         {proveedores.map((p) => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
//                                                                     </TextField>
//                                                                 )}
//                                                                 {cot.tipo === 'trabajador' && (
//                                                                     <TextField select size="small" fullWidth
//                                                                         value={cot.trabajador_id}
//                                                                         onChange={(e) => updateCotizante(idx, { trabajador_id: Number(e.target.value) })}>
//                                                                         <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
//                                                                         {jefes.map((tr) => <MenuItem key={tr.id} value={tr.id}>{tr.nombre} {tr.apellido}</MenuItem>)}
//                                                                     </TextField>
//                                                                 )}
//                                                             </Stack>
//                                                         ) : !sug.presupuesto ? (
//                                                             <Typography variant="caption" color="text.disabled">
//                                                                 {t('analizar_doc.sin_presupuesto')}
//                                                             </Typography>
//                                                         ) : null}
//                                                     </TableCell>
//                                                 )}
//                                             </TableRow>
//                                         );
//                                     })}
//                                 </TableBody>
//                             </Table>
//                         </Box>

//                         {/* Mobile: cards */}
//                         <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
//                             {sugerencias.map((sug, idx) => {
//                                 const cot = cotizantes[idx];
//                                 return (
//                                     <Box key={sug._key} sx={{
//                                         p: 2, borderRadius: 2, border: cardBorder,
//                                         bgcolor: 'background.paper',
//                                         opacity: sug.seleccionada ? 1 : 0.5,
//                                         transition: 'opacity 0.2s',
//                                     }}>
//                                         <Stack direction="row" alignItems="flex-start" gap={1} sx={{ mb: 1.5 }}>
//                                             <Checkbox checked={sug.seleccionada} onChange={() => toggleSeleccion(idx)} sx={{ mt: -0.5, flexShrink: 0 }} />
//                                             <TextField size="small" fullWidth multiline maxRows={3}
//                                                 label={t('analizar_doc.col_descripcion')}
//                                                 value={sug._nombre_edit}
//                                                 onChange={(e) => updateSugerencia(idx, { _nombre_edit: e.target.value })}
//                                                 disabled={!sug.seleccionada}
//                                                 sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
//                                         </Stack>
//                                         <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
//                                             <TextField select size="small" fullWidth label={t('analizar_doc.col_unidad')}
//                                                 value={sug._unidad_edit}
//                                                 onChange={(e) => updateSugerencia(idx, { _unidad_edit: e.target.value })}
//                                                 disabled={!sug.seleccionada}>
//                                                 <MenuItem value="">-</MenuItem>
//                                                 {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
//                                             </TextField>
//                                             <TextField size="small" fullWidth type="number" label={t('analizar_doc.col_cantidad')}
//                                                 value={sug._cantidad_edit}
//                                                 onChange={(e) => updateSugerencia(idx, { _cantidad_edit: e.target.value })}
//                                                 disabled={!sug.seleccionada}
//                                                 inputProps={{ min: 0, step: 0.01 }}
//                                                 sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
//                                         </Stack>
//                                         <Stack direction="row" spacing={1} sx={{ mb: !cotizanteGlobal && sug.presupuesto ? 1.5 : 0 }}>
//                                             <TextField size="small" fullWidth type="number" label={t('analizar_doc.col_precio_unitario')}
//                                                 value={sug._precio_unitario_edit}
//                                                 onChange={(e) => updateSugerencia(idx, { _precio_unitario_edit: e.target.value })}
//                                                 disabled={!sug.seleccionada}
//                                                 inputProps={{ min: 0 }}
//                                                 sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
//                                             <TextField size="small" fullWidth type="number" label={t('analizar_doc.col_precio_total')}
//                                                 value={sug._precio_total_edit}
//                                                 onChange={(e) => updateSugerencia(idx, { _precio_total_edit: e.target.value })}
//                                                 disabled={!sug.seleccionada}
//                                                 inputProps={{ min: 0 }}
//                                                 sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
//                                         </Stack>
//                                         {!cotizanteGlobal && (
//                                             sug.presupuesto && sug.seleccionada ? (
//                                                 <Stack spacing={1}>
//                                                     <TextField select size="small" fullWidth label={t('analizar_doc.col_cotizante')}
//                                                         value={cot.tipo}
//                                                         onChange={(e) => updateCotizante(idx, { tipo: e.target.value as TipoCotizante })}>
//                                                         <MenuItem value="externo_nuevo">{t('analizar_doc.cotizante_nuevo')}</MenuItem>
//                                                         <MenuItem value="externo_existente">{t('analizar_doc.cotizante_externo')}</MenuItem>
//                                                         <MenuItem value="trabajador">{t('analizar_doc.cotizante_trabajador')}</MenuItem>
//                                                     </TextField>
//                                                     {cot.tipo === 'externo_nuevo' && (
//                                                         <TextField size="small" fullWidth label={t('analizar_doc.nombre_cotizante')}
//                                                             value={cot.nuevo_nombre}
//                                                             onChange={(e) => updateCotizante(idx, { nuevo_nombre: e.target.value })} />
//                                                     )}
//                                                     {cot.tipo === 'externo_existente' && (
//                                                         <TextField select size="small" fullWidth
//                                                             value={cot.proveedor_id}
//                                                             onChange={(e) => updateCotizante(idx, { proveedor_id: Number(e.target.value) })}>
//                                                             <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
//                                                             {proveedores.map((p) => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
//                                                         </TextField>
//                                                     )}
//                                                     {cot.tipo === 'trabajador' && (
//                                                         <TextField select size="small" fullWidth
//                                                             value={cot.trabajador_id}
//                                                             onChange={(e) => updateCotizante(idx, { trabajador_id: Number(e.target.value) })}>
//                                                             <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
//                                                             {jefes.map((tr) => <MenuItem key={tr.id} value={tr.id}>{tr.nombre} {tr.apellido}</MenuItem>)}
//                                                         </TextField>
//                                                     )}
//                                                 </Stack>
//                                             ) : !sug.presupuesto ? (
//                                                 <Typography variant="caption" color="text.disabled">
//                                                     {t('analizar_doc.sin_presupuesto')}
//                                                 </Typography>
//                                             ) : null
//                                         )}
//                                     </Box>
//                                 );
//                             })}
//                         </Stack>

//                         <Box sx={{ p: 2, borderRadius: 2, border: cardBorder, bgcolor: theme.palette.action.hover }}>
//                             <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
//                                 {t('analizar_doc.resumen_titulo')}
//                             </Typography>
//                             <Typography variant="caption" color="text.secondary">
//                                 {t('analizar_doc.resumen_desc', {
//                                     labores: sugerencias.filter((s) => s.seleccionada).length,
//                                     presupuestos: sugerencias.filter((s) => s.seleccionada && s.presupuesto).length,
//                                 })}
//                             </Typography>
//                         </Box>

//                         <Stack direction="row" justifyContent="flex-end" spacing={1}>
//                             <Button variant="outlined" onClick={handleClose}>{t('analizar_doc.cancelar')}</Button>
//                             <Button
//                                 variant="contained"
//                                 onClick={handleConfirmar}
//                                 disabled={confirmando || sugerencias.filter((s) => s.seleccionada).length === 0}
//                                 startIcon={confirmando ? <CircularProgress size={14} color="inherit" /> : <Sparkles size={14} />}
//                             >
//                                 {confirmando
//                                     ? t('analizar_doc.registrando')
//                                     : t('analizar_doc.confirmar', { n: sugerencias.filter((s) => s.seleccionada).length })}
//                             </Button>
//                         </Stack>
//                     </Stack>
//                 )}
//             </DialogContent>
//         </Dialog>
//     );
// };

// function fileToBase64(file: File): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = () => resolve((reader.result as string).split(',')[1]);
//         reader.onerror = reject;
//         reader.readAsDataURL(file);
//     });
// }

import React, { useState } from 'react';
import {
    Box, Button, Checkbox, CircularProgress, Dialog, DialogContent,
    DialogTitle, Divider, IconButton, LinearProgress, MenuItem, Stack, Tab, Tabs,
    Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Typography, useTheme, Chip,
} from '@mui/material';
import { FileText, Upload, X, Sparkles, Pencil, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnalizarDocumento, useCreateProveedorExterno, useProveedoresExternos } from '../hooks/useLaborPresupuestos';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useObrasList } from '../../obras/hooks/useObras';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { laborApi } from '../../../services/api/labor.api';
import { laborPresupuestosApi } from '../../../services/api/laborPresupuestos.api';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useQueryClient } from '@tanstack/react-query';
import { laboresQueryKeys } from '../hooks/useLabores';
import type { LaborSugerencia } from '../types/labor.types';

interface Props {
    open: boolean;
    onClose: () => void;
}

type TipoCotizante = 'trabajador' | 'externo_existente' | 'externo_nuevo';

interface FilaCotizante {
    tipo: TipoCotizante;
    trabajador_id: number | '';
    proveedor_id: number | '';
    nuevo_nombre: string;
}

interface SugerenciaEditable extends LaborSugerencia {
    descripcion_completa?: string | null;
    _nombre_edit: string;
    _unidad_edit: string;
    _cantidad_edit: string;
    _precio_unitario_edit: string;
    _precio_total_edit: string;
    _especialidad_id_edit: number | '';
}

type CotizanteGlobal = {
    tipo: TipoCotizante;
    trabajador_id: number | '';
    proveedor_id: number | '';
    nuevo_nombre: string;
};

type ProgresoItem = {
    labor: string;
    estado: 'pendiente' | 'procesando' | 'ok' | 'error';
};

const defaultCotizante = (): FilaCotizante => ({
    tipo: 'externo_nuevo',
    trabajador_id: '',
    proveedor_id: '',
    nuevo_nombre: '',
});

const UNIDADES = ['m²', 'm³', 'ml', 'kg', 'tn', 'un', 'gl', 'hr', 'lt', 'm'];

type Fase = 'obra' | 'input' | 'revision' | 'progreso';
type TabInput = 0 | 1;

// ── Overlay de progreso animado ───────────────────────────────
function ProgresoOverlay({ items }: { items: ProgresoItem[] }) {
    const theme = useTheme();
    const completados = items.filter(i => i.estado === 'ok').length;
    const total = items.length;
    const pct = total > 0 ? Math.round((completados / total) * 100) : 0;

    return (
        <Box sx={{
            position: 'absolute', inset: 0, zIndex: 10,
            bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(0,0,0,0.85)'
                : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            borderRadius: 2, p: 4,
        }}>
            <Stack alignItems="center" spacing={3} sx={{ width: '100%', maxWidth: 420 }}>
                <Stack alignItems="center" spacing={1}>
                    <Sparkles size={32} color="#F59E0B" />
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                        Registrando labores...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {completados} de {total} labores procesadas
                    </Typography>
                </Stack>

                {/* Barra de progreso global */}
                <Box sx={{ width: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Progreso</Typography>
                        <Typography variant="caption" fontWeight={800} color="#F59E0B">{pct}%</Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                            height: 8, borderRadius: 4,
                            bgcolor: theme.palette.action.hover,
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                bgcolor: '#F59E0B',
                                transition: 'transform 0.6s ease',
                            },
                        }}
                    />
                </Box>

                {/* Lista de items */}
                <Stack spacing={1} sx={{ width: '100%' }}>
                    {items.map((item, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                p: 1.5, borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: item.estado === 'procesando'
                                    ? 'rgba(245,158,11,0.06)'
                                    : item.estado === 'ok'
                                        ? 'rgba(22,163,74,0.04)'
                                        : item.estado === 'error'
                                            ? 'rgba(220,38,38,0.04)'
                                            : theme.palette.background.paper,
                                transition: 'all 0.3s ease',
                                opacity: item.estado === 'pendiente' ? 0.5 : 1,
                            }}
                        >
                            {item.estado === 'pendiente' && (
                                <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${theme.palette.divider}`, flexShrink: 0 }} />
                            )}
                            {item.estado === 'procesando' && (
                                <CircularProgress size={18} sx={{ color: '#F59E0B', flexShrink: 0 }} />
                            )}
                            {item.estado === 'ok' && (
                                <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0 }} />
                            )}
                            {item.estado === 'error' && (
                                <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                            )}
                            <Typography
                                variant="body2"
                                fontWeight={item.estado === 'procesando' ? 700 : 500}
                                color={
                                    item.estado === 'ok' ? 'success.main'
                                        : item.estado === 'error' ? 'error.main'
                                            : item.estado === 'procesando' ? '#B45309'
                                                : 'text.disabled'
                                }
                                noWrap
                            >
                                {item.labor}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}

export const AnalizarDocumentoModal: React.FC<Props> = ({ open, onClose }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const notify = useNotify();
    const queryClient = useQueryClient();

    const [fase, setFase] = useState<Fase>('obra');
    const [obraSeleccionadaId, setObraSeleccionadaId] = useState<number | ''>('');
    const [tabInput, setTabInput] = useState<TabInput>(0);
    const [archivo, setArchivo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [textoLibre, setTextoLibre] = useState('');
    const [sugerencias, setSugerencias] = useState<SugerenciaEditable[]>([]);
    const [cotizantes, setCotizantes] = useState<FilaCotizante[]>([]);
    const [cotizanteGlobal, setCotizanteGlobal] = useState<CotizanteGlobal | null>(null);
    const [confirmando, setConfirmando] = useState(false);
    const [progresoItems, setProgresoItems] = useState<ProgresoItem[]>([]);

    const analizarMutation = useAnalizarDocumento();
    const createProveedor = useCreateProveedorExterno();
    const { data: trabajadores = [] } = useTrabajadoresList();
    const { data: proveedores = [] } = useProveedoresExternos();
    const { data: obrasRaw = [] } = useObrasList();
    const { data: especialidades = [] } = useEspecialidadesList();
    const jefes = trabajadores.filter((tr) => tr.jefe_id === null);

    // Filtrar solo obras activas (estado 18)
    const obras = obrasRaw.filter((o) => o.estado_id === 18);
    const obraSeleccionada = obras.find((o) => o.id === obraSeleccionadaId);

    const handleClose = () => {
        setFase('obra');
        setObraSeleccionadaId('');
        setTabInput(0);
        setArchivo(null);
        setPreviewUrl(null);
        setTextoLibre('');
        setSugerencias([]);
        setCotizantes([]);
        setCotizanteGlobal(null);
        setConfirmando(false);
        setProgresoItems([]);
        onClose();
    };

    const handleCloseWithConfirm = async () => {
        if (fase === 'obra' && !obraSeleccionadaId) {
            handleClose();
            return;
        }
        if (analizarMutation.isPending || confirmando) return;

        const confirmed = await notify.confirm({
            title: t('analizar_doc.confirm_cerrar_title'),
            message: t('analizar_doc.confirm_cerrar_msg'),
            confirmLabel: t('analizar_doc.confirm_cerrar_btn'),
            severity: 'warning',
        });
        if (confirmed) handleClose();
    };

    const handleAnalizar = async () => {
        try {
            let resultado;
            if (tabInput === 0 && archivo) {
                const base64 = await fileToBase64(archivo);
                resultado = await analizarMutation.mutateAsync({ imagen_base64: base64, media_type: archivo.type });
            } else if (tabInput === 1 && textoLibre.trim()) {
                resultado = await analizarMutation.mutateAsync({ texto_libre: textoLibre });
            } else {
                notify.error(t('analizar_doc.error_sin_input'));
                return;
            }

            setSugerencias(resultado.labores.map((l: any) => ({
                ...l,
                seleccionada: true,
                _nombre_edit: l.descripcion ?? '',
                _unidad_edit: l.unidad_simbolo ?? '',
                _cantidad_edit: l.cantidad != null ? String(l.cantidad) : '',
                _precio_unitario_edit: l.presupuesto?.precio_unitario != null ? String(l.presupuesto.precio_unitario) : '',
                _precio_total_edit: l.presupuesto?.precio_total != null ? String(l.presupuesto.precio_total) : '',
                _especialidad_id_edit: l.especialidad_id ?? '',
            })));

            if (resultado.cotizante_global) {
                setCotizanteGlobal({
                    tipo: 'externo_nuevo',
                    trabajador_id: '',
                    proveedor_id: '',
                    nuevo_nombre: resultado.cotizante_global,
                });
                setCotizantes(resultado.labores.map(() => defaultCotizante()));
            } else {
                setCotizanteGlobal(null);
                setCotizantes(resultado.labores.map(() => defaultCotizante()));
            }

            setFase('revision');
        } catch {
            notify.error(t('analizar_doc.error_analisis'));
        }
    };

    const toggleSeleccion = (idx: number) => {
        setSugerencias((prev) => prev.map((s, i) => i === idx ? { ...s, seleccionada: !s.seleccionada } : s));
    };

    const updateSugerencia = (idx: number, patch: Partial<SugerenciaEditable>) => {
        setSugerencias((prev) => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
    };

    const updateCotizante = (idx: number, patch: Partial<FilaCotizante>) => {
        setCotizantes((prev) => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
    };

    // Validar que cotizantes estén completos
    const cotizantesValidos = sugerencias.every((sug, idx) => {
        if (!sug.seleccionada || !sug.presupuesto) return true;
        const cot = cotizanteGlobal ?? cotizantes[idx];
        if (!cot) return true;
        if (cot.tipo === 'externo_nuevo') return cot.nuevo_nombre.trim().length > 0;
        if (cot.tipo === 'externo_existente') return !!cot.proveedor_id;
        if (cot.tipo === 'trabajador') return !!cot.trabajador_id;
        return true;
    });

    const resolverCotizante = async (cot: FilaCotizante): Promise<{ trabajador_id: number | null; proveedor_externo_id: number | null }> => {
        let trabajador_id: number | null = null;
        let proveedor_externo_id: number | null = null;

        if (cot.tipo === 'trabajador' && cot.trabajador_id) {
            trabajador_id = Number(cot.trabajador_id);
        } else if (cot.tipo === 'externo_existente' && cot.proveedor_id) {
            proveedor_externo_id = Number(cot.proveedor_id);
        } else if (cot.tipo === 'externo_nuevo' && cot.nuevo_nombre.trim()) {
            const existente = proveedores.find(
                (p) => p.nombre.toLowerCase() === cot.nuevo_nombre.trim().toLowerCase()
            );
            if (existente) {
                proveedor_externo_id = existente.id;
            } else {
                const nuevo = await createProveedor.mutateAsync({ nombre: cot.nuevo_nombre.trim() });
                proveedor_externo_id = nuevo.id;
            }
        }

        return { trabajador_id, proveedor_externo_id };
    };

    const handleConfirmar = async () => {
        if (!obraSeleccionadaId) return;
        const seleccionadas = sugerencias.filter((s) => s.seleccionada);
        if (seleccionadas.length === 0) {
            notify.error(t('analizar_doc.error_sin_seleccion'));
            return;
        }

        // Inicializar progreso
        const itemsIniciales: ProgresoItem[] = seleccionadas.map(s => ({
            labor: s._nombre_edit || s.descripcion,
            estado: 'pendiente',
        }));
        setProgresoItems(itemsIniciales);
        setFase('progreso');
        setConfirmando(true);

        let proveedorGlobalId: number | null = null;
        let trabajadorGlobalId: number | null = null;

        if (cotizanteGlobal) {
            if (cotizanteGlobal.tipo === 'trabajador' && cotizanteGlobal.trabajador_id) {
                trabajadorGlobalId = Number(cotizanteGlobal.trabajador_id);
            } else if (cotizanteGlobal.tipo === 'externo_existente' && cotizanteGlobal.proveedor_id) {
                proveedorGlobalId = Number(cotizanteGlobal.proveedor_id);
            } else if (cotizanteGlobal.tipo === 'externo_nuevo' && cotizanteGlobal.nuevo_nombre.trim()) {
                const existente = proveedores.find(
                    (p) => p.nombre.toLowerCase() === cotizanteGlobal.nuevo_nombre.trim().toLowerCase()
                );
                if (existente) {
                    proveedorGlobalId = existente.id;
                } else {
                    const nuevo = await createProveedor.mutateAsync({ nombre: cotizanteGlobal.nuevo_nombre.trim() });
                    proveedorGlobalId = nuevo.id;
                }
            }
        }

        let progresoIdx = 0;
        try {
            for (let i = 0; i < sugerencias.length; i++) {
                const sug = sugerencias[i];
                if (!sug.seleccionada) continue;

                // Marcar como procesando
                setProgresoItems(prev => prev.map((item, idx) =>
                    idx === progresoIdx ? { ...item, estado: 'procesando' } : item
                ));

                try {
                    const nombreFinal = sug._nombre_edit.trim() || sug.descripcion;
                    const cantidadFinal = sug._cantidad_edit ? Number(sug._cantidad_edit) : (sug.cantidad ?? undefined);
                    const especialidadId = sug._especialidad_id_edit !== '' ? Number(sug._especialidad_id_edit) : null;

                    const labor = await laborApi.create({
                        nombre: nombreFinal.substring(0, 490),
                        descripcion: (sug as any).descripcion_completa ?? sug.descripcion,
                        obra_id: obraSeleccionadaId,
                        modo: 'cotizacion',
                        unidad_id: sug.unidad_id ?? undefined,
                        cantidad: cantidadFinal,
                        especialidad_id: especialidadId ?? undefined,
                    } as any);

                    if (sug.presupuesto) {
                        const precioUnitario = sug._precio_unitario_edit
                            ? Number(sug._precio_unitario_edit)
                            : (sug.presupuesto.precio_unitario ?? 0);

                        let trabajador_id: number | null = null;
                        let proveedor_externo_id: number | null = null;

                        if (cotizanteGlobal) {
                            trabajador_id = trabajadorGlobalId;
                            proveedor_externo_id = proveedorGlobalId;
                        } else {
                            const resuelto = await resolverCotizante(cotizantes[i]);
                            trabajador_id = resuelto.trabajador_id;
                            proveedor_externo_id = resuelto.proveedor_externo_id;
                        }

                        if (trabajador_id || proveedor_externo_id) {
                            await laborPresupuestosApi.create(labor.id, {
                                trabajador_id,
                                proveedor_externo_id,
                                precio_unitario: precioUnitario,
                                cantidad: cantidadFinal,
                                notas: sug.presupuesto.notas ?? undefined,
                                plazo_dias: sug.presupuesto.plazo_dias ?? undefined,
                            });
                        }
                    }

                    // Marcar como ok
                    setProgresoItems(prev => prev.map((item, idx) =>
                        idx === progresoIdx ? { ...item, estado: 'ok' } : item
                    ));
                } catch {
                    setProgresoItems(prev => prev.map((item, idx) =>
                        idx === progresoIdx ? { ...item, estado: 'error' } : item
                    ));
                }

                progresoIdx++;
            }

            queryClient.invalidateQueries({ queryKey: laboresQueryKeys.all });
            notify.success(t('analizar_doc.registrado_ok', { n: seleccionadas.length }));

            // Esperar un momento para que el usuario vea el 100%
            await new Promise(resolve => setTimeout(resolve, 800));
            handleClose();
        } catch {
            notify.error(t('analizar_doc.error_registro'));
            setFase('revision');
        } finally {
            setConfirmando(false);
        }
    };

    const cardBorder = `1px solid ${theme.palette.divider}`;

    const renderSelectorEspecialidad = (idx: number, sug: SugerenciaEditable) => (
        <TextField
            select size="small" fullWidth
            label={t('analizar_doc.col_especialidad')}
            value={sug._especialidad_id_edit}
            onChange={(e) => updateSugerencia(idx, {
                _especialidad_id_edit: e.target.value === '' ? '' : Number(e.target.value)
            })}
            disabled={!sug.seleccionada}
        >
            <MenuItem value="">-</MenuItem>
            {especialidades.map((e) => (
                <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
            ))}
        </TextField>
    );

    const renderCotizanteSelector = (idx: number, cot: FilaCotizante) => (
        <Stack spacing={1}>
            <TextField select size="small" fullWidth
                value={cot.tipo}
                onChange={(e) => updateCotizante(idx, { tipo: e.target.value as TipoCotizante })}>
                <MenuItem value="externo_nuevo">{t('analizar_doc.cotizante_nuevo')}</MenuItem>
                <MenuItem value="externo_existente">{t('analizar_doc.cotizante_externo')}</MenuItem>
                <MenuItem value="trabajador">{t('analizar_doc.cotizante_trabajador')}</MenuItem>
            </TextField>
            {cot.tipo === 'externo_nuevo' && (
                <TextField size="small" fullWidth label={t('analizar_doc.nombre_cotizante')}
                    value={cot.nuevo_nombre}
                    onChange={(e) => updateCotizante(idx, { nuevo_nombre: e.target.value })} />
            )}
            {cot.tipo === 'externo_existente' && (
                <TextField select size="small" fullWidth
                    value={cot.proveedor_id}
                    onChange={(e) => updateCotizante(idx, { proveedor_id: Number(e.target.value) })}>
                    <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
                    {proveedores.map((p) => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
                </TextField>
            )}
            {cot.tipo === 'trabajador' && (
                <TextField select size="small" fullWidth
                    value={cot.trabajador_id}
                    onChange={(e) => updateCotizante(idx, { trabajador_id: Number(e.target.value) })}>
                    <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
                    {jefes.map((tr) => <MenuItem key={tr.id} value={tr.id}>{tr.nombre} {tr.apellido}</MenuItem>)}
                </TextField>
            )}
        </Stack>
    );

return (
    <>
        <Dialog
            open={open}
            onClose={analizarMutation.isPending || confirmando ? undefined : handleCloseWithConfirm}
            maxWidth="xl"
            fullWidth
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Sparkles size={18} color="#F59E0B" />
                        <Typography variant="h6" fontWeight={700}>{t('analizar_doc.titulo')}</Typography>
                    </Stack>
                    <IconButton
                        size="small"
                        onClick={handleCloseWithConfirm}
                        disabled={analizarMutation.isPending || confirmando}
                    >
                        <X size={18} />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 3 }}>

                {/* ── FASE OBRA ── */}
                {fase === 'obra' && (
                    <Stack spacing={3}>
                        <Box sx={{ p: 2.5, borderRadius: 2, border: cardBorder, bgcolor: theme.palette.action.hover }}>
                            <Stack direction="row" alignItems="center" gap={1} mb={2}>
                                <Building2 size={16} color="#F59E0B" />
                                <Typography variant="body2" fontWeight={700} color="text.primary">
                                    {t('analizar_doc.seleccionar_obra')}
                                </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                {t('analizar_doc.seleccionar_obra_desc')}
                            </Typography>
                            <TextField
                                select fullWidth
                                label={t('analizar_doc.obra_label')}
                                value={obraSeleccionadaId}
                                onChange={(e) => setObraSeleccionadaId(e.target.value === '' ? '' : Number(e.target.value))}
                                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 320 } } } }}
                            >
                                <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
                                {obras.map((o) => (
                                    <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {obraSeleccionadaId && (
                            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid rgba(245,158,11,0.3)`, bgcolor: 'rgba(245,158,11,0.06)' }}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Building2 size={14} color="#F59E0B" />
                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                        {obraSeleccionada?.nombre}
                                    </Typography>
                                </Stack>
                            </Box>
                        )}

                        <Stack direction="row" justifyContent="flex-end">
                            <Button variant="contained" disabled={!obraSeleccionadaId} onClick={() => setFase('input')}>
                                {t('analizar_doc.continuar')}
                            </Button>
                        </Stack>
                    </Stack>
                )}

                {/* ── FASE INPUT ── */}
                {fase === 'input' && (
                    <Stack spacing={3}>
                        <Box sx={{ p: 1.5, borderRadius: 2, border: `1px solid rgba(245,158,11,0.3)`, bgcolor: 'rgba(245,158,11,0.06)', display: 'inline-flex', alignSelf: 'flex-start' }}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Building2 size={14} color="#F59E0B" />
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {obraSeleccionada?.nombre}
                                </Typography>
                                <Button size="small" variant="text" sx={{ p: 0, minWidth: 'auto', fontSize: 11 }} onClick={() => setFase('obra')}>
                                    {t('analizar_doc.cambiar')}
                                </Button>
                            </Stack>
                        </Box>

                        <Tabs value={tabInput} onChange={(_, v) => setTabInput(v)}>
                            <Tab label={t('analizar_doc.tab_archivo')} icon={<Upload size={14} />} iconPosition="start" />
                            <Tab label={t('analizar_doc.tab_texto')} icon={<FileText size={14} />} iconPosition="start" />
                        </Tabs>

                        {tabInput === 0 && (
                            <Box
                                sx={{
                                    border: `2px dashed ${theme.palette.divider}`,
                                    borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer',
                                    bgcolor: theme.palette.action.hover,
                                    '&:hover': { borderColor: theme.palette.primary.main },
                                }}
                                onClick={() => document.getElementById('file-input')?.click()}
                            >
                                <input id="file-input" type="file" hidden accept=".pdf,image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        setArchivo(file);
                                        if (file && file.type.startsWith('image/')) {
                                            setPreviewUrl(URL.createObjectURL(file));
                                        } else {
                                            setPreviewUrl(null);
                                        }
                                    }}
                                />
                                <Upload size={32} color={theme.palette.text.disabled} />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {archivo ? archivo.name : t('analizar_doc.drop_hint')}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    {t('analizar_doc.formatos')}
                                </Typography>
                                {previewUrl && (
                                    <Box sx={{ mt: 2 }}>
                                        <img src={previewUrl} alt="preview"
                                            style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
                                    </Box>
                                )}
                            </Box>
                        )}

                        {tabInput === 1 && (
                            <TextField multiline minRows={8} fullWidth
                                label={t('analizar_doc.texto_label')}
                                placeholder={t('analizar_doc.texto_placeholder')}
                                value={textoLibre}
                                onChange={(e) => setTextoLibre(e.target.value)}
                            />
                        )}

                        <Stack direction="row" justifyContent="space-between">
                            <Button variant="outlined" onClick={() => setFase('obra')}>
                                {t('analizar_doc.volver_input')}
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={analizarMutation.isPending
                                    ? <CircularProgress size={14} color="inherit" />
                                    : <Sparkles size={14} />}
                                onClick={handleAnalizar}
                                disabled={analizarMutation.isPending || (tabInput === 0 ? !archivo : !textoLibre.trim())}
                            >
                                {analizarMutation.isPending ? t('analizar_doc.analizando') : t('analizar_doc.analizar')}
                            </Button>
                        </Stack>
                    </Stack>
                )}

                {/* ── FASE REVISIÓN ── */}
                {fase === 'revision' && (
                    <Stack spacing={2}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            justifyContent="space-between"
                            gap={1}
                        >
                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                <Box sx={{ p: 1, borderRadius: 1.5, border: `1px solid rgba(245,158,11,0.3)`, bgcolor: 'rgba(245,158,11,0.06)' }}>
                                    <Stack direction="row" alignItems="center" gap={0.5}>
                                        <Building2 size={12} color="#F59E0B" />
                                        <Typography variant="caption" fontWeight={600} color="text.primary">
                                            {obraSeleccionada?.nombre}
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {t('analizar_doc.revision_desc', {
                                        n: sugerencias.filter((s) => s.seleccionada).length,
                                        total: sugerencias.length,
                                    })}
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={0.5}>
                                    <Pencil size={12} color={theme.palette.text.disabled} />
                                    <Typography variant="caption" color="text.disabled">
                                        {t('analizar_doc.editable_hint')}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Button size="small" variant="outlined" onClick={() => setFase('input')} sx={{ flexShrink: 0 }}>
                                {t('analizar_doc.volver_input')}
                            </Button>
                        </Stack>

                        {cotizanteGlobal !== null && (
                            <Box sx={{ p: 2, borderRadius: 2, border: cardBorder, bgcolor: theme.palette.action.hover }}>
                                <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 1.5 }}>
                                    {t('analizar_doc.cotizante_global_titulo')}
                                </Typography>
                                <Stack spacing={1.5}>
                                    <TextField select size="small" fullWidth
                                        value={cotizanteGlobal.tipo}
                                        onChange={(e) => setCotizanteGlobal((prev) => prev ? { ...prev, tipo: e.target.value as TipoCotizante } : prev)}>
                                        <MenuItem value="externo_nuevo">{t('analizar_doc.cotizante_nuevo')}</MenuItem>
                                        <MenuItem value="externo_existente">{t('analizar_doc.cotizante_externo')}</MenuItem>
                                        <MenuItem value="trabajador">{t('analizar_doc.cotizante_trabajador')}</MenuItem>
                                    </TextField>
                                    {cotizanteGlobal.tipo === 'externo_nuevo' && (
                                        <TextField size="small" fullWidth label={t('analizar_doc.nombre_cotizante')}
                                            value={cotizanteGlobal.nuevo_nombre}
                                            onChange={(e) => setCotizanteGlobal((prev) => prev ? { ...prev, nuevo_nombre: e.target.value } : prev)} />
                                    )}
                                    {cotizanteGlobal.tipo === 'externo_existente' && (
                                        <TextField select size="small" fullWidth
                                            value={cotizanteGlobal.proveedor_id}
                                            onChange={(e) => setCotizanteGlobal((prev) => prev ? { ...prev, proveedor_id: Number(e.target.value) } : prev)}>
                                            <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
                                            {proveedores.map((p) => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
                                        </TextField>
                                    )}
                                    {cotizanteGlobal.tipo === 'trabajador' && (
                                        <TextField select size="small" fullWidth
                                            value={cotizanteGlobal.trabajador_id}
                                            onChange={(e) => setCotizanteGlobal((prev) => prev ? { ...prev, trabajador_id: Number(e.target.value) } : prev)}>
                                            <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
                                            {jefes.map((tr) => <MenuItem key={tr.id} value={tr.id}>{tr.nombre} {tr.apellido}</MenuItem>)}
                                        </TextField>
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Desktop: tabla */}
                        <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                                        <TableCell padding="checkbox" />
                                        <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>{t('analizar_doc.col_descripcion')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, minWidth: 130 }}>{t('analizar_doc.col_especialidad')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>{t('analizar_doc.col_unidad')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, minWidth: 90 }}>{t('analizar_doc.col_cantidad')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>{t('analizar_doc.col_precio_unitario')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>{t('analizar_doc.col_precio_total')}</TableCell>
                                        {!cotizanteGlobal && (
                                            <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>{t('analizar_doc.col_cotizante')}</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sugerencias.map((sug, idx) => {
                                        const cot = cotizantes[idx];
                                        return (
                                            <TableRow key={sug._key}
                                                sx={{
                                                    opacity: sug.seleccionada ? 1 : 0.4,
                                                    bgcolor: sug.seleccionada ? 'transparent' : theme.palette.action.hover,
                                                    verticalAlign: 'top',
                                                }}>
                                                <TableCell padding="checkbox" sx={{ pt: 1.5 }}>
                                                    <Checkbox checked={sug.seleccionada} onChange={() => toggleSeleccion(idx)} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" fullWidth multiline maxRows={3}
                                                        value={sug._nombre_edit}
                                                        onChange={(e) => updateSugerencia(idx, { _nombre_edit: e.target.value })}
                                                        disabled={!sug.seleccionada}
                                                        sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Stack spacing={0.5}>
                                                        {renderSelectorEspecialidad(idx, sug)}
                                                        {sug.especialidad_id && sug._especialidad_id_edit === sug.especialidad_id && (
                                                            <Chip label="IA" size="small" icon={<Sparkles size={10} />}
                                                                sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(245,158,11,0.1)', color: '#B45309', fontWeight: 700, alignSelf: 'flex-start' }} />
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField select size="small" fullWidth
                                                        value={sug._unidad_edit}
                                                        onChange={(e) => updateSugerencia(idx, { _unidad_edit: e.target.value })}
                                                        disabled={!sug.seleccionada}>
                                                        <MenuItem value="">-</MenuItem>
                                                        {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                                    </TextField>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" fullWidth type="number"
                                                        value={sug._cantidad_edit}
                                                        onChange={(e) => updateSugerencia(idx, { _cantidad_edit: e.target.value })}
                                                        disabled={!sug.seleccionada}
                                                        inputProps={{ min: 0, step: 0.01 }}
                                                        sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" fullWidth type="number"
                                                        value={sug._precio_unitario_edit}
                                                        onChange={(e) => updateSugerencia(idx, { _precio_unitario_edit: e.target.value })}
                                                        disabled={!sug.seleccionada}
                                                        inputProps={{ min: 0 }}
                                                        sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" fullWidth type="number"
                                                        value={sug._precio_total_edit}
                                                        onChange={(e) => updateSugerencia(idx, { _precio_total_edit: e.target.value })}
                                                        disabled={!sug.seleccionada}
                                                        inputProps={{ min: 0 }}
                                                        sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
                                                </TableCell>
                                                {!cotizanteGlobal && (
                                                    <TableCell>
                                                        {sug.presupuesto && sug.seleccionada
                                                            ? renderCotizanteSelector(idx, cot)
                                                            : !sug.presupuesto
                                                                ? <Typography variant="caption" color="text.disabled">{t('analizar_doc.sin_presupuesto')}</Typography>
                                                                : null}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>

                        {/* Mobile: cards */}
                        <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
                            {sugerencias.map((sug, idx) => {
                                const cot = cotizantes[idx];
                                return (
                                    <Box key={sug._key} sx={{
                                        p: 2, borderRadius: 2, border: cardBorder,
                                        bgcolor: 'background.paper',
                                        opacity: sug.seleccionada ? 1 : 0.5,
                                        transition: 'opacity 0.2s',
                                    }}>
                                        <Stack direction="row" alignItems="flex-start" gap={1} sx={{ mb: 1.5 }}>
                                            <Checkbox checked={sug.seleccionada} onChange={() => toggleSeleccion(idx)} sx={{ mt: -0.5, flexShrink: 0 }} />
                                            <TextField size="small" fullWidth multiline maxRows={3}
                                                label={t('analizar_doc.col_descripcion')}
                                                value={sug._nombre_edit}
                                                onChange={(e) => updateSugerencia(idx, { _nombre_edit: e.target.value })}
                                                disabled={!sug.seleccionada}
                                                sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
                                        </Stack>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Stack spacing={0.5}>
                                                {renderSelectorEspecialidad(idx, sug)}
                                                {sug.especialidad_id && sug._especialidad_id_edit === sug.especialidad_id && (
                                                    <Chip label="Sugerida por IA" size="small" icon={<Sparkles size={10} />}
                                                        sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(245,158,11,0.1)', color: '#B45309', fontWeight: 700, alignSelf: 'flex-start' }} />
                                                )}
                                            </Stack>
                                        </Box>
                                        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                                            <TextField select size="small" fullWidth label={t('analizar_doc.col_unidad')}
                                                value={sug._unidad_edit}
                                                onChange={(e) => updateSugerencia(idx, { _unidad_edit: e.target.value })}
                                                disabled={!sug.seleccionada}>
                                                <MenuItem value="">-</MenuItem>
                                                {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                            </TextField>
                                            <TextField size="small" fullWidth type="number" label={t('analizar_doc.col_cantidad')}
                                                value={sug._cantidad_edit}
                                                onChange={(e) => updateSugerencia(idx, { _cantidad_edit: e.target.value })}
                                                disabled={!sug.seleccionada}
                                                inputProps={{ min: 0, step: 0.01 }}
                                                sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
                                        </Stack>
                                        <Stack direction="row" spacing={1} sx={{ mb: !cotizanteGlobal && sug.presupuesto ? 1.5 : 0 }}>
                                            <TextField size="small" fullWidth type="number" label={t('analizar_doc.col_precio_unitario')}
                                                value={sug._precio_unitario_edit}
                                                onChange={(e) => updateSugerencia(idx, { _precio_unitario_edit: e.target.value })}
                                                disabled={!sug.seleccionada}
                                                inputProps={{ min: 0 }}
                                                sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
                                            <TextField size="small" fullWidth type="number" label={t('analizar_doc.col_precio_total')}
                                                value={sug._precio_total_edit}
                                                onChange={(e) => updateSugerencia(idx, { _precio_total_edit: e.target.value })}
                                                disabled={!sug.seleccionada}
                                                inputProps={{ min: 0 }}
                                                sx={{ '& .MuiInputBase-root': { fontSize: 13 } }} />
                                        </Stack>
                                        {!cotizanteGlobal && (
                                            sug.presupuesto && sug.seleccionada
                                                ? renderCotizanteSelector(idx, cot)
                                                : !sug.presupuesto
                                                    ? <Typography variant="caption" color="text.disabled">{t('analizar_doc.sin_presupuesto')}</Typography>
                                                    : null
                                        )}
                                    </Box>
                                );
                            })}
                        </Stack>

                        <Box sx={{ p: 2, borderRadius: 2, border: cardBorder, bgcolor: theme.palette.action.hover }}>
                            <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                                {t('analizar_doc.resumen_titulo')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('analizar_doc.resumen_desc', {
                                    labores: sugerencias.filter((s) => s.seleccionada).length,
                                    presupuestos: sugerencias.filter((s) => s.seleccionada && s.presupuesto).length,
                                })}
                            </Typography>
                        </Box>

                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <Button variant="outlined" onClick={handleCloseWithConfirm}>{t('analizar_doc.cancelar')}</Button>
                            <Button
                                variant="contained"
                                onClick={handleConfirmar}
                                disabled={confirmando || sugerencias.filter((s) => s.seleccionada).length === 0 || !cotizantesValidos}
                                startIcon={confirmando ? <CircularProgress size={14} color="inherit" /> : <Sparkles size={14} />}
                            >
                                {confirmando
                                    ? t('analizar_doc.registrando')
                                    : t('analizar_doc.confirmar', { n: sugerencias.filter((s) => s.seleccionada).length })}
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>

        {/* ── Dialog de progreso separado ── */}
        <Dialog
            open={fase === 'progreso'}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
            <Box sx={{ p: 4 }}>
                <ProgresoOverlay items={progresoItems} />
            </Box>
        </Dialog>
    </>
);
};

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}