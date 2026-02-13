/**
 * constant.ts
 * -----------
 * Production Configuration
 * Ensure that NEXT_PUBLIC_API_URL is set as an environment variable in production.
 * No development fallbacks are included.
 */

export const API = process.env.NEXT_PUBLIC_API_URL;
