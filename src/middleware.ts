import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = [
  '/account',
  '/checkout',
  '/payment',
  '/group-order',
  '/admin',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!needsAuth) return NextResponse.next();

  const session = await auth();
  if (!session?.user?.id) {
    const signInUrl = new URL('/auth/register', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith('/admin')) {
    const isAdmin = (session.user as { isAdmin?: boolean })?.isAdmin ?? false;
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/payment/:path*', '/group-order/:path*', '/admin/:path*'],
};
