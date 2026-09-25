import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
      const isAccountPage = pathname.startsWith("/account");
      const isAdminPage = pathname.startsWith("/admin");

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/account", nextUrl));
        }
        return true;
      }

      if (isAccountPage) {
        if (!isLoggedIn) {
          const callbackUrl = encodeURIComponent(pathname);
          return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
        }
        return true;
      }

      if (isAdminPage) {
        if (!isLoggedIn) {
          const callbackUrl = encodeURIComponent(pathname);
          return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
        }
        if (auth.user?.role !== "ADMIN") {
          return Response.redirect(new URL("/account?error=unauthorized", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  providers: [], // Configured in src/lib/auth.ts
};
