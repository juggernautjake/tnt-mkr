'use client';

import React, { useState, useEffect } from 'react';

interface AuthDebugInfo {
  authenticated?: boolean;
  user_id?: number;
  user_email?: string;
  role?: {
    id: number;
    name: string;
    type: string;
  } | null;
  is_admin?: boolean;
  message?: string;
  headers?: {
    authorization: string;
  };
  error?: string;
}

export default function AuthDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tnt-mkr.com';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminJwt = localStorage.getItem('adminJwt');
      const jwt = localStorage.getItem('jwt');
      setToken(adminJwt || jwt || null);
    }
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    const currentToken = localStorage.getItem('adminJwt') || localStorage.getItem('jwt');

    if (!currentToken) {
      setError('No token found in localStorage (checked adminJwt and jwt)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/shipping/admin/debug-auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (response.status === 401) {
        setError('401 Unauthorized - Token is invalid or expired');
        setLoading(false);
        return;
      }

      if (response.status === 403) {
        setError('403 Forbidden - Token is valid but user lacks admin permissions');
      }

      const data = await response.json();
      setDebugInfo(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Network error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('adminJwt');
    localStorage.removeItem('jwt');
    localStorage.removeItem('adminUser');
    setToken(null);
    setDebugInfo(null);
    alert('Tokens cleared. Please log in again.');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1a1a2e',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 9999,
      maxWidth: '400px',
      fontSize: '13px',
      fontFamily: 'monospace',
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#fe5100' }}>🔧 Auth Debug Panel</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Token Status:</strong>{' '}
        <span style={{ color: token ? '#4caf50' : '#f44336' }}>
          {token ? `Present (${token.substring(0, 20)}...)` : 'Not found'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button
          onClick={checkAuth}
          disabled={loading}
          style={{
            padding: '8px 15px',
            background: '#fe5100',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Checking...' : 'Check Auth'}
        </button>
        <button
          onClick={clearTokens}
          style={{
            padding: '8px 15px',
            background: '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear Tokens
        </button>
      </div>

      {error && (
        <div style={{
          background: '#f44336',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {debugInfo && (
        <div style={{
          background: '#2a2a4a',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px',
        }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>Authenticated:</strong>{' '}
            <span style={{ color: debugInfo.authenticated ? '#4caf50' : '#f44336' }}>
              {debugInfo.authenticated ? 'Yes' : 'No'}
            </span>
          </div>
          {debugInfo.user_id && (
            <div style={{ marginBottom: '5px' }}>
              <strong>User ID:</strong> {debugInfo.user_id}
            </div>
          )}
          {debugInfo.user_email && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Email:</strong> {debugInfo.user_email}
            </div>
          )}
          {debugInfo.role && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Role:</strong> {debugInfo.role.name} (type: {debugInfo.role.type})
            </div>
          )}
          <div style={{ marginBottom: '5px' }}>
            <strong>Is Admin:</strong>{' '}
            <span style={{ color: debugInfo.is_admin ? '#4caf50' : '#f44336' }}>
              {debugInfo.is_admin ? 'Yes ✓' : 'No ✗'}
            </span>
          </div>
          {debugInfo.message && (
            <div style={{ marginBottom: '5px' }}>
              <strong>Message:</strong> {debugInfo.message}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '10px', fontSize: '11px', color: '#888' }}>
        <strong>Troubleshooting:</strong>
        <ul style={{ margin: '5px 0 0 15px', padding: 0 }}>
          <li>If "Is Admin: No", check user role in Strapi</li>
          <li>Role name should contain "admin" (case-insensitive)</li>
          <li>Make sure you're logged in with the right account</li>
        </ul>
      </div>
    </div>
  );
}