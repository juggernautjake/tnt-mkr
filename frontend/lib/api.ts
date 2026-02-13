/**
 * Centralized API utilities for the TNT MKR frontend.
 */

import type { AuthHeaders } from './types';

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
