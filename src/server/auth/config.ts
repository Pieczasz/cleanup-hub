// Functions
import type {
  Account,
  Profile,
  User,
  DefaultSession,
  NextAuthConfig,
} from "next-auth";
import { env } from "@/env";
import type { JWT } from "next-auth/jwt";

// Database
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";

// Typography
import bcrypt, { hash } from "bcryptjs";

// Providers
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      image?: string | null;
      name?: string | null;
      email?: string | null;
    } & DefaultSession["user"];
  }
}

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.query.users.findFirst({
            where: (users, { eq }) =>
              eq(users.email, String(credentials.email)),
          });

          if (!user) {
            throw new Error("User not found");
          }

          if (!user.password) {
            throw new Error("Password not found");
          }

          const isValidPassword = await bcrypt.compare(
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            String(credentials.password),
            user.password,
          );

          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: DrizzleAdapter(db),
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: { user?: { name?: string | null; image?: string | null } };
    }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      // Handle updates to the session
      if (trigger === "update" && session) {
        if (session.user) {
          token.name = session.user.name;
          token.picture = session.user.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? (token.id as string);
        session.user.name = token.name!;
        session.user.email = token.email!;
        session.user.image = token.picture!;
      }
      return session;
    },
  },
};

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = hash(password, 10);
  return hashedPassword;
}
