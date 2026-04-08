const { z } = require('zod');

const registerSchema = z
  .object({
    username: z.string().trim().min(3).max(50).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(6).max(100),
    phone: z.string().trim().min(8).max(20).optional(),
  })
  .refine((input) => input.email || input.phone, {
    message: 'Either email or phone is required',
  });

const loginSchema = z
  .object({
    email: z.string().trim().email().optional(),
    username: z.string().trim().min(3).max(50).optional(),
    phone: z.string().trim().min(8).max(20).optional(),
    password: z.string().min(6).max(100),
  })
  .refine((input) => input.email || input.username || input.phone, {
    message: 'Either email, username, or phone is required',
  });

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z.string().trim().min(8).max(20).optional(),
  })
  .refine((input) => input.email || input.phone, {
    message: 'Either email or phone is required',
  });

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6).max(100),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6).max(100),
  newPassword: z.string().min(6).max(100),
});

const verifyEmailSchema = z.object({
  token: z.string().min(10),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
};
