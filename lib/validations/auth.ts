import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
    .object({
        name: z.string().min(2, "Name is required"),
        email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
        phone: z.string().min(10).optional(),
        password: z.string().min(8),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignupValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  code: z.string().min(1, "Verification code is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
