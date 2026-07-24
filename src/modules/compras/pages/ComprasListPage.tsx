import React, { useMemo, useState } from 'react';
import {
    Box, Button, Card, CardContent, Chip, Grid, Stack, Tab, Tabs,
    TextField, MenuItem, Typography, useTheme, useMediaQuery,
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Plus, FileScan, ArrowUpDown } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { useComprasList } from '../hooks/useCompras';
import { useObrasList } from '../../obras/hooks/useObras';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { ComprasTable } from '../components/ComprasTable';
import { CompraFormDialog } from '../components/CompraFormDialog';
import { CompraDetailDialog } from '../components/CompraDetailDialog';
import { ComprobanteMultiItemDialog } from '../components/ComprobanteMultiItemDialog';
import type { Compra } from '../types/compra.types';

const CHART_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4', '#EC4899'];

function formatMoney(n: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

type ModoFecha = 'rango' | 'mes';

export function ComprasListPage() {
    const theme = useTheme();
    const { t } = useTranslation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { data: compras = [], isLoading } = useComprasList();
    const { data: obras = [] } = useObrasList();
    const { data: especialidades = [] } = useEspecialidadesList();

    const [tab, setTab] = useState(0);
    const [formDialogOpen, setFormDialogOpen] = React.useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
    const [multiItemOpen, setMultiItemOpen] = React.useState(false);
    const [compraSeleccionada, setCompraSeleccionada] = React.useState<Compra | null>(null);

    // ── Filtros ──
    const [filtroObra, setFiltroObra] = useState<number | ''>('');
    const [filtroEspecialidad, setFiltroEspecialidad] = useState<number | ''>('');
    const [modoFecha, setModoFecha] = useState<ModoFecha>('rango');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [mes, setMes] = useState('');
    const [orden, setOrden] = useState<'fecha_desc' | 'monto_desc' | 'monto_asc'>('fecha_desc');

    const comprasFiltradas = useMemo(() => {
        let result = [...compras];

        if (filtroObra) result = result.filter((c) => c.obra_id === filtroObra);
        if (filtroEspecialidad) result = result.filter((c) => c.especialidad_id === filtroEspecialidad);

        if (modoFecha === 'rango') {
            if (fechaDesde) result = result.filter((c) => c.fecha >= fechaDesde);
            if (fechaHasta) result = result.filter((c) => c.fecha <= fechaHasta);
        } else if (modoFecha === 'mes' && mes) {
            result = result.filter((c) => c.fecha.slice(0, 7) === mes);
        }

        if (orden === 'monto_desc') result.sort((a, b) => Number(b.monto) - Number(a.monto));
        else if (orden === 'monto_asc') result.sort((a, b) => Number(a.monto) - Number(b.monto));
        else result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        return result;
    }, [compras, filtroObra, filtroEspecialidad, modoFecha, fechaDesde, fechaHasta, mes, orden]);

    const hayFiltrosActivos = !!filtroObra || !!filtroEspecialidad || !!fechaDesde || !!fechaHasta || !!mes;
    const limpiarFiltros = () => {
        setFiltroObra('');
        setFiltroEspecialidad('');
        setFechaDesde('');
        setFechaHasta('');
        setMes('');
        setOrden('fecha_desc');
    };

    const stats = useMemo(() => {
        const total = comprasFiltradas.length;
        const montoTotal = comprasFiltradas.reduce((acc, c) => acc + Number(c.monto), 0);
        const conMaterial = comprasFiltradas.filter((c) => c.material_id).length;
        const gastosGenerales = comprasFiltradas.filter((c) => !c.material_id).length;

        const porObra = Object.values(
            comprasFiltradas.reduce((acc, c) => {
                const key = c.obra_nombre ?? 'Sin obra';
                if (!acc[key]) acc[key] = { nombre: key, total: 0, cantidad: 0 };
                acc[key].total += Number(c.monto);
                acc[key].cantidad += 1;
                return acc;
            }, {} as Record<string, { nombre: string; total: number; cantidad: number }>)
        ).sort((a, b) => b.total - a.total);

        return { total, montoTotal, conMaterial, gastosGenerales, porObra };
    }, [comprasFiltradas]);

    const handleNueva = () => { setCompraSeleccionada(null); setFormDialogOpen(true); };
    const handleEdit = (compra: Compra) => { setCompraSeleccionada(compra); setFormDialogOpen(true); };
    const handleView = (compra: Compra) => { setCompraSeleccionada(compra); setDetailDialogOpen(true); };
    const handleEditFromDetail = () => { setDetailDialogOpen(false); setFormDialogOpen(true); };

    const tickColor = theme.palette.text.secondary;
    const tooltipBg = theme.palette.background.paper;
    const tooltipBorder = theme.palette.divider;

    return (
        <AppLayout>
            <PageHeader
                title={t('compras.title')}
                actions={
                    <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', md: 'auto' } }}>
                        <Button variant="outlined" fullWidth={isMobile} startIcon={<FileScan size={18} />} onClick={() => setMultiItemOpen(true)}>
                            {t('compras.multi_item.boton')}
                        </Button>
                        <Button variant="contained" fullWidth={isMobile} startIcon={<Plus size={18} />} onClick={handleNueva}>
                            {t('compras.nueva')}
                        </Button>
                    </Box>
                }
            />

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Tab label={t('compras.tabs.listado')} />
                <Tab label={t('compras.tabs.estadisticas')} />
            </Tabs>

            {/* ── TAB 0: LISTADO ── */}
            {tab === 0 && (
                <>
                    <Card elevation={0} sx={{ borderRadius: 3, mb: 2, p: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(auto-fit, minmax(150px, 1fr))' },
                            gap: 1.5,
                            alignItems: 'center',
                        }}>
                            <TextField select size="small" label={t('compras.form.obra')} fullWidth
                                value={filtroObra}
                                onChange={(e) => setFiltroObra(e.target.value === '' ? '' : Number(e.target.value))}>
                                <MenuItem value="">Todas</MenuItem>
                                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
                            </TextField>

                            <TextField select size="small" label={t('compras.form.especialidad')} fullWidth
                                value={filtroEspecialidad}
                                onChange={(e) => setFiltroEspecialidad(e.target.value === '' ? '' : Number(e.target.value))}>
                                <MenuItem value="">Todas</MenuItem>
                                {especialidades.map((esp) => <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>)}
                            </TextField>

                            <TextField select size="small" label={t('compras.filtros.modo_fecha')} fullWidth
                                value={modoFecha}
                                onChange={(e) => { setModoFecha(e.target.value as ModoFecha); setFechaDesde(''); setFechaHasta(''); setMes(''); }}>
                                <MenuItem value="rango">{t('compras.filtros.rango')}</MenuItem>
                                <MenuItem value="mes">{t('compras.filtros.mes')}</MenuItem>
                            </TextField>

                            <TextField select size="small" label="Ordenar por" fullWidth
                                value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)}
                                InputProps={{ startAdornment: <ArrowUpDown size={14} style={{ marginRight: 6, opacity: 0.6 }} /> }}>
                                <MenuItem value="fecha_desc">Más reciente</MenuItem>
                                <MenuItem value="monto_desc">Mayor monto</MenuItem>
                                <MenuItem value="monto_asc">Menor monto</MenuItem>
                            </TextField>

                            {modoFecha === 'rango' ? (
                                <>
                                    <TextField size="small" type="date" label={t('compras.filtros.desde')} fullWidth
                                        value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} InputLabelProps={{ shrink: true }} />
                                    <TextField size="small" type="date" label={t('compras.filtros.hasta')} fullWidth
                                        value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
                                </>
                            ) : (
                                <TextField size="small" type="month" label={t('compras.filtros.mes')} fullWidth
                                    value={mes} onChange={(e) => setMes(e.target.value)} InputLabelProps={{ shrink: true }}
                                    sx={{ gridColumn: { xs: 'span 2', sm: 'auto' } }} />
                            )}
                        </Box>

                        {hayFiltrosActivos && (
                            <Button size="small" onClick={limpiarFiltros} sx={{ mt: 1.5 }}>
                                Limpiar filtros
                            </Button>
                        )}
                    </Card>

                    {isLoading && <LoadingState message={t('compras.loading')} />}

                    {!isLoading && comprasFiltradas.length === 0 && (
                        <EmptyState
                            title={t('compras.empty.title')}
                            description={t('compras.empty.desc')}
                            action={<Button variant="contained" onClick={handleNueva}>{t('compras.nueva')}</Button>}
                        />
                    )}

                    {!isLoading && comprasFiltradas.length > 0 && (
                        <ComprasTable compras={comprasFiltradas} isLoading={isLoading} isMobile={isMobile} onView={handleView} onEdit={handleEdit} />
                    )}
                </>
            )}

            {/* ── TAB 1: ESTADÍSTICAS ── */}
            {tab === 1 && (
                <Stack spacing={3}>
                    <Grid container spacing={2}>
                        {[
                            { label: t('compras.stats.total_compras'), value: stats.total, color: '#F59E0B', isCount: true },
                            { label: t('compras.stats.monto_total'), value: stats.montoTotal, color: '#3B82F6' },
                            { label: t('compras.stats.con_material'), value: stats.conMaterial, color: '#16A34A', isCount: true },
                            { label: t('compras.stats.gastos_generales'), value: stats.gastosGenerales, color: '#8B5CF6', isCount: true },
                        ].map((kpi) => (
                            <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
                                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{kpi.label}</Typography>
                                        <Typography variant="h4" fontWeight={800} color={kpi.color} sx={{ mt: 0.5 }}>
                                            {kpi.isCount ? kpi.value : formatMoney(kpi.value as number)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>{t('compras.stats.por_obra')}</Typography>
                            {stats.porObra.length === 0 ? (
                                <Typography color="text.disabled" textAlign="center" py={3}>{t('compras.stats.sin_datos')}</Typography>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart
                                            data={stats.porObra}
                                            margin={{ top: 4, right: 4, left: 0, bottom: 60 }}
                                            onClick={(e: any) => {
                                                const nombre = e?.activeLabel;
                                                const obra = obras.find((o) => o.nombre === nombre);
                                                if (obra) setFiltroObra(obra.id);
                                                setTab(0);
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: tickColor }} angle={-35} textAnchor="end" interval={0} />
                                            <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip formatter={(v) => [formatMoney(Number(v)), t('compras.tabla.monto')]}
                                                contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }} />
                                            <Bar dataKey="total" radius={[4, 4, 0, 0]} cursor="pointer">
                                                {stats.porObra.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        {stats.porObra.map((item, i) => (
                                            <Stack key={item.nombre} direction="row" alignItems="center" justifyContent="space-between"
                                                sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover }}>
                                                <Stack direction="row" alignItems="center" gap={1.5}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length], minWidth: 20 }}>
                                                        {i + 1}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>{item.nombre}</Typography>
                                                    <Chip label={`${item.cantidad} compra${item.cantidad !== 1 ? 's' : ''}`} size="small"
                                                        sx={{ bgcolor: `${CHART_COLORS[i % CHART_COLORS.length]}18`, color: CHART_COLORS[i % CHART_COLORS.length], fontWeight: 700, fontSize: 11 }} />
                                                </Stack>
                                                <Typography variant="body2" fontWeight={800} color={CHART_COLORS[i % CHART_COLORS.length]}>
                                                    {formatMoney(item.total)}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Stack>
            )}

            <CompraFormDialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)} compra={compraSeleccionada} />
            <CompraDetailDialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} compra={compraSeleccionada} onEdit={handleEditFromDetail} />
            <ComprobanteMultiItemDialog open={multiItemOpen} onClose={() => setMultiItemOpen(false)} />
        </AppLayout>
    );
}