import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? '';
        (session.user as { bonusPoints?: number }).bonusPoints =
          (token.bonusPoints as number) ?? 0;
        (session.user as { isAdmin?: boolean }).isAdmin =
          Boolean(token.isAdmin);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
