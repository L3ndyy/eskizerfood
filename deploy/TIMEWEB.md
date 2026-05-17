# Timeweb — 3 шага

См. **deploy/КАК-ЗАГРУЗИТЬ.txt** или выполните:

```powershell
npm run dist
```

1. **dist/timeweb.sql** → phpMyAdmin → SQL → выполнить целиком  
2. **dist/env.server.example** → `.env` на сервере (данные MySQL из панели Timeweb)  
3. **dist/app/** → загрузить на хостинг с Node.js, запуск: `node server.js`

Локально: `copy .env.example .env` → `npm run dev`
