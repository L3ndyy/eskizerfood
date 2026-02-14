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

## Деплой

**Только на GitHub сайт не запустится** — GitHub Pages умеет только статику, а здесь Next.js с сервером, БД и входом. Нужен хостинг с Node.js. Самый простой вариант — **Railway**: репо с GitHub подключаешь, жмёшь пару кнопок, всё поднимается.

### Вариант: Railway (быстро и бесплатно)

1. Зайди на [railway.app](https://railway.app), войди через **GitHub**.
2. **New Project** → **Deploy from GitHub repo** → выбери репозиторий **eskizerfood** (или свой).
3. В проекте нажми **+ New** → **Database** → **PostgreSQL**. Railway создаст БД и подставит `DATABASE_URL` в переменные.
4. Открой свой **Service** (приложение), вкладка **Variables**. Добавь вручную:
   - `NEXTAUTH_SECRET` — любая длинная случайная строка.
   - `NEXTAUTH_URL` — пока пусто; после первого деплоя вставь сюда URL вида `https://твой-сервис.up.railway.app`.
5. В **Settings** сервиса проверь:
   - **Build Command:** `npx prisma generate && npx prisma db push && npm run build`
   - **Start Command:** `npm run start`
6. **Deploy** (или пуш в GitHub — деплой запустится сам).

После деплоя открой URL сервиса, скопируй его в `NEXTAUTH_URL` и перезапусти. Чтобы заполнить БД тестовыми ресторанами: в **Settings** → **One-off command** (или через CLI) выполни `npx prisma db seed`.

**Важно:** для Railway в `prisma/schema.prisma` в блоке `datasource db` должно быть:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
(Локально для SQLite потом можно вернуть `provider = "sqlite"` без `url`.)

### Команды для GitHub (код уже в репо)

Обновления деплоятся автоматически при пуше в `main`:

```bash
git add .
git commit -m "Update"
git push origin main
```

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
