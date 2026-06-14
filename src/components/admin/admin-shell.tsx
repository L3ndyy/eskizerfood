'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  MessageCircle,
  ChefHat,
  Tags,
  ImageIcon,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { href: '/admin/restaurants/cms', label: 'Рестораны', icon: UtensilsCrossed },
  { href: '/admin/dishes', label: 'Блюда', icon: ChefHat },
  { href: '/admin/categories', label: 'Категории', icon: Tags },
  { href: '/admin/banners', label: 'Баннеры', icon: ImageIcon },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingBag },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/support', label: 'Поддержка', icon: MessageCircle },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/admin" className="text-lg font-bold tracking-tight">
            FoodExpress
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>
        <div className="border-t border-border p-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← На сайт
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <Link href="/admin" className="font-bold">
            CMS
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {mobileOpen ? (
          <div className="border-b border-border bg-card p-4 md:hidden">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <Link
              href="/"
              className="mt-4 block text-sm text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              ← На сайт
            </Link>
          </div>
        ) : null}

        <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
