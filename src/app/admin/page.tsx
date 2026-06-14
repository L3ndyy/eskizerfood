import Link from 'next/link';
import {
  UtensilsCrossed,
  ShoppingBag,
  Users,
  MessageCircle,
  ChefHat,
  Tags,
  ImageIcon,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const [restaurantsCount, dishesCount, categoriesCount, bannersCount, ordersCount, usersCount] =
    await Promise.all([
      prisma.restaurant.count(),
      prisma.dish.count(),
      prisma.category.count(),
      prisma.siteBanner.count(),
      prisma.order.count(),
      prisma.user.count(),
    ]);

  const cards = [
    {
      href: '/admin/restaurants/cms',
      label: 'Рестораны',
      count: restaurantsCount,
      icon: UtensilsCrossed,
      desc: 'Название, фото, доставка',
    },
    {
      href: '/admin/dishes',
      label: 'Блюда',
      count: dishesCount,
      icon: ChefHat,
      desc: 'Меню и цены',
    },
    {
      href: '/admin/categories',
      label: 'Категории',
      count: categoriesCount,
      icon: Tags,
      desc: 'Разделы меню',
    },
    {
      href: '/admin/banners',
      label: 'Баннеры',
      count: bannersCount,
      icon: ImageIcon,
      desc: 'Промо на главной',
    },
    {
      href: '/admin/orders',
      label: 'Заказы',
      count: ordersCount,
      icon: ShoppingBag,
      desc: 'Статусы доставки',
    },
    {
      href: '/admin/users',
      label: 'Пользователи',
      count: usersCount,
      icon: Users,
      desc: 'Аккаунты клиентов',
    },
    {
      href: '/admin/support',
      label: 'Поддержка',
      count: null,
      icon: MessageCircle,
      desc: 'Чат с клиентами',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">Панель управления</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Редактируйте контент сайта, заказы и пользователей
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                {card.count !== null ? (
                  <span className="text-2xl font-bold tabular-nums">{card.count}</span>
                ) : null}
              </div>
              <p className="mt-4 font-semibold">{card.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
