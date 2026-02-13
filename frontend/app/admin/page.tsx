'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminJwt') || localStorage.getItem('jwt');
    if (token) {
      router.replace('/admin/orders');
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fefaf0 0%, #fff5e6 25%, #ffe4cc 50%, #ffd9b3 75%, #ffe4cc 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #ddd',
          borderTopColor: '#fe5100',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }}></div>
        <p style={{ color: '#333' }}>Redirecting...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}