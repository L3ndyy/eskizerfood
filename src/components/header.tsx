'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShoppingCart, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useCartStore } from '@/store/cart-store';
import { signOut } from 'next-auth/react';

export function Header() {
  const { data: session, status } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl w-full flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          eskizer food
        </Link>

        <nav className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/favorites">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </Button>

          {status === 'loading' ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <div className="flex items-center gap-2">
              {(session.user as { isAdmin?: boolean })?.isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">Админ</Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-muted-foreground"
              >
                Выйти
              </Button>
            </div>
          ) : (
            <Button variant="default" asChild>
              <Link href="/auth/signin">Войти</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
