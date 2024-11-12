// Zod

import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string(),
  password: z.string().min(8, {
    message: "The password must be at least 8 characters long",
  }),
});

export const RegisterSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long",
    }),
    name: z.string().min(1, {
      message: "Name is required",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
