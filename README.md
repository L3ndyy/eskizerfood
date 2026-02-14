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

## Деплой (GitHub + Render, бесплатно)

Бесплатный хостинг на **[Render](https://render.com)** — подключаете репозиторий с GitHub, настраиваете один раз, дальше каждый `git push` автоматически пересобирает и поднимает сайт.

### 1. Запушить проект в GitHub

Если репозиторий ещё не создан или нужно обновить код:

```bash
git add .
git commit -m "Deploy"
git push -u origin main
```

(Если репо новый: `git init` → `git add .` → `git commit -m "Initial commit"` → `git branch -M main` → `git remote add origin https://github.com/ВАШ_ЛОГИН/eskizerfood.git` → `git push -u origin main`.)

### 2. База данных на Render

1. Зайдите на [render.com](https://render.com), войдите через GitHub.
2. **Dashboard** → **New +** → **PostgreSQL**.
3. Имя любое (например `eskizerfood-db`), регион выберите ближайший.
4. **Create Database**. Дождитесь создания, откройте сервис и скопируйте **Internal Database URL** (или **External** — оба подойдут).

### 3. Сайт (Web Service) на Render

1. **New +** → **Web Service**.
2. Подключите репозиторий **eskizerfood** (или свой). Branch: `main`.
3. Настройки:
   - **Name:** `eskizerfood` (или любое).
   - **Runtime:** Node.
   - **Build Command:**  
     `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command:**  
     `npm run start`
4. **Advanced** → **Add Environment Variable**, добавьте:

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | вставьте скопированный URL из шага 2 (PostgreSQL) |
   | `NEXTAUTH_SECRET` | любая длинная случайная строка (например сгенерируйте: `openssl rand -base64 32`) |
   | `NEXTAUTH_URL` | пока оставьте пустым или `https://ваш-сервис.onrender.com` — после первого деплоя замените на реальный URL сервиса |

5. **Create Web Service**. Дождитесь первого деплоя.

### 4. После первого деплоя

1. В карточке сервиса скопируйте **URL** (например `https://eskizerfood.onrender.com`).
2. В **Environment** добавьте или измените `NEXTAUTH_URL` на этот URL. Сохраните — Render перезапустит сервис.
3. Чтобы заполнить БД тестовыми ресторанами, в **Shell** (вкладка в сервисе) выполните:
   ```bash
   npx prisma db seed
   ```
   (Если Shell нет — один раз запустите локально с `DATABASE_URL` от Render: `npx prisma db push` и `npm run db:seed`.)

### 5. Дальше

Любой пуш в `main` на GitHub автоматически запускает новый деплой на Render:

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
