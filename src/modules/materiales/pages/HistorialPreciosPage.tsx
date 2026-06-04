
import React, { useState } from 'react';
import {
    Box, Card, CardContent, Chip, Divider, Grid, MenuItem,
    Paper, Stack, Table, TableBody, TableCell, TableHead,
    TableRow, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { useHistorialIncrementos } from '../hooks/useHistorialIncrementos';
import { useMaterialesList } from '../hooks/useMateriales';

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const HistorialPreciosPage: React.FC = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { data: historial = [], isLoading } = useHistorialIncrementos();
    const { data: materiales = [] } = useMaterialesList();
    const [materialFiltro, setMaterialFiltro] = useState<number | ''>('');

    const historialFiltrado = materialFiltro
        ? historial.filter((h) => h.material_id === materialFiltro)
        : historial;

    const datosGrafico = historialFiltrado
        .slice()
        .reverse()
        .map((h) => ({
            fecha: formatDate(h.created_at),
            precio: Number(h.precio_nuevo),
            material: h.material_nombre,
        }));

    if (isLoading) return <LoadingState message={t('historial_precios.loading')} />;

    return (
        <AppLayout>
            <PageHeader
                title={t('historial_precios.title')}
                subtitle={t('historial_precios.subtitle')}
            />

            {/* Filtro */}
            <Paper sx={{ p: 2, borderRadius: 3, mb: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                <TextField
                    select fullWidth label={t('historial_precios.filtro')}
                    value={materialFiltro}
                    onChange={(e) => setMaterialFiltro(e.target.value === '' ? '' : Number(e.target.value))}
                >
                    <MenuItem value="">{t('historial_precios.todos')}</MenuItem>
                    {materiales.map((m) => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
                </TextField>
            </Paper>

            {historialFiltrado.length === 0 && (
                <EmptyState
                    title={t('historial_precios.empty.title')}
                    description={t('historial_precios.empty.desc')}
                />
            )}

            {historialFiltrado.length > 0 && (
                <Grid container spacing={3}>

                    {/* Gráfico */}
                    <Grid size={{ xs: 12 }}>
                        <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                    {t('historial_precios.grafico_titulo')}
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={datosGrafico}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                            tickFormatter={(v) => `$${v.toLocaleString('es-AR')}`}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`$${Number(value).toLocaleString('es-AR')}`, t('historial_precios.precio_label')]}
                                            labelStyle={{ color: theme.palette.text.primary, fontWeight: 700 }}
                                            contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider, borderRadius: 8 }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone" dataKey="precio"
                                            name={t('historial_precios.precio_unitario')}
                                            stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Vista mobile — cards */}
                    {isMobile && (
                        <Grid size={{ xs: 12 }}>
                            <Stack spacing={2}>
                                {historialFiltrado.map((h) => (
                                    <Card key={h.id} elevation={0} sx={{
                                        borderRadius: 3,
                                        border: `1px solid ${theme.palette.divider}`,
                                        bgcolor: 'background.paper',
                                    }}>
                                        <CardContent sx={{ p: 2 }}>
                                            {/* Header — material + fecha */}
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                                                <Typography variant="body2" fontWeight={700} color="text.primary">
                                                    {h.material_nombre}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    {formatDate(h.created_at)}
                                                </Typography>
                                            </Stack>

                                            {/* Precios */}
                                            <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                                                <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover }}>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {t('historial_precios.tabla.precio_anterior')}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                                        ${Number(h.precio_anterior).toLocaleString('es-AR')}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {t('historial_precios.tabla.precio_nuevo')}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={700} color="#F59E0B">
                                                        ${Number(h.precio_nuevo).toLocaleString('es-AR')}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            {/* Porcentaje + motivo */}
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Chip
                                                    label={`+${h.porcentaje_aplicado}%`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(245,158,11,0.12)',
                                                        color: '#F59E0B',
                                                        fontWeight: 700,
                                                        fontSize: 12,
                                                    }}
                                                />
                                                {h.motivo && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 180, textAlign: 'right' }}>
                                                        {h.motivo}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </Grid>
                    )}

                    {/* Vista desktop — tabla */}
                    {!isMobile && (
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('historial_precios.tabla.fecha')}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('historial_precios.tabla.material')}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('historial_precios.tabla.precio_anterior')}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('historial_precios.tabla.precio_nuevo')}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('historial_precios.tabla.porcentaje')}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('historial_precios.tabla.motivo')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {historialFiltrado.map((h) => (
                                            <TableRow key={h.id} hover>
                                                <TableCell>{formatDate(h.created_at)}</TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{h.material_nombre}</Typography>
                                                </TableCell>
                                                <TableCell>${Number(h.precio_anterior).toLocaleString('es-AR')}</TableCell>
                                                <TableCell>${Number(h.precio_nuevo).toLocaleString('es-AR')}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`+${h.porcentaje_aplicado}%`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'rgba(245,158,11,0.12)',
                                                            color: '#F59E0B',
                                                            fontWeight: 700,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{h.motivo || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Grid>
                    )}

                </Grid>
            )}
        </AppLayout>
    );
};