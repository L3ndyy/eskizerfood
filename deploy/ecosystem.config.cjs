/** PM2 на VPS Timeweb. Запуск из корня проекта после сборки standalone. */
module.exports = {
  apps: [
    {
      name: 'foodexpress',
      cwd: __dirname + '/..',
      script: '.next/standalone/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
