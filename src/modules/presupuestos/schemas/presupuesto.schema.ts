

import { z } from 'zod';

export const presupuestoSchema = z.object({
  nombre: z.string().optional().or(z.literal('')),
  descripcion: z.string().optional().or(z.literal('')),
  labor_id: z.union([z.number(), z.literal('')]),
  obra_id: z.union([z.number(), z.literal('')]).optional(),
  estado_id: z.union([z.number(), z.literal('')]).optional(),
  costo_mano_obra: z.union([z.number(), z.literal('')]).optional(),
});

export type PresupuestoSchemaValues = z.infer<typeof presupuestoSchema>;