import { z } from 'zod';

export const signinSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Required'),
});

export const postSchema = z.object({
  title: z.string().min(1, 'Required'),
  content: z.string().min(1, 'Required'),
  categoryId: z.string().optional(),
});

export type SigninData = z.infer<typeof signinSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type CategoryData = z.infer<typeof categorySchema>;
export type PostData = z.infer<typeof postSchema>;
