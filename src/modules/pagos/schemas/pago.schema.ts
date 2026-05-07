import { z } from 'zod';

export const pagoSchema = z.object({
  presupuesto_id: z
    .union([z.number().int().positive(), z.literal('')])
    .refine((v) => v !== '', { message: 'Seleccioná un presupuesto' }),

  trabajador_id: z
    .union([z.number().int().positive(), z.literal('')])
    .refine((v) => v !== '', { message: 'El trabajador es obligatorio' }),

  monto: z
    .union([
      z.number().positive({ message: 'El monto debe ser mayor a 0' }),
      z.literal(''),
    ])
    .refine((v) => v !== '', { message: 'El monto es obligatorio' }),

  fecha: z.string().min(1, 'La fecha es obligatoria'),

  motivo: z.string().optional().or(z.literal('')),

  forma_pago_id: z
    .union([z.number().int().positive(), z.literal('')])
    .optional(),

  estado: z.string().min(1, 'El estado es obligatorio'),
});

export type PagoSchemaValues = z.infer<typeof pagoSchema>;