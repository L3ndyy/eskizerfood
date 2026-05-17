# Timeweb Cloud — App Platform (пошагово)

## Перед началом

1. Подтвердите email (жёлтая плашка вверху).
2. Пополните баланс (кнопка «Пополнить») — без денег приложение не запустится.

---

## Шаг 1. База MySQL в Cloud

1. Слева: **Базы данных** → **Создать** → **MySQL 8**.
2. Запомните: **хост**, **логин**, **пароль**, **имя базы**.
3. Откройте phpMyAdmin / консоль БД → вкладка **SQL**.
4. Вставьте весь файл **`deploy/timeweb.sql`** (или `dist/timeweb.sql`) → **Выполнить**.

Строка подключения для `.env`:

```env
DATABASE_URL="mysql://ЛОГИН:ПАРОЛЬ@ХОСТ:3306/ИМЯ_БД"
```

(Хост смотрите в панели — часто что-то вроде `xxx.timeweb.cloud`, не `localhost`.)

---

## Шаг 2. Код на GitHub

App Platform тянет код **только из Git**.

1. Зарегистрируйтесь на [github.com](https://github.com).
2. Создайте репозиторий (например `foodexpress`).
3. На ПК в папке проекта:

```powershell
git init
git add .
git commit -m "deploy"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/foodexpress.git
git push -u origin main
```

Файл `.env` в Git не попадёт (он в `.gitignore`) — это правильно.

---

## Шаг 3. Создать приложение

1. **App Platform** → **Создать**.
2. Источник: **GitHub** → разрешить доступ → выберите репозиторий, ветка **`main`**.
3. Тип: **Frontend** → **Next.js**.
4. Включите **SSR** (обязательно — иначе не будет API и входа).

### Сборка (если есть поля вручную)

| Поле | Значение |
|------|----------|
| Install | `npm ci` |
| Build | `npm run build:cloud` |
| Start | `npm start` |
| Node.js | 20 |

### Переменные окружения

Добавьте в настройках приложения:

```env
DATABASE_URL=mysql://ЛОГИН:ПАРОЛЬ@ХОСТ:3306/ИМЯ_БД
PRISMA_PROVIDER=mysql
AUTH_SECRET=любая-длинная-строка-32-символа-минимум
AUTH_URL=https://ваш-домен-из-панели.timeweb.cloud
NEXTAUTH_URL=https://ваш-домен-из-панели.timeweb.cloud
NODE_ENV=production
```

`AUTH_URL` — URL, который даст Timeweb после деплоя (можно обновить потом).

5. **Создать / Деплой** — ждите 5–15 минут.

---

## Шаг 4. Проверка

Откройте выданный URL → вход: **admin@food.ru** / **admin123**.

Если ошибка БД — проверьте `DATABASE_URL` и что SQL из `timeweb.sql` выполнен.

---

## Свой домен

**Домены и SSL** → привязать домен к приложению → обновить `AUTH_URL` и `NEXTAUTH_URL`.
