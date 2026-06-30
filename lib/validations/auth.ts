import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
    .object({
        name: z.string().min(2, "Name is required"),
        email: z.email("Enter a valid email"),
        phone: z.string().min(10),
        password: z.string().min(8),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignupValues = z.infer<typeof signupSchema>;