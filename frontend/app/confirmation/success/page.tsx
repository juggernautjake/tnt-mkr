'use client';

import * as React from 'react';

export default function ConfirmationSuccessPage() {
  return <div>success</div>;
}

// 'use client';

// import { useRouter } from 'next/navigation';

// /**
//  * ConfirmationSuccess Page
//  * -------------------------
//  * Displays a success message after email confirmation.
//  * Standardized styling with Roboto font and consistent background.
//  */

// export default function ConfirmationSuccessPage() {
//   const router = useRouter();

//   return (
//     <main
//       className="flex flex-col items-center justify-center min-h-screen bg-[#fefaf0] p-10 text-[var(--orange)]"
//       style={{
//         background: 'radial-gradient(circle at top left, #fff 0%, #fefaf0 50%, #fefaf0 100%)',
//         fontFamily: "'Roboto', sans-serif"
//       }}
//     >
//       <div className="bg-white rounded-lg p-6 shadow-md max-w-md w-full text-center">
//         <h1 className="text-2xl font-bold mb-4 text-[var(--orange)]">Email Confirmed!</h1>
//         <p className="mb-4">
//           Your email has been successfully confirmed. You are now logged in.
//         </p>
//         <button
//           onClick={() => router.push('/login')}
//           className="bg-[var(--orange)] hover:bg-[#c85200] text-white py-2 px-4 rounded font-bold transition-colors duration-200"
//           style={{ fontFamily: "'Roboto', sans-serif" }}
//         >
//           Login Now
//         </button>
//       </div>
//     </main>
//   );
// }