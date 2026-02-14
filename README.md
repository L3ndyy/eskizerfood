# eskizer food — Доставка еды

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

## Деплой (GitHub + Vercel)

Приложение с сервером (БД, авторизация) удобно деплоить на **Vercel** — после пуша в GitHub сайт поднимается в один клик.

### 1. Репозиторий на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПОЗИТОРИЯ.git
git push -u origin main
```

### 2. Деплой на Vercel

1. Зайдите на [vercel.com](https://vercel.com) и войдите через GitHub.
2. **Add New** → **Project** → выберите репозиторий → **Import**.
3. В настройках проекта добавьте переменные окружения:
   - `DATABASE_URL` — строка подключения к БД (на Vercel: **Storage** → **Create Database** → Postgres, подставится автоматически).
   - `NEXTAUTH_SECRET` — случайная строка (например `openssl rand -base64 32`).
   - `NEXTAUTH_URL` — после первого деплоя укажите URL проекта, например `https://ваш-проект.vercel.app`.
4. Нажмите **Deploy**.

После деплоя выполните миграции и seed вручную (Vercel → проект → **Settings** → **Functions** или через CLI):

```bash
npx vercel env pull .env.local
npm run db:push
npm run db:seed
```

(Для seed на Vercel можно использовать **Vercel Postgres** в панели и выполнить seed через скрипт или вручную.)

При следующих пушах в `main` Vercel будет автоматически пересобирать и деплоить проект.

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
