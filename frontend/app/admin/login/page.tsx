'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { FaSun, FaMoon } from 'react-icons/fa';
import styles from './login.module.css';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin/orders';
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tnt-mkr.com';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if already logged in as admin
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('adminJwt');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/users/me?populate=role`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            const roleName = userData.role?.name?.toLowerCase();
            const roleType = userData.role?.type?.toLowerCase();

            if (roleName === 'admin' || roleType === 'admin') {
              router.push(redirectUrl);
              return;
            }
          }
          localStorage.removeItem('adminJwt');
          localStorage.removeItem('adminUser');
        } catch {
          localStorage.removeItem('adminJwt');
          localStorage.removeItem('adminUser');
        }
      }
      setCheckingAuth(false);
    };

    checkExistingAuth();
  }, [API_URL, redirectUrl, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.identifier || !formData.password) {
      setError('Please enter your email/username and password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error?.message || data.message || 'Login failed. Please check your credentials.';
        throw new Error(errorMessage);
      }

      const userResponse = await fetch(`${API_URL}/api/users/me?populate=role`, {
        headers: {
          Authorization: `Bearer ${data.jwt}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to verify user permissions');
      }

      const userData = await userResponse.json();
      const roleName = userData.role?.name?.toLowerCase();
      const roleType = userData.role?.type?.toLowerCase();

      if (roleName !== 'admin' && roleType !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      localStorage.setItem('adminJwt', data.jwt);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      localStorage.setItem('jwt', data.jwt);

      router.push(redirectUrl);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  if (checkingAuth) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {mounted && (
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        >
          {resolvedTheme === 'light' ? (
            <FaMoon className={styles.themeIcon} />
          ) : (
            <FaSun className={styles.themeIcon} />
          )}
        </button>
      )}

      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>🔐</div>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>TNT MKR</h1>
            <span className={styles.adminBadge}>ADMIN</span>
          </div>
          <p>Sign in to access order management</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="identifier">Email or Username</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your email or username"
              autoComplete="username"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.buttonSpinner}></span>
                Signing in...
              </>
            ) : (
              'Sign In to Admin'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>This area is restricted to authorized administrators only.</p>
          <a href="/" className={styles.backLink}>← Back to Store</a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fefaf0 0%, #fff5e6 25%, #ffe4cc 50%, #ffd9b3 75%, #ffe4cc 100%)'
      }}>
        <p>Loading...</p>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}