import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const settings = {
  APP_HOST: process.env.APP_HOST || '',
  GETGATHER_URL: process.env.GETGATHER_URL || '',
  GETGATHER_API_KEY: process.env.GETGATHER_API_KEY || '',
  MAXMIND_ACCOUNT_ID: process.env.MAXMIND_ACCOUNT_ID || '',
  MAXMIND_LICENSE_KEY: process.env.MAXMIND_LICENSE_KEY || '',
  TOGETHER_API_KEY: process.env.TOGETHER_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
} as const;
