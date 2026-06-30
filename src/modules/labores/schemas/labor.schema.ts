import { z } from 'zod';

export const laborSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().or(z.literal('')),
  obra_id: z.union([z.number(), z.literal('')]),
  trabajador_id: z.union([z.number(), z.literal('')]).optional(),
  especialidad_id: z.union([z.number(), z.literal('')]).optional(),
  estado_id: z.union([z.number(), z.literal('')]).optional(),
  modo: z.enum(['rapido', 'cotizacion']).default('rapido'),
  unidad_id: z.union([z.number(), z.literal('')]).optional(),
  cantidad: z.union([z.number().int(), z.literal('')]).optional(),
  costo_estimado: z.union([z.number().positive(), z.literal('')]).optional(),
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

  if (data.fecha_inicio_estimada && data.fecha_fin_estimada) {
    if (new Date(data.fecha_fin_estimada) < new Date(data.fecha_inicio_estimada)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin estimada no puede ser anterior a la fecha de inicio',
        path: ['fecha_fin_estimada'],
      });
    }
  }

  if (data.fecha_inicio_real && data.fecha_fin_real) {
    if (new Date(data.fecha_fin_real) < new Date(data.fecha_inicio_real)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin real no puede ser anterior a la fecha de inicio',
        path: ['fecha_fin_real'],
      });
    }
  }
});

export type LaborSchemaValues = z.infer<typeof laborSchema>;