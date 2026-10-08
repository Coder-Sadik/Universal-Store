import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from 'path'
import dotenv from 'dotenv'

// Load environment from current working directory
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Fallback to local and workspace root .env if running from varying locations
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '.env') })
  dotenv.config({ path: path.resolve(__dirname, '../../.env') })
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing. It must be provided in .env.")
}

if (!process.env.COOKIE_SECRET) {
  throw new Error("COOKIE_SECRET environment variable is missing. It must be provided in .env.")
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    ...(process.env.REDIS_URL
      ? [
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
          {
            resolve: "@medusajs/medusa/cache-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ]
      : []),
  ],
})
