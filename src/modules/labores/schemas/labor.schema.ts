import { z } from 'zod';

export const laborSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().or(z.literal('')),
  obra_id: z.union([z.number(), z.literal('')]),
  trabajador_id: z.union([z.number(), z.literal('')]).optional(),
  especialidad_id: z.union([z.number(), z.literal('')]).optional(),
  estado_id: z.union([z.number(), z.literal('')]).optional(),
  fecha_inicio_estimada: z.string().optional().or(z.literal('')),
  fecha_fin_estimada: z.string().optional().or(z.literal('')),
  fecha_inicio_real: z.string().optional().or(z.literal('')),
  fecha_fin_real: z.string().optional().or(z.literal('')),
  usuario_creador_id: z.number(),
});

export type LaborSchemaValues = z.infer<typeof laborSchema>;