import React from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle,
  IconButton, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateMaterial } from '../../materiales/hooks/useMateriales';
import { useTiposMaterialList } from '../../materiales/hooks/useTipoMaterial';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props { open: boolean; onClose: () => void; onCreated: () => void; }

const UNIDADES = ['unidad', 'kg', 'litro', 'metro', 'm²', 'bolsa', 'barra', 'rollo', 'caja'];

export const NuevoMaterialRapidoModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const notify = useNotify();
  const { register, handleSubmit, reset, control } = useForm({ defaultValues: { nombre: '', unidad: '', stock_actual: '', precio_unitario: '', estado_id: '', tipo_material_id: '' } });
  const createMutation = useCreateMaterial();
  const { data: tipos = [] } = useTiposMaterialList();
  const { data: estados = [] } = useEstadosGenerales();

  const onSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        stock_actual: Number(values.stock_actual),
        precio_unitario: Number(values.precio_unitario),
        estado_id: Number(values.estado_id),
        tipo_material_id: values.tipo_material_id === '' ? null : Number(values.tipo_material_id),
      });
      notify.success('Material creado.');
      reset();
      onCreated();
      onClose();
    } catch {
      notify.error('No se pudo crear el material.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Nuevo material rápido</Typography>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField {...register('nombre')} fullWidth label="Nombre" required />
            <Controller name="unidad" control={control} render={({ field }) => (
              <TextField select fullWidth label="Unidad" value={field.value} onChange={field.onChange}>
                <MenuItem value="">Seleccionar</MenuItem>
                {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            )} />
            <TextField {...register('stock_actual')} fullWidth type="number" label="Stock inicial" required />
            <TextField {...register('precio_unitario')} fullWidth type="number" label="Precio unitario ($)" required />
            <Controller name="tipo_material_id" control={control} render={({ field }) => (
              <TextField select fullWidth label="Tipo (opcional)" value={field.value} onChange={field.onChange}>
                <MenuItem value="">Sin tipo</MenuItem>
                {tipos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
              </TextField>
            )} />
            <Controller name="estado_id" control={control} render={({ field }) => (
              <TextField select fullWidth label="Estado" value={field.value} onChange={field.onChange} required>
                <MenuItem value="">Seleccionar</MenuItem>
                {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
              </TextField>
            )} />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="outlined" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creando...' : 'Crear material'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};