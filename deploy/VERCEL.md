# Деплой на Vercel (5 шагов)

## 1. База Neon (бесплатно, встроено в Vercel)

1. Зайдите на [vercel.com](https://vercel.com) → войдите через GitHub.
2. **Storage** → **Create Database** → **Neon** → создать.
3. Скопируйте **`DATABASE_URL`** (строка `postgresql://...`).

## 2. Код на GitHub

```powershell
cd "путь\к\проекту"
git init
git add .
git commit -m "Vercel deploy"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/foodexpress.git
git push -u origin main
```

## 3. Проект на Vercel

1. **Add New** → **Project** → импорт репозитория.
2. Framework: **Next.js** (определится сам).
3. **Environment Variables** — добавьте **до** Deploy (галочка Production):

| Имя | Значение |
|-----|----------|
| `DATABASE_URL` | `postgresql://...` из Neon (Storage) |
| `PRISMA_PROVIDER` | `postgresql` |
| `AUTH_SECRET` | любая строка 32+ символов |
| `AUTH_URL` | `https://ваш-проект.vercel.app` (можно после 1-го деплоя) |
| `NEXTAUTH_URL` | то же |

Без `DATABASE_URL` и `PRISMA_PROVIDER` сборка упадёт.

4. **Deploy** — в логе должно быть `npm run build:vercel`, не только `prisma generate` для sqlite.

## 4. После первого деплоя — заполнить БД

### Вариант A — Neon SQL Editor (если `npm run db:vercel:push` даёт P1001)

1. Откройте [console.neon.tech](https://console.neon.tech) → ваш проект → **SQL Editor**.

2. **Схема** — файл `prisma/.neon-push.sql` (можно перегенерировать: `npm run db:neon:push-sql`).

   Скрипт **безопасен для повторного запуска**: типы и таблицы пропускаются, если уже есть.
   Скопируйте **весь** текст → SQL Editor → **Run**.

   | Ситуация | Что делать |
   |----------|------------|
   | Пустая БД или после `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` | `.neon-push.sql` → `.neon-seed.sql` |
   | Ошибка `type "PaymentStatus" already exists` (старая версия скрипта) | Обновите `.neon-push.sql` из репозитория или `npm run db:neon:push-sql`, затем **Run** снова |
   | Таблицы уже есть, рестораны пропали | **Не** сбрасывайте схему — только `.neon-seed.sql` |
   | Групповой заказ 500, старая схема GroupCartItem | `.neon-migrate-multi-group.sql` или `.neon-fix-group-order.sql` |
   | Групповой заказ: «таблицы не созданы» | `.neon-fix-group-order.sql` |

3. **Данные** — если рестораны/блюда пустые:

```powershell
npm run db:neon:seed-sql
```

Откройте `prisma/.neon-seed.sql` → скопируйте всё → SQL Editor → **Run**.

4. **Мультиресторанный групповой заказ** (только если БД создавалась до обновления схемы):

Файл `prisma/.neon-migrate-multi-group.sql` или `prisma/.neon-fix-group-order.sql` → SQL Editor → **Run**.

5. **Проверка** (после деплоя с `/api/db/status`): откройте  
   `https://ваш-проект.vercel.app/api/db/status` — должно быть `"groupOrderReady": true` и `"restaurantCount" > 0`.

Или через терминал (если подключение работает):

```powershell
$env:DATABASE_URL="postgresql://..."
$env:PRISMA_PROVIDER="postgresql"
npm run db:vercel:seed
```

### Вариант B — только через терминал

```powershell
cd "C:\Users\nikik\OneDrive\Desktop\eskizerfood"
$env:DATABASE_URL="postgresql://..."
npm run db:vercel:push
npm run db:vercel:seed
```

В **Vercel** → Settings → Environment Variables обновите:

- `AUTH_URL` = `https://ваш-проект.vercel.app`
- `NEXTAUTH_URL` = то же

→ **Redeploy**.

## 5. Готово

Сайт: `https://ваш-проект.vercel.app`  
Вход: **admin@food.ru** / **admin123**
