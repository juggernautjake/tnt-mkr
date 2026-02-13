import { AUTH_TOKEN } from "./constant";

/**
 * helpers.ts
 * ----------
 * Simple helper functions for handling tokens.
 * Currently uses localStorage. Consider migrating to HTTP-only cookies for better security.
 */

export const getToken = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN) : null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined' && token) {
    localStorage.setItem(AUTH_TOKEN, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN);
  }
};
