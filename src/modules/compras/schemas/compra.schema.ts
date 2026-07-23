import { z } from 'zod';

export const compraSchema = z.object({
  obra_id: z.number({ required_error: 'La obra es obligatoria' }).min(1, 'La obra es obligatoria'),
  sector_id: z.number().nullable().optional(),
  especialidad_id: z.number({ required_error: 'La especialidad es obligatoria' }).min(1, 'La especialidad es obligatoria'),
  descripcion: z.string().min(1, 'La descripción es obligatoria').max(500),
  proveedor: z.string().max(150).optional(),
  monto: z.number({ required_error: 'El monto es obligatorio' }).positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  comprobante_url: z.string().optional(),
  es_compra_material: z.boolean().default(false),
  material_id: z.number().nullable().optional(),
  cantidad: z.number().nullable().optional(),
  precio_unitario_material: z.number().nullable().optional(),
}).refine(
  (data) => !data.es_compra_material || (data.material_id && data.cantidad && data.cantidad > 0 && data.precio_unitario_material && data.precio_unitario_material > 0),
  { message: 'Si es compra de material, completá material, cantidad y precio unitario', path: ['material_id'] }
);

export type CompraFormValues = z.infer<typeof compraSchema>;