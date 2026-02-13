'use client';

import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#fefaf0' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}