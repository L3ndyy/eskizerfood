import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

const protectedPaths = [
  '/account',
  '/checkout',
  '/payment',
  '/group-order',
  '/admin',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const needsAuth = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!needsAuth) return;

  if (!req.auth?.user) {
    const signInUrl = new URL('/auth/register', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(signInUrl);
  }

  if (pathname.startsWith('/admin')) {
    const isAdmin = (req.auth.user as { isAdmin?: boolean })?.isAdmin ?? false;
    if (!isAdmin) {
      return Response.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/payment/:path*',
    '/group-order/:path*',
    '/admin/:path*',
  ],
};
