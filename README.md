# FoodExpress — Доставка еды

Современный веб-сайт доставки еды в стиле Яндекс Еды / Delivery Club.

## Стек

- **Next.js 16** (App Router, Server Actions, React Server Components)
- **TypeScript** (строгий режим)
- **Tailwind CSS** + shadcn/ui компоненты
- **Prisma** + SQLite (локально) / PostgreSQL (production)
- **NextAuth.js v5** — email + пароль
- **Zustand** + TanStack Query — состояние и данные
- **Framer Motion** — анимации
- **Lucide React** — иконки
- **Zod** — валидация

## Запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. База данных

Проект использует SQLite по умолчанию (файл `prisma/dev.db`). База создаётся автоматически.

Для PostgreSQL: создайте `.env` и укажите:
```
DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery"
```

Не забудьте обновить `prisma/schema.prisma` для PostgreSQL (provider = "postgresql").

### 3. Миграции и seed

```bash
npm run db:push
npm run db:seed
```

### 4. Запуск dev-сервера

```bash
npm run dev
```
npx prisma studio

Откройте [http://localhost:3000](http://localhost:3000)

## Тестовые аккаунты

- **Админ:** admin@food.ru / admin123
- **Пользователь:** user@food.ru / user123

## Функции

- Главная страница с ресторанами
- Поиск, фильтры, сортировка
- Страница ресторана с меню
- Корзина (Zustand + localStorage)
- Оформление заказа
- Имитация статусов заказа (прогресс-бар доставки)
- Личный кабинет и история заказов
- Система бонусов
- Избранное
- Рандомайзер "Что поесть?"
- Переключатель темы (светлая/тёмная)
- Админ-панель (/admin) — только для admin@food.ru
