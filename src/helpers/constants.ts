import { env } from "../utils/env.js";

export const ONE_HOUR = 60 * 60 * 1000;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_MONTH = ONE_DAY * 31;

const parseNumberEnv = (name: string, fallback?: number) => {
  const rawValue = env(name, fallback !== undefined ? String(fallback) : undefined);
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric env: ${name}`);
  }

  return parsed;
};

export const MONGODB_USER = env("MONGODB_USER");
export const MONGODB_PASSWORD = env("MONGODB_PASSWORD");
export const MONGODB_URL = env("MONGODB_URL");
export const MONGODB_DB = env("MONGODB_DB");

export const APP_ACCESS_TOKEN_SECRET = env("APP_ACCESS_TOKEN_SECRET");
export const APP_REFRESH_TOKEN_SECRET = env("APP_REFRESH_TOKEN_SECRET");
export const APP_ACCESS_TOKEN_TTL = parseNumberEnv("APP_ACCESS_TOKEN_TTL", 3600);
export const APP_REFRESH_TOKEN_TTL = parseNumberEnv("APP_REFRESH_TOKEN_TTL", 2592000);
