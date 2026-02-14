import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const isAdmin = (session.user as { isAdmin?: boolean })?.isAdmin ?? false;
  if (!isAdmin) redirect('/');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="container flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold">
            Админ-панель
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            На сайт
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
