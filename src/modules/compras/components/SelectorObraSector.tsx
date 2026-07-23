
import { TextField, MenuItem, Box } from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { CompraFormValues } from '../schemas/compra.schema';
import { useObrasList } from '../../obras/hooks/useObras';
import { useSectoresPorObra } from '../../obras/hooks/useSectores';
import { flattenSectorTree, nombreCompletoSector, type Sector } from '../../obras/types/sector.types';

interface SelectorObraSectorProps {
  control: Control<CompraFormValues>;
  obraId: number;
  disableObra?: boolean;
  errorObra?: string;
}

function esHoja(sector: Sector, todos: Sector[]): boolean {
  return !todos.some((s) => s.parent_id === sector.id);
}

const rowSx = { display: 'flex', flexDirection: { xs: 'column', md: 'row' } as const, gap: 2 };
const fieldSx = { flex: 1, minWidth: 0 };

export function SelectorObraSector({ control, obraId, disableObra, errorObra }: SelectorObraSectorProps) {
  const { t } = useTranslation();
  const { data: obras = [] } = useObrasList();
  const { data: sectores = [] } = useSectoresPorObra(obraId);

  return (
    <Box sx={rowSx}>
      <Controller
        name="obra_id"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            fullWidth
            sx={fieldSx}
            label={t('compras.form.obra')}
            error={!!errorObra}
            helperText={errorObra}
            disabled={disableObra}
            onChange={(e) => field.onChange(Number(e.target.value))}
          >
            {obras.map((obra) => (
              <MenuItem key={obra.id} value={obra.id}>{obra.nombre}</MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="sector_id"
        control={control}
        render={({ field }) => {
          const arbol = flattenSectorTree(sectores);
          return (
            <TextField
              {...field}
              value={field.value ?? ''}
              select
              fullWidth
              sx={fieldSx}
              label={t('compras.form.sector')}
              disabled={!obraId || sectores.length === 0}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value="">{t('compras.form.sin_sector')}</MenuItem>
              {arbol.map(({ sector, depth }) => {
                const hoja = esHoja(sector, sectores);
                return (
                  <MenuItem key={sector.id} value={sector.id} disabled={!hoja} sx={{ pl: 2 + depth * 2 }}>
                    {nombreCompletoSector(sector)}
                  </MenuItem>
                );
              })}
            </TextField>
          );
        }}
      />
    </Box>
  );
}