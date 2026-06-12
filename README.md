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
- **Leaflet** + OpenStreetMap — карта адреса

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

По желанию — просмотр базы в браузере:

```bash
npx prisma studio
```

Откройте [http://localhost:3000](http://localhost:3000)

## Деплой на Vercel (рекомендуется)

Инструкция: **[deploy/VERCEL.md](deploy/VERCEL.md)** — GitHub + Neon (бесплатная БД) + `vercel.com`.

После деплоя выполните на production БД:

```bash
npm run db:vercel:push
npm run db:vercel:seed
```

## Деплой на Timeweb

```powershell
npm run dist
```

См. **deploy/КАК-ЗАГРУЗИТЬ.txt**

## Тестовые аккаунты

- **Админ:** admin@food.ru / admin123
- **Пользователь:** user@food.ru / user123

## Функции

- Главная страница с ресторанами и CMS-баннерами
- Поиск, фильтры, сортировка
- Страница ресторана с меню
- Корзина per-user (синхронизация с БД, очистка при выходе)
- Оформление заказа: адрес на карте → оплата
- Mock-оплата картой или наличными
- Групповые заказы с invite-ссылками и polling
- Централизованная и раздельная оплата группового заказа
- Имитация статусов заказа (прогресс-бар доставки)
- Личный кабинет и история заказов
- Система бонусов
- Избранное
- Рандомайзер «Что поесть?»
- Переключатель темы (светлая / тёмная)
- Чат поддержки и ответы админа
- CMS: рестораны, блюда, категории, баннеры
- Админ-панель (`/admin`) — только для admin@food.ru

## Новые маршруты

- `/checkout` — адрес и телефон с картой
- `/payment` — оплата заказа
- `/group-order` — создание группового заказа
- `/group-order/join/[token]` — совместная корзина
- `/admin/restaurants/cms`, `/admin/dishes`, `/admin/categories`, `/admin/banners`

## Групповой заказ (тестовый сценарий)

1. Войти как user@food.ru
2. Открыть `/group-order` или кнопку на странице ресторана
3. Создать сессию и скопировать invite-ссылку
4. В другом браузере зарегистрироваться и перейти по ссылке
5. Добавить блюда через меню ресторана (`?groupToken=...`)
6. Инициатор завершает заказ (централизованно или раздельно)
