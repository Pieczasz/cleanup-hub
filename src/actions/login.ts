// Functions
import { signIn } from "next-auth/react";

// Zod
import type * as z from "zod";
import { LoginSchema } from "@/schemas";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  // Validate inputs
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email or password." };
  }

  const { email, password } = validatedFields.data;

  email.toLowerCase();

  try {
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response?.error) {
      if (response.error === "CredentialsSignin") {
        return { error: "Invalid Credentials" };
      }

      return { error: response.error };
    }

    return { success: "Logged in successfully!" };
  } catch {
    return { error: "Something went wrong. Please try again later." };
  }
};
