'use client';

import * as React from 'react';

export default function ConfirmEmail() {
  return <div>This is the email confirmation page.</div>;
}

// 'use client';

// import { useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import axios from 'axios';

// export default function ConfirmEmail() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const code = searchParams.get('confirmation');

//   useEffect(() => {
//     if (code) {
//       confirmEmail(code);
//     } else {
//       router.push('/confirmation/error');
//     }
//   }, [code]);

//   const confirmEmail = async (code: string) => {
//     try {
//       const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
//       await axios.get(`${backendApiUrl}/api/auth/email-confirmation?confirmation=${code}`);
//       router.push('/confirmation/success');
//     } catch (err) {
//       console.error('Confirmation error:', err);
//       router.push('/confirmation/error');
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-[#fefaf0]">
//       <p className="text-[var(--orange)]">Confirming your email...</p>
//     </div>
//   );
// }