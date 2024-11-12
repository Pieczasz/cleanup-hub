"use server";

// Zod
import { RegisterSchema } from "@/schemas";
import type * as z from "zod";

// Database
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Typography
import { hashPassword } from "@/server/auth/config";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input data." };
  }

  const { email, password, name } = validatedFields.data;

  try {
    // Check if the email is already registered
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (existingUser.length > 0) {
      return { error: "Email already in use." };
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert new user into the database
    await db.insert(users).values({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
    });

    return { success: "Account created successfully!" };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
};
