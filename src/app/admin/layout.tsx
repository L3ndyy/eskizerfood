import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminShell } from '@/components/admin/admin-shell';

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
    <div className="min-h-screen bg-muted/20">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
