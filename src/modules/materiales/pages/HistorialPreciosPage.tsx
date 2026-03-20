import React, { useState } from 'react';
import {
    Box, Card, CardContent, Divider, Grid, MenuItem,
    Paper, Table, TableBody, TableCell, TableHead,
    TableRow, TextField, Typography,
} from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
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
    const { data: historial = [], isLoading } = useHistorialIncrementos();
    const { data: materiales = [] } = useMaterialesList();
    const [materialFiltro, setMaterialFiltro] = useState<number | ''>('');

    const historialFiltrado = materialFiltro
        ? historial.filter((h) => h.material_id === materialFiltro)
        : historial;

    // Datos para el gráfico — agrupa por material
    const datosGrafico = historialFiltrado
        .slice()
        .reverse()
        .map((h) => ({
            fecha: formatDate(h.created_at),
            precio: Number(h.precio_nuevo),
            material: h.material_nombre,
        }));

    if (isLoading) return <LoadingState message="Cargando historial..." />;

    return (
        <AppLayout>
            <PageHeader
                title="Historial de precios"
                subtitle="Evolución de precios y ajustes aplicados a los materiales."
            />

            {/* Filtro por material */}
            <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
                <TextField
                    select fullWidth label="Filtrar por material"
                    value={materialFiltro}
                    onChange={(e) => setMaterialFiltro(e.target.value === '' ? '' : Number(e.target.value))}
                >
                    <MenuItem value="">Todos los materiales</MenuItem>
                    {materiales.map((m) => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
                </TextField>
            </Paper>

            {historialFiltrado.length === 0 && (
                <EmptyState title="Sin historial" description="Aún no se han aplicado ajustes de precios." />
            )}

            {historialFiltrado.length > 0 && (
                <Grid container spacing={3}>
                    {/* Gráfico */}
                    <Grid size={{ xs: 12 }}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                    Evolución de precios
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={datosGrafico}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#64748B' }} />
                                        <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `$${v.toLocaleString('es-AR')}`} />
                                        <Tooltip
                                            formatter={(value) => [`$${Number(value).toLocaleString('es-AR')}`, 'Precio']}
                                            labelStyle={{ color: '#0F172A', fontWeight: 700 }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone" dataKey="precio" name="Precio unitario"
                                            stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Tabla */}
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Material</TableCell>
                                        <TableCell>Precio anterior</TableCell>
                                        <TableCell>Precio nuevo</TableCell>
                                        <TableCell>% aplicado</TableCell>
                                        <TableCell>Motivo</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historialFiltrado.map((h) => (
                                        <TableRow key={h.id} hover>
                                            <TableCell>{formatDate(h.created_at)}</TableCell>
                                            <TableCell><Typography fontWeight={600}>{h.material_nombre}</Typography></TableCell>
                                            <TableCell>${Number(h.precio_anterior).toLocaleString('es-AR')}</TableCell>
                                            <TableCell>${Number(h.precio_nuevo).toLocaleString('es-AR')}</TableCell>
                                            <TableCell>
                                                <Box sx={{ color: '#F59E0B', fontWeight: 700 }}>+{h.porcentaje_aplicado}%</Box>
                                            </TableCell>
                                            <TableCell>{h.motivo || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </AppLayout>
    );
};