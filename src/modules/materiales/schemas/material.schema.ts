import { z } from 'zod';

export const materialSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().or(z.literal('')),
  tipo_material_id: z.union([z.number(), z.literal('')]).optional(),
  unidad: z.string().min(1, 'La unidad es obligatoria'),
  stock_actual: z.union([z.number(), z.literal('')]),
  precio_unitario: z.union([z.number(), z.literal('')]),
  porcentaje_aumento_mensual: z.union([z.number(), z.literal('')]).optional(),
  estado_id: z.union([z.number(), z.literal('')]),
  imagen_url: z.string().optional().or(z.literal('')),
});

export type MaterialSchemaValues = z.infer<typeof materialSchema>;