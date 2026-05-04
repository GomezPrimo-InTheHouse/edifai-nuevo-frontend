// src/modules/usuarios/schemas/usuario.schema.ts

import { z } from 'zod';

export const usuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol_id: z.union([z.number(), z.literal('')]).refine(v => v !== '', { message: 'El rol es obligatorio' }),
});

export const usuarioEditSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  rol_id: z.union([z.number(), z.literal('')]).refine(v => v !== '', { message: 'El rol es obligatorio' }),
});

export type UsuarioSchemaValues = z.infer<typeof usuarioSchema>;
export type UsuarioEditSchemaValues = z.infer<typeof usuarioEditSchema>;