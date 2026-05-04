import { z } from 'zod';

export const clienteSchema = z.object({
  nombre:       z.string().min(1, 'El nombre es obligatorio'),
  apellido:     z.string().optional().or(z.literal('')),
  razon_social: z.string().optional().or(z.literal('')),
  dni_cuit:     z.string().optional().or(z.literal('')),
  telefono:     z.string().min(1, 'El teléfono es obligatorio'),
  direccion:    z.string().optional().or(z.literal('')),
  email:        z.string().email('Email inválido').optional().or(z.literal('')),
});

export type ClienteSchemaValues = z.infer<typeof clienteSchema>;