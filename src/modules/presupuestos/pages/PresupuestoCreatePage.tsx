import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { PresupuestoForm } from '../components/PresupuestoForm';
import { useCreatePresupuesto } from '../hooks/usePresupuestos';
import { useNotify } from '../../../shared/hooks/useNotify';

export const PresupuestoCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const notify = useNotify();
    const createMutation = useCreatePresupuesto();

    const handleSubmit = async (values: any) => {
        const cleanValues = {
            ...values,
            labor_id: values.labor_id === '' ? null : Number(values.labor_id),
            obra_id: values.obra_id === '' ? null : Number(values.obra_id),
            estado_id: values.estado_id === '' ? null : Number(values.estado_id),
            costo_mano_obra: values.costo_mano_obra === '' ? 0 : Number(values.costo_mano_obra),
        };
        try {
            const created = await createMutation.mutateAsync(cleanValues);
            notify.success('Presupuesto creado.');
            navigate(`/presupuestos/${created.id}`);
        } catch {
            notify.error('No se pudo crear el presupuesto.');
        }
    };

    return (
        <AppLayout>
            <PageHeader
                title="Nuevo presupuesto"
                subtitle="Crear un presupuesto vinculado a una labor."
                actions={<Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/presupuestos')}>Volver</Button>}
            />
            <PresupuestoForm
  onSubmit={handleSubmit}
  isSubmitting={createMutation.isPending}
  hideEstado  // ← ocultar en create también
/>
        </AppLayout>
    );
};