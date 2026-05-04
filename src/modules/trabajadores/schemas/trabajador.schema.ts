import { z } from 'zod';

export const trabajadorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  dni: z.string().min(1, 'El DNI es obligatorio'),
  email: z.string().email('Email inválido').min(1, 'El email es obligatorio'),
  password: z.string().min(5, "Mínimo 5 caracteres").optional().or(z.literal('')), 
  telefono: z.string().optional().or(z.literal('')),
  fecha_ingreso: z.string().optional().or(z.literal('')),
  especialidad_id: z.union([z.number(), z.literal('')]).optional(),
  estado_id: z.union([z.number(), z.literal('')]).optional(),
  jefe_id: z.union([z.number(), z.literal('')]).optional(),
  usuario_creador_id: z.number(),
});

export type TrabajadorSchemaValues = z.infer<typeof trabajadorSchema>;