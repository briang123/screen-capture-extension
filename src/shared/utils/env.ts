// src/shared/utils/env.ts
// Utility to load the correct .env file based on NODE_ENV for both app and test environments.
// Usage (ESM): import { loadEnv } from './env'; loadEnv();
// Usage (CJS): const { loadEnv } = require('./env'); loadEnv();

import dotenv from 'dotenv';

export function loadEnv() {
  const envFile =
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : process.env.NODE_ENV === 'development'
        ? '.env.development'
        : '.env';
  dotenv.config({ path: envFile });
}

export function parseEnvBool(val: string | undefined, defaultVal = false): boolean {
  return val === undefined ? defaultVal : val === 'true';
}
