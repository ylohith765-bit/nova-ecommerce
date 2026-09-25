import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;
export { auth as proxy };

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (e.g. /api/auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, and public static assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
