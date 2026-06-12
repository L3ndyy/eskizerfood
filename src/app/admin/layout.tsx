import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';

const NAV = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/restaurants/cms', label: 'Рестораны' },
  { href: '/admin/dishes', label: 'Блюда' },
  { href: '/admin/categories', label: 'Категории' },
  { href: '/admin/banners', label: 'Баннеры' },
  { href: '/admin/users', label: 'Пользователи' },
  { href: '/admin/support', label: 'Поддержка' },
];

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
        <div className="container flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-xl font-bold">
              Админ-панель
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              На сайт
            </Link>
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
