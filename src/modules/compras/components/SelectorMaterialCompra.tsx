import { TextField, MenuItem, Box, FormControlLabel, Switch } from '@mui/material';
import { Controller, type Control, type UseFormWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { CompraFormValues } from '../schemas/compra.schema';
import { useMaterialesList } from '../../materiales/hooks/useMateriales';

interface SelectorMaterialCompraProps {
  control: Control<CompraFormValues>;
  watch: UseFormWatch<CompraFormValues>;
  errorMaterial?: string;
}

const rowSx = { display: 'flex', flexDirection: { xs: 'column', md: 'row' } as const, gap: 2 };
const fieldSx = { flex: 1, minWidth: 0 };

export function SelectorMaterialCompra({ control, watch, errorMaterial }: SelectorMaterialCompraProps) {
  const { t } = useTranslation();
  const { data: materiales = [] } = useMaterialesList();
  const esCompraMaterial = watch('es_compra_material');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Controller
        name="es_compra_material"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
            label={t('compras.form.es_compra_material')}
          />
        )}
      />

      {esCompraMaterial && (
        <Box sx={rowSx}>
          <Controller
            name="material_id"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                select
                fullWidth
                sx={fieldSx}
                label={t('compras.form.material')}
                error={!!errorMaterial}
                helperText={errorMaterial}
                onChange={(e) => field.onChange(Number(e.target.value))}
              >
                {materiales.map((mat) => (
                  <MenuItem key={mat.id} value={mat.id}>{mat.nombre} ({mat.unidad})</MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="cantidad"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                type="number"
                fullWidth
                sx={fieldSx}
                label={t('compras.form.cantidad')}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
              />
            )}
          />
        </Box>
      )}
    </Box>
  );
}