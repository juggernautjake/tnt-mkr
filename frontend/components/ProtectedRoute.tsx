'use client';

import { useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element | null {
  // const { isAuthenticated } = useAuthContext();
  // const router = useRouter();
  // const pathname = usePathname();

  // const guestAllowedRoutes = ['/cart-and-checkout'];

  // useEffect(() => {
  //   if (!isAuthenticated && !guestAllowedRoutes.includes(pathname)) {
  //     router.replace('/login');
  //   }
  // }, [isAuthenticated, router, pathname]);

  // if (!isAuthenticated && !guestAllowedRoutes.includes(pathname)) {
  //   return null;
  // }

  return <>{children}</>;
}