// import { z } from 'zod';
const { z } = require('zod');

const AdminLoginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

module.exports = { AdminLoginSchema };
