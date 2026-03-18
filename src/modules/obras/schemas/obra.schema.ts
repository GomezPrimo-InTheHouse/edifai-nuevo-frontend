import { z } from 'zod';

export const obraSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(120, 'El nombre no puede superar los 120 caracteres'),

  descripcion: z.string().trim().optional().or(z.literal('')),
  ubicacion: z.string().trim().optional().or(z.literal('')),

  tipo_obra_id: z.union([z.number().int().positive(), z.literal('')]),
  estado_id: z.union([z.number().int().positive(), z.literal('')]),

  fecha_inicio_estimado: z.string().optional(),
  fecha_fin_estimado: z.string().optional(),
  fecha_inicio_real: z.string().optional(),
  fecha_fin_real: z.string().optional(),

  usuario_creador_id: z.number().int().positive(),
});

export type ObraSchemaValues = z.infer<typeof obraSchema>;