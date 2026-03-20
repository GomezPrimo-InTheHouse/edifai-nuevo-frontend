import React, { useState } from 'react';
import {
    Box, Button, IconButton, Paper, Stack, Table, TableBody,
    TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import { AgregarMaterialModal } from './AgregarMaterialModal';
import { useMaterialesByPresupuesto, useRemoveMaterialFromPresupuesto } from '../hooks/usePresupuestoMateriales';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props { presupuestoId: number; confirmado?: boolean; }

export const MaterialesPresupuesto: React.FC<Props> = ({ presupuestoId, confirmado = false }) => {
    const notify = useNotify();
    const [agregarOpen, setAgregarOpen] = useState(false);
    const { data: materiales = [], isLoading } = useMaterialesByPresupuesto(presupuestoId);
    const removeMutation = useRemoveMaterialFromPresupuesto(presupuestoId);

    const handleRemove = async (id: number) => {
        const confirmed = await notify.confirm({
            title: '¿Quitar material?',
            message: 'Se eliminará este material del presupuesto.',
            confirmLabel: 'Quitar',
            severity: 'warning',
        });
        if (!confirmed) return;
        try {
            await removeMutation.mutateAsync(id);
            notify.success('Material quitado.');
        } catch {
            notify.error('No se pudo quitar el material.');
        }
    };

    const total = materiales.reduce((acc, m) => acc + Number(m.subtotal), 0);

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Materiales del presupuesto</Typography>
                {!confirmado && (
                    <Button variant="outlined" startIcon={<Plus size={16} />} onClick={() => setAgregarOpen(true)}>
                        Agregar material
                    </Button>
                )}
            </Stack>

            {isLoading && <Typography variant="body2" color="text.secondary">Cargando...</Typography>}

            {!isLoading && materiales.length === 0 && (
                <Box sx={{ py: 4, textAlign: 'center', color: '#94A3B8' }}>
                    <Typography variant="body2">No hay materiales en este presupuesto.</Typography>
                </Box>
            )}

            {materiales.length > 0 && (
                <>
                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                        <Paper sx={{ borderRadius: 2, overflow: 'hidden', minWidth: 500 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Material</TableCell>
                                        <TableCell>Cantidad</TableCell>
                                        <TableCell>Precio unitario</TableCell>
                                        <TableCell>Subtotal</TableCell>
                                        {!confirmado && <TableCell align="right">Acciones</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {materiales.map((m) => (
                                        <TableRow key={m.id}>
                                            <TableCell><Typography fontWeight={600}>{m.material_nombre}</Typography></TableCell>
                                            <TableCell>{m.cantidad} {m.unidad}</TableCell>
                                            <TableCell>${Number(m.precio_unitario).toLocaleString('es-AR')}</TableCell>
                                            <TableCell><Typography fontWeight={600}>${Number(m.subtotal).toLocaleString('es-AR')}</Typography></TableCell>
                                            {!confirmado && (
                                                <TableCell align="right">
                                                    <IconButton size="small" color="error" onClick={() => handleRemove(m.id)}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Box>

                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0F172A', color: '#FFFFFF', minWidth: 200, textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>SUBTOTAL MATERIALES</Typography>
                            <Typography variant="h6" fontWeight={800}>${total.toLocaleString('es-AR')}</Typography>
                        </Box>
                    </Stack>
                </>
            )}

            <AgregarMaterialModal open={agregarOpen} onClose={() => setAgregarOpen(false)} presupuestoId={presupuestoId} />
        </Box>
    );
};