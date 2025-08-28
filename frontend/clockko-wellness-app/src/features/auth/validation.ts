/*
 ├── validation.ts       // Helpers for validating email/password 
*/ 

import { z } from 'zod';

// Schema for the login form
export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

// Schema for the full registration form
export const registrationSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  fullName: z.string().min(2, { message: 'Please enter your full name' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

// Infer TypeScript types from the schemas to use in your components
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;