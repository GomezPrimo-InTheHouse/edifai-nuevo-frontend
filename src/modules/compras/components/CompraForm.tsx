import React from 'react';
import { Box, TextField, MenuItem, Switch, FormControlLabel, Button, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { compraSchema, type CompraFormValues } from '../schemas/compra.schema';
import { useObrasList } from '../../obras/hooks/useObras';
import { useSectoresPorObra } from '../../obras/hooks/useSectores';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { useMaterialesList } from '../../materiales/hooks/useMateriales';
import { useUploadComprobante, useAnalizarComprobanteConIA } from '../hooks/useCompras';
import { flattenSectorTree, nombreCompletoSector, type Sector } from '../../obras/types/sector.types';

interface CompraFormProps {
  defaultValues?: Partial<CompraFormValues>;
  onSubmit: (values: CompraFormValues) => void;
  isSubmitting?: boolean;
}

function esHoja(sector: Sector, todos: Sector[]): boolean {
  return !todos.some((s) => s.parent_id === sector.id);
}

const rowSx = { display: 'flex', flexDirection: { xs: 'column', md: 'row' } as const, gap: 2 };
const fieldSx = { flex: 1, minWidth: 0 };

export function CompraForm({ defaultValues, onSubmit, isSubmitting }: CompraFormProps) {
  const { t } = useTranslation();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CompraFormValues>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      obra_id: 0,
      sector_id: null,
      especialidad_id: 0,
      descripcion: '',
      proveedor: '',
      monto: 0,
      fecha: new Date().toISOString().slice(0, 10),
      comprobante_url: '',
      es_compra_material: false,
      material_id: null,
      cantidad: null,
      precio_unitario_material: null,
      ...defaultValues,
    },
  });

  const obraId = watch('obra_id');
  const esCompraMaterial = watch('es_compra_material');
  const comprobanteUrl = watch('comprobante_url');
  const cantidad = watch('cantidad');
  const precioUnitarioMaterial = watch('precio_unitario_material');

  const { data: obras = [] } = useObrasList();
  const { data: sectores = [] } = useSectoresPorObra(obraId);
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: materiales = [] } = useMaterialesList();

  const uploadComprobante = useUploadComprobante();
  const analizarIA = useAnalizarComprobanteConIA();

  const [analizando, setAnalizando] = React.useState(false);

  React.useEffect(() => {
    if (obras.length === 1 && !defaultValues?.obra_id) {
      setValue('obra_id', obras[0].id);
    }
  }, [obras]);

  // recalcula el monto total automáticamente cuando es compra de material
  React.useEffect(() => {
    if (esCompraMaterial && cantidad && precioUnitarioMaterial) {
      setValue('monto', +(cantidad * precioUnitarioMaterial).toFixed(2));
    }
  }, [esCompraMaterial, cantidad, precioUnitarioMaterial]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadComprobante.mutateAsync(file);
    setValue('comprobante_url', url);

    setAnalizando(true);
    try {
      const datos = await analizarIA.mutateAsync(url);
      if (datos.descripcion) setValue('descripcion', datos.descripcion);
      if (datos.monto && !esCompraMaterial) setValue('monto', datos.monto);
      if (datos.fecha) setValue('fecha', datos.fecha);
      if (datos.proveedor) setValue('proveedor', datos.proveedor);
    } catch {
      // si la IA falla, el usuario completa a mano
    } finally {
      setAnalizando(false);
    }
  };

  const totalCalculado = esCompraMaterial && cantidad && precioUnitarioMaterial
    ? +(cantidad * precioUnitarioMaterial).toFixed(2)
    : null;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
              error={!!errors.obra_id}
              helperText={errors.obra_id?.message}
              disabled={obras.length === 1}
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

      <Box sx={rowSx}>
        <Controller
          name="especialidad_id"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              sx={fieldSx}
              label={t('compras.form.especialidad')}
              error={!!errors.especialidad_id}
              helperText={errors.especialidad_id?.message}
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              {especialidades.map((esp) => (
                <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="proveedor"
          control={control}
          render={({ field }) => (
            <TextField {...field} fullWidth sx={fieldSx} label={t('compras.form.proveedor')} />
          )}
        />
      </Box>

      <Controller
        name="descripcion"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            multiline
            minRows={2}
            label={t('compras.form.descripcion')}
            error={!!errors.descripcion}
            helperText={errors.descripcion?.message}
          />
        )}
      />

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

      {esCompraMaterial ? (
        <>
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
                  error={!!errors.material_id}
                  helperText={errors.material_id?.message}
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

          <Box sx={rowSx}>
            <Controller
              name="precio_unitario_material"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  type="number"
                  fullWidth
                  sx={fieldSx}
                  label={t('compras.form.precio_unitario')}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              )}
            />

            <TextField
              value={totalCalculado ?? ''}
              fullWidth
              sx={fieldSx}
              label={t('compras.form.total_calculado')}
              disabled
              InputProps={{ readOnly: true }}
            />
          </Box>
        </>
      ) : (
        <Box sx={rowSx}>
          <Controller
            name="monto"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                sx={fieldSx}
                label={t('compras.form.monto')}
                error={!!errors.monto}
                helperText={errors.monto?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />

          <Controller
            name="fecha"
            control={control}
            render={({ field }) => (
              <TextField {...field} type="date" fullWidth sx={fieldSx} label={t('compras.form.fecha')} InputLabelProps={{ shrink: true }} />
            )}
          />
        </Box>
      )}

      {esCompraMaterial && (
        <Controller
          name="fecha"
          control={control}
          render={({ field }) => (
            <TextField {...field} type="date" fullWidth label={t('compras.form.fecha')} InputLabelProps={{ shrink: true }} />
          )}
        />
      )}

      <Button variant="outlined" component="label" disabled={uploadComprobante.isPending || analizando} sx={{ alignSelf: 'flex-start' }}>
        {analizando ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
        {comprobanteUrl ? t('compras.form.comprobante_cargado') : t('compras.form.subir_comprobante')}
        <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : t('compras.form.guardar')}
        </Button>
      </Box>
    </Box>
  );
}