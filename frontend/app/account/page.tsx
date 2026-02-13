// /app/account/page.tsx
'use client';

import ProtectedRoute from '../../components/ProtectedRoute';

export default function AccountPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-navy p-10 text-black dark:text-white">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-lg w-full">
          <h1 className="text-3xl font-bold mb-4 text-orange-500">My Account</h1>
          {/* <p>Account details and order history will be shown here.</p> */}
          <p>Account functionality is temporarily disabled.</p>
        </div>
      </main>
    </ProtectedRoute>
  );
}