import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/validations/auth";
import { redirect } from "next/navigation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;
        const normalizedEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
});

/**
 * Server-side helper to retrieve the current session and user.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Server-side guard to guarantee authentication.
 * Redirects or throws an error if unauthenticated.
 */
export async function requireAuth(redirectTo: string = "/login") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

/**
 * Server-side guard to guarantee ADMIN role.
 * Does not trust any client-supplied role.
 */
export async function requireAdmin(redirectTo: string = "/account?error=unauthorized") {
  const user = await requireAuth("/login?callbackUrl=/admin");
  if (user.role !== "ADMIN") {
    redirect(redirectTo);
  }
  return user;
}
