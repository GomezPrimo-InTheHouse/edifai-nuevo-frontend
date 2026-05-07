import { z } from 'zod';

export const obraSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(120, 'El nombre no puede superar los 120 caracteres'),

    descripcion: z.string().trim().optional().or(z.literal('')),

    ubicacion: z.string().trim().optional().or(z.literal('')),

    latitud:  z.number().nullable().optional(),
    longitud: z.number().nullable().optional(),

    tipo_obra_id: z
      .union([z.number().int().positive(), z.literal('')])
      .refine((v) => v !== '', { message: 'Seleccioná un tipo de obra' }),

    estado_id: z
      .union([z.number().int().positive(), z.literal('')])
      .refine((v) => v !== '', { message: 'Seleccioná un estado' }),

    cliente_id: z
      .union([z.number().int().positive(), z.literal(''), z.null()])
      .optional(),

    fecha_inicio_estimado: z.string().optional(),
    fecha_fin_estimado:    z.string().optional(),
    fecha_inicio_real:     z.string().optional(),
    fecha_fin_real:        z.string().optional(),

    usuario_creador_id: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.fecha_inicio_estimado && data.fecha_fin_estimado) {
      if (data.fecha_inicio_estimado > data.fecha_fin_estimado) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La fecha de inicio estimada no puede ser posterior al fin',
          path: ['fecha_inicio_estimado'],
        });
      }
    }
    if (data.fecha_inicio_real && data.fecha_fin_real) {
      if (data.fecha_inicio_real > data.fecha_fin_real) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La fecha de inicio real no puede ser posterior al fin',
          path: ['fecha_inicio_real'],
        });
      }
    }
  });

export type ObraSchemaValues = z.infer<typeof obraSchema>;