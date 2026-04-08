const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().trim().min(3).max(50),
  email: z.string().trim().email(),
  password: z.string().min(6).max(100),
  phone: z.string().trim().min(8).max(20).optional(),
});

const loginSchema = z
  .object({
    email: z.string().trim().email().optional(),
    username: z.string().trim().min(3).max(50).optional(),
    password: z.string().min(6).max(100),
  })
  .refine((input) => input.email || input.username, {
    message: 'Either email or username is required',
  });

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
};
