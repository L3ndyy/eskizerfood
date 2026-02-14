# eskizer food — Доставка еды

Современный веб-сайт доставки еды в стиле Яндекс Еды / Delivery Club.

## Стек

- **Next.js 16** (App Router, Server Actions, React Server Components)
- **TypeScript** (строгий режим)
- **Tailwind CSS** + shadcn/ui компоненты
- **Prisma** + PostgreSQL (локально и на Railway)
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

Создай файл `.env` в корне проекта и укажи подключение к PostgreSQL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery"
```
Можно использовать бесплатный облачный Postgres ([Neon](https://neon.tech), [Supabase](https://supabase.com)) или запустить локально: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`, тогда `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"`.

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
4. **Переменные (NEXTAUTH_SECRET и NEXTAUTH_URL):**
   - В списке сервисов проекта кликни по **сервису с приложением** (не по базе).
   - Сверху появятся вкладки: **Deployments**, **Variables**, **Settings** и т.д.
   - Открой вкладку **Variables**. Нажми **+ New Variable** или **Add variable** и добавь:
     - Имя: `NEXTAUTH_SECRET`, значение: любая длинная случайная строка.
     - Имя: `NEXTAUTH_URL`, значение: пока можно оставить пустым или `https://твой-сервис.up.railway.app` (подставишь точный URL после деплоя).
5. **Start Command и Prisma (pre-deploy):**
   - В том же сервисе открой вкладку **Settings** → в правой колонке выбери **Deploy**.
   - В блоке **Deploy** нажми **+ Start Command** и укажи: `npm run start`.
   - Ниже нажми **+ Add pre-deploy step** — туда добавь команду, которая выполнится перед каждым запуском (миграции Prisma):
     - Команда: `npx prisma generate && npx prisma db push`
   - Отдельного поля «Build Command» в Railway нет: сборка (`npm run build`) выполняется автоматически для Next.js. Pre-deploy step как раз нужен, чтобы перед стартом приложения применить схему БД.
6. Сохрани и дождись деплоя (или сделай пуш в GitHub — деплой запустится сам).

После деплоя: в **Settings** найди **Domains** / **Public URL**, скопируй ссылку (например `https://твой-сервис.up.railway.app`), вставь её в переменную `NEXTAUTH_URL` во вкладке **Variables** и сохрани. Сервис перезапустится. Чтобы заполнить БД тестовыми ресторанами: во вкладке сервиса нажми **⋮** (три точки) → **Run Command** (или в **Settings** → **One-off command**) и выполни `npx prisma db seed`.

**Про базу на Railway:** в проекте уже настроено подключение к PostgreSQL через переменную `DATABASE_URL`. Railway сам подставляет её из своей БД — **ничего вручную в коде менять не нужно**, просто добавь сервис PostgreSQL в проект и переменные (см. выше).

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
