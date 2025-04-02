import { auth } from "@/auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
} from "@/lib/routes";

export default auth(req => {
  const { nextUrl } = req;
  const session = req.auth;

  const isLoggedIn = !!session;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) return;
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Ensure proper redirection to DEFAULT_LOGIN_REDIRECT
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    // Ensure proper redirection to the login page
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
