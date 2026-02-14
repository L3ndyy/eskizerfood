import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    bonusPoints?: number;
    isAdmin?: boolean;
  }

  interface Session {
    user: User & {
      id: string;
      bonusPoints: number;
      isAdmin: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    bonusPoints?: number;
    isAdmin?: boolean;
  }
}
