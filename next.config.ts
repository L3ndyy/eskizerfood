import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone только для Timeweb zip; Vercel сам собирает деплой
  ...(process.env.VERCEL ? {} : { output: 'standalone' as const }),
  productionBrowserSourceMaps: false,
  outputFileTracingExcludes: {
    '*': [
      'node_modules/typescript/**',
      'node_modules/@types/**',
      'node_modules/eslint/**',
      'node_modules/eslint-*/**',
      'node_modules/better-sqlite3/**',
      'node_modules/@prisma/adapter-better-sqlite3/**',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
