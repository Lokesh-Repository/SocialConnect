import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .transform(val => val.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().optional()
})

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
})

export const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  bio: z.string().max(500).optional(),
  privacy: z.enum(['PUBLIC', 'PRIVATE', 'FOLLOWERS_ONLY']).optional()
})

export const createPostSchema = z.object({
  content: z.string().min(1).max(280, 'Post must be 280 characters or less'),
  imageUrl: z.string().url().optional(),
  category: z.string().optional()
})

export const updatePostSchema = z.object({
  content: z.string().min(1).max(280, 'Post must be 280 characters or less').optional()
})

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000)
})

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address')
})

export const passwordResetConfirmSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
})

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
})
