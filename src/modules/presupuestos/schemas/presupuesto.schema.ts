import { z } from 'zod';

export const presupuestoSchema = z.object({
  nombre:          z.string().optional().or(z.literal('')),
  descripcion:     z.string().optional().or(z.literal('')),
  labor_id:        z.coerce.number().optional().or(z.literal('')),
  obra_id:         z.coerce.number().optional().or(z.literal('')),
  estado_id:       z.coerce.number().optional().or(z.literal('')),
  costo_mano_obra: z.coerce.number().optional().or(z.literal('')),
  precio_unitario: z.coerce.number().optional().or(z.literal('')),
  cantidad:        z.coerce.number().int().optional().or(z.literal('')),
});

export type PresupuestoSchemaValues = z.infer<typeof presupuestoSchema>;