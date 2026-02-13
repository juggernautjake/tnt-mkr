/**
 * Centralized API utilities for the TNT MKR frontend.
 * Consolidates duplicated fetch logic, header construction,
 * and response parsing into reusable functions.
 */

import axios from 'axios';
import type { AuthHeaders } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Default timeout for API requests (15 seconds) */
const DEFAULT_TIMEOUT = 15000;

/**
 * Build auth/session headers for API requests.
 * Used by cart, checkout, and any authenticated endpoints.
 */
export function buildHeaders(
  isAuthenticated: boolean,
  token: string | null,
  guestSessionId: string | null,
): AuthHeaders {
  return {
    'Content-Type': 'application/json',
    ...(isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(guestSessionId ? { 'x-guest-session': guestSessionId } : {}),
  };
}

/**
 * Get the API base URL. Throws if not configured.
 */
export function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }
  return API_URL;
}

/**
 * Normalize Strapi v4 response data.
 * Handles both flat and nested `data[].attributes` formats.
 */
export function normalizeStrapiItem<T>(item: Record<string, unknown>): T {
  if (item.attributes && typeof item.attributes === 'object') {
    return { id: item.id, ...(item.attributes as object) } as T;
  }
  return item as T;
}

/**
 * Normalize a Strapi collection response to an array.
 */
export function normalizeStrapiCollection<T>(responseData: unknown): T[] {
  const data = (responseData as Record<string, unknown>)?.data ?? responseData;
  if (!Array.isArray(data)) return [];
  return data.map((item: Record<string, unknown>) => normalizeStrapiItem<T>(item));
}

/**
 * Create an axios instance with default config.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
});
