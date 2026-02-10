import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

// Routes that don't require authentication
const publicRoutes = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const { nextUrl } = req;

  // Allow API routes and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return;
  }

  const isAuthenticated = !!req.auth;
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from login/register
  if (isPublicRoute && isAuthenticated) {
    const role = req.auth?.user?.role;
    let redirectTo = "/";

    if (role === "ADMIN") redirectTo = "/admin/dashboard";
    else if (role === "OPERATOR") redirectTo = "/operator/dashboard";

    return Response.redirect(new URL(redirectTo, nextUrl));
  }

  // Allow public routes
  if (isPublicRoute) {
    return;
  }

  // Require authentication for all other routes
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  const userRole = req.auth?.user?.role;

  // Redirect ADMIN/OPERATOR from visitor pages to their dashboards
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/operator") && userRole === "ADMIN") {
    return Response.redirect(new URL("/admin/dashboard", nextUrl));
  }

  if (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/operator") &&
    userRole === "OPERATOR"
  ) {
    return Response.redirect(new URL("/operator/dashboard", nextUrl));
  }

  // Admin routes - only admins
  if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return Response.redirect(new URL("/", nextUrl));
  }

  // Operator routes - only operators
  if (pathname.startsWith("/operator") && userRole !== "OPERATOR") {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
