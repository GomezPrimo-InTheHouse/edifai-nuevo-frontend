import React, { useState } from 'react';
import {
    Box, Button, Checkbox, CircularProgress, Dialog, DialogContent,
    DialogTitle, Divider, IconButton, MenuItem, Stack, Tab, Tabs,
    Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Typography, useTheme,
} from '@mui/material';
import { FileText, Upload, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnalizarDocumento } from '../hooks/useLaborPresupuestos';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useProveedoresExternos, useCreateProveedorExterno } from '../hooks/useLaborPresupuestos';
import { laborApi } from '../../../services/api/labor.api';
import { laborPresupuestosApi } from '../../../services/api/laborPresupuestos.api';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useQueryClient } from '@tanstack/react-query';
import { laboresQueryKeys } from '../hooks/useLabores';
import type { LaborSugerencia } from '../types/labor.types';

interface Props {
    open: boolean;
    obra_id: number;
    onClose: () => void;
}

type TipoCotizante = 'trabajador' | 'externo_existente' | 'externo_nuevo';

interface FilaCotizante {
    tipo: TipoCotizante;
    trabajador_id: number | '';
    proveedor_id: number | '';
    nuevo_nombre: string;
}

const defaultCotizante = (): FilaCotizante => ({
    tipo: 'externo_nuevo',
    trabajador_id: '',
    proveedor_id: '',
    nuevo_nombre: '',
});

export const AnalizarDocumentoModal: React.FC<Props> = ({ open, obra_id, onClose }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const notify = useNotify();
    const queryClient = useQueryClient();

    const [tab, setTab] = useState(0); // 0=archivo, 1=texto
    const [archivo, setArchivo] = useState<File | null>(null);
    const [textoLibre, setTextoLibre] = useState('');
    const [sugerencias, setSugerencias] = useState<LaborSugerencia[]>([]);
    const [cotizantes, setCotizantes] = useState<FilaCotizante[]>([]);
    const [confirmando, setConfirmando] = useState(false);
    const [fase, setFase] = useState<'input' | 'revision'>('input');

    const analizarMutation = useAnalizarDocumento();
    const createProveedor = useCreateProveedorExterno();
    const { data: trabajadores = [] } = useTrabajadoresList();
    const { data: proveedores = [] } = useProveedoresExternos();
    const jefes = trabajadores.filter((tr) => tr.jefe_id === null);

    const handleClose = () => {
        setTab(0);
        setArchivo(null);
        setTextoLibre('');
        setSugerencias([]);
        setCotizantes([]);
        setFase('input');
        onClose();
    };

    const handleAnalizar = async () => {
        try {
            let resultado;
            if (tab === 0 && archivo) {
                const base64 = await fileToBase64(archivo);
                resultado = await analizarMutation.mutateAsync({
                    imagen_base64: base64,
                    media_type: archivo.type,
                });
            } else if (tab === 1 && textoLibre.trim()) {
                resultado = await analizarMutation.mutateAsync({ texto_libre: textoLibre });
            } else {
                notify.error(t('analizar_doc.error_sin_input'));
                return;
            }

            setSugerencias(resultado.labores.map((l) => ({ ...l, seleccionada: true })));
            setCotizantes(resultado.labores.map(() => {
                const c = defaultCotizante();
                if (resultado.cotizante_global) c.nuevo_nombre = resultado.cotizante_global;
                return c;
            }));
            setFase('revision');
        } catch {
            notify.error(t('analizar_doc.error_analisis'));
        }
    };

    const toggleSeleccion = (idx: number) => {
        setSugerencias((prev) => prev.map((s, i) => i === idx ? { ...s, seleccionada: !s.seleccionada } : s));
    };

    const updateCotizante = (idx: number, patch: Partial<FilaCotizante>) => {
        setCotizantes((prev) => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
    };

    const handleConfirmar = async () => {
        const seleccionadas = sugerencias.filter((s) => s.seleccionada);
        if (seleccionadas.length === 0) {
            notify.error(t('analizar_doc.error_sin_seleccion'));
            return;
        }

        setConfirmando(true);
        try {
            for (let i = 0; i < sugerencias.length; i++) {
                const sug = sugerencias[i];
                if (!sug.seleccionada) continue;

                const cot = cotizantes[i];

                // 1. Crear labor
                const labor = await laborApi.create({
                    nombre: sug.descripcion.substring(0, 490),
                    descripcion: sug.descripcion,
                    obra_id,
                    modo: 'cotizacion',
                    unidad_id: sug.unidad_id ?? undefined,
                    cantidad: sug.cantidad ?? undefined,
                } as any);

                // 2. Resolver cotizante
                if (sug.presupuesto) {
                    let trabajador_id: number | null = null;
                    let proveedor_externo_id: number | null = null;

                    if (cot.tipo === 'trabajador' && cot.trabajador_id) {
                        trabajador_id = Number(cot.trabajador_id);
                    } else if (cot.tipo === 'externo_existente' && cot.proveedor_id) {
                        proveedor_externo_id = Number(cot.proveedor_id);
                    } else if (cot.tipo === 'externo_nuevo' && cot.nuevo_nombre.trim()) {
                        const nuevo = await createProveedor.mutateAsync({ nombre: cot.nuevo_nombre.trim() });
                        proveedor_externo_id = nuevo.id;
                    }

                    if (trabajador_id || proveedor_externo_id) {
                        await laborPresupuestosApi.create(labor.id, {
                            trabajador_id,
                            proveedor_externo_id,
                            precio_unitario: sug.presupuesto.precio_unitario ?? 0,
                            cantidad: sug.cantidad ?? undefined,
                            notas: sug.presupuesto.notas ?? undefined,
                            plazo_dias: sug.presupuesto.plazo_dias ?? undefined,
                        });
                    }
                }
            }

            queryClient.invalidateQueries({ queryKey: laboresQueryKeys.all });
            notify.success(t('analizar_doc.registrado_ok', { n: seleccionadas.length }));
            handleClose();
        } catch {
            notify.error(t('analizar_doc.error_registro'));
        } finally {
            setConfirmando(false);
        }
    };

    const cardBorder = `1px solid ${theme.palette.divider}`;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Sparkles size={18} color="#F59E0B" />
                        <Typography variant="h6" fontWeight={700}>{t('analizar_doc.titulo')}</Typography>
                    </Stack>
                    <IconButton size="small" onClick={handleClose}><X size={18} /></IconButton>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 3 }}>

                {/* ── FASE INPUT ── */}
                {fase === 'input' && (
                    <Stack spacing={3}>
                        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                            <Tab label={t('analizar_doc.tab_archivo')} icon={<Upload size={14} />} iconPosition="start" />
                            <Tab label={t('analizar_doc.tab_texto')} icon={<FileText size={14} />} iconPosition="start" />
                        </Tabs>

                        {tab === 0 && (
                            <Box
                                sx={{
                                    border: `2px dashed ${theme.palette.divider}`,
                                    borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer',
                                    bgcolor: theme.palette.action.hover,
                                    '&:hover': { borderColor: theme.palette.primary.main },
                                }}
                                onClick={() => document.getElementById('file-input')?.click()}
                            >
                                <input
                                    id="file-input" type="file" hidden
                                    accept=".pdf,image/*"
                                    onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                                />
                                <Upload size={32} color={theme.palette.text.disabled} />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {archivo ? archivo.name : t('analizar_doc.drop_hint')}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    {t('analizar_doc.formatos')}
                                </Typography>
                            </Box>
                        )}

                        {tab === 1 && (
                            <TextField
                                multiline minRows={8} fullWidth
                                label={t('analizar_doc.texto_label')}
                                placeholder={t('analizar_doc.texto_placeholder')}
                                value={textoLibre}
                                onChange={(e) => setTextoLibre(e.target.value)}
                            />
                        )}

                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                startIcon={analizarMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <Sparkles size={14} />}
                                onClick={handleAnalizar}
                                disabled={analizarMutation.isPending || (tab === 0 ? !archivo : !textoLibre.trim())}
                            >
                                {analizarMutation.isPending ? t('analizar_doc.analizando') : t('analizar_doc.analizar')}
                            </Button>
                        </Stack>
                    </Stack>
                )}

                {/* ── FASE REVISIÓN ── */}
                {fase === 'revision' && (
                    <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                                {t('analizar_doc.revision_desc', { n: sugerencias.filter((s) => s.seleccionada).length, total: sugerencias.length })}
                            </Typography>
                            <Button size="small" variant="outlined" onClick={() => setFase('input')}>
                                {t('analizar_doc.volver_input')}
                            </Button>
                        </Stack>

                        <Box sx={{ overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                                        <TableCell padding="checkbox" />
                                        <TableCell sx={{ fontWeight: 700 }}>{t('analizar_doc.col_descripcion')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{t('analizar_doc.col_unidad')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{t('analizar_doc.col_cantidad')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{t('analizar_doc.col_precio_unitario')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{t('analizar_doc.col_precio_total')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>{t('analizar_doc.col_cotizante')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sugerencias.map((sug, idx) => {
                                        const cot = cotizantes[idx];
                                        return (
                                            <TableRow
                                                key={sug._key}
                                                sx={{ opacity: sug.seleccionada ? 1 : 0.4, bgcolor: sug.seleccionada ? 'transparent' : theme.palette.action.hover }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox checked={sug.seleccionada} onChange={() => toggleSeleccion(idx)} />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>{sug.descripcion}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{sug.unidad_simbolo ?? '-'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{sug.cantidad ?? '-'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {sug.presupuesto?.precio_unitario
                                                            ? `$${Number(sug.presupuesto.precio_unitario).toLocaleString('es-AR')}`
                                                            : '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {sug.presupuesto?.precio_total
                                                            ? `$${Number(sug.presupuesto.precio_total).toLocaleString('es-AR')}`
                                                            : '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {sug.presupuesto && sug.seleccionada && (
                                                        <Stack spacing={1}>
                                                            <TextField
                                                                select size="small" fullWidth
                                                                value={cot.tipo}
                                                                onChange={(e) => updateCotizante(idx, { tipo: e.target.value as TipoCotizante })}
                                                            >
                                                                <MenuItem value="externo_nuevo">{t('analizar_doc.cotizante_nuevo')}</MenuItem>
                                                                <MenuItem value="externo_existente">{t('analizar_doc.cotizante_externo')}</MenuItem>
                                                                <MenuItem value="trabajador">{t('analizar_doc.cotizante_trabajador')}</MenuItem>
                                                            </TextField>

                                                            {cot.tipo === 'externo_nuevo' && (
                                                                <TextField
                                                                    size="small" fullWidth
                                                                    label={t('analizar_doc.nombre_cotizante')}
                                                                    value={cot.nuevo_nombre}
                                                                    onChange={(e) => updateCotizante(idx, { nuevo_nombre: e.target.value })}
                                                                />
                                                            )}
                                                            {cot.tipo === 'externo_existente' && (
                                                                <TextField
                                                                    select size="small" fullWidth
                                                                    value={cot.proveedor_id}
                                                                    onChange={(e) => updateCotizante(idx, { proveedor_id: Number(e.target.value) })}
                                                                >
                                                                    <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
                                                                    {proveedores.map((p) => (
                                                                        <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                                                                    ))}
                                                                </TextField>
                                                            )}
                                                            {cot.tipo === 'trabajador' && (
                                                                <TextField
                                                                    select size="small" fullWidth
                                                                    value={cot.trabajador_id}
                                                                    onChange={(e) => updateCotizante(idx, { trabajador_id: Number(e.target.value) })}
                                                                >
                                                                    <MenuItem value="">{t('analizar_doc.seleccionar')}</MenuItem>
                                                                    {jefes.map((tr) => (
                                                                        <MenuItem key={tr.id} value={tr.id}>{tr.nombre} {tr.apellido}</MenuItem>
                                                                    ))}
                                                                </TextField>
                                                            )}
                                                        </Stack>
                                                    )}
                                                    {!sug.presupuesto && (
                                                        <Typography variant="caption" color="text.disabled">
                                                            {t('analizar_doc.sin_presupuesto')}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>

                        {/* Resumen antes de confirmar */}
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
                            <Button variant="outlined" onClick={handleClose}>{t('analizar_doc.cancelar')}</Button>
                            <Button
                                variant="contained"
                                onClick={handleConfirmar}
                                disabled={confirmando || sugerencias.filter((s) => s.seleccionada).length === 0}
                                startIcon={confirmando ? <CircularProgress size={14} color="inherit" /> : <Sparkles size={14} />}
                            >
                                {confirmando ? t('analizar_doc.registrando') : t('analizar_doc.confirmar', { n: sugerencias.filter((s) => s.seleccionada).length })}
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
};

// ── Helper ────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}