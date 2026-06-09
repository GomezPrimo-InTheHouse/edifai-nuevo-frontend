import { z } from 'zod';

export const laborSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().or(z.literal('')),
  obra_id: z.union([z.number(), z.literal('')]),
  trabajador_id: z.union([z.number(), z.literal('')]).optional(),
  especialidad_id: z.union([z.number(), z.literal('')]).optional(),
  estado_id: z.union([z.number(), z.literal('')]).optional(),
  modo: z.enum(['rapido', 'cotizacion']).default('rapido'),
  fecha_inicio_estimada: z.string().optional().or(z.literal('')),
  fecha_fin_estimada: z.string().optional().or(z.literal('')),
  fecha_inicio_real: z.string().optional().or(z.literal('')),
  fecha_fin_real: z.string().optional().or(z.literal('')),
  usuario_creador_id: z.number(),
}).superRefine((data, ctx) => {
  if (data.modo === 'rapido' && !data.trabajador_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'En modo rápido el trabajador es obligatorio',
      path: ['trabajador_id'],
    });
  }
});

export type LaborSchemaValues = z.infer<typeof laborSchema>;