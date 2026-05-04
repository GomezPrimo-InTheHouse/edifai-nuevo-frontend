import { z } from 'zod';

export const pagoSchema = z.object({
  presupuesto_id: z.union([z.number(), z.literal('')]),
  trabajador_id: z.union([z.number(), z.literal('')]),
  monto: z.union([z.number(), z.literal('')]),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  motivo: z.string().optional().or(z.literal('')),
  forma_pago_id: z.union([z.number(), z.literal('')]).optional(),
estado: z.string().min(1, 'El estado es obligatorio'),
});

export type PagoSchemaValues = z.infer<typeof pagoSchema>;