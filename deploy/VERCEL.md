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

На ПК (подставьте свой `DATABASE_URL` из Neon):

```powershell
$env:DATABASE_URL="postgresql://..."
$env:PRISMA_PROVIDER="postgresql"
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
