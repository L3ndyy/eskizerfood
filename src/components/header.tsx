'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { GroupOrderNavLink } from '@/components/group-order-nav-link';
import { useGroupOrderToken } from '@/hooks/use-group-order-token';
import { groupOrderHref, clearStoredGroupOrderToken } from '@/lib/group-order-storage';
import { useCartStore } from '@/store/cart-store';
import { useMounted } from '@/hooks/use-mounted';
import { signOut } from 'next-auth/react';

export function Header() {
  const { data: session, status } = useSession();
  const groupToken = useGroupOrderToken();
  const itemCount = useCartStore((s) => s.getItemCount());
  const mounted = useMounted();

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container mx-auto max-w-7xl w-full flex h-16 items-center justify-between px-4">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Link
            href={groupOrderHref('/', groupToken)}
            className="font-display flex flex-col leading-none transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            <span className="text-xl font-semibold tracking-tight text-primary md:text-2xl">FoodExpress</span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              доставка еды
            </span>
          </Link>
        </motion.div>

        <motion.nav
          className="flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <GroupOrderNavLink />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/favorites">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <motion.span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
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
                onClick={async () => {
                  try {
                    await fetch('/api/cart', { method: 'DELETE' });
                  } catch {
                    // ignore
                  }
                  useCartStore.getState().clearCart();
                  localStorage.removeItem('food-delivery-cart');
                  clearStoredGroupOrderToken();
                  signOut({ callbackUrl: '/' });
                }}
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
        </motion.nav>
      </div>
    </motion.header>
  );
}
