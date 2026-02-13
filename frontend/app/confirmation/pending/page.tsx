'use client';

import * as React from 'react';

export default function ConfirmationPending() {
  return <div>Pending</div>;
}


// 'use client';

// import { useState } from 'react';
// import axios from 'axios';

// /**
//  * ConfirmationPending Page
//  * -------------------------
//  * Instructs the user to check their inbox for the confirmation email.
//  * Provides a form for resending the confirmation email if not received.
//  * Standardized styling with Roboto font and consistent background.
//  */

// export default function ConfirmationPending() {
//   const [resending, setResending] = useState(false);
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [email, setEmail] = useState('');

//   const handleResend = async () => {
//     if (!email) {
//       setError('Please enter your email.');
//       return;
//     }

//     setResending(true);
//     setMessage('');
//     setError('');
//     try {
//       const response = await axios.post('/api/auth/resend-confirmation', { email });
//       if (response.status === 200) {
//         setMessage('A new confirmation email has been sent to your email address.');
//       } else {
//         setError(response.data.message || 'Failed to resend confirmation email.');
//       }
//     } catch (err) {
//       console.error('Resend confirmation error:', err);
//       if (axios.isAxiosError(err)) {
//         setError(err.response?.data?.message || 'Failed to resend the confirmation email. Please try again.');
//       } else {
//         setError('An unexpected error occurred.');
//       }
//     } finally {
//       setResending(false);
//     }
//   };

//   return (
//     <div
//       className="flex flex-col items-center justify-center min-h-screen bg-[#fefaf0] p-10 text-[var(--orange)]"
//       style={{
//         background: 'radial-gradient(circle at top left, #fff 0%, #fefaf0 50%, #fefaf0 100%)',
//         fontFamily: "'Roboto', sans-serif"
//       }}
//     >
//       <div className="bg-white rounded-lg p-6 shadow-md max-w-md w-full">
//         <h1 className="text-2xl font-bold mb-4 text-[var(--orange)]">Check Your Email</h1>
//         <p className="mb-4">
//           We've sent a confirmation email to the address you provided during registration.
//           Please click the confirmation link in your inbox to activate your account.
//         </p>
//         <p className="mb-4">If you did not receive the email, you can resend it below:</p>
//         <input
//           type="email"
//           placeholder="Enter your email"
//           className="border border-gray-300 rounded p-2 w-full mb-4 bg-gray-50 text-black"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           style={{ fontFamily: "'Roboto', sans-serif" }}
//         />
//         <button
//           onClick={handleResend}
//           disabled={resending}
//           className={`py-2 px-4 rounded font-bold text-white transition-colors ${
//             resending ? 'bg-[var(--orange)] opacity-50 cursor-not-allowed' : 'bg-[var(--orange)] hover:bg-[#c85200]'
//           }`}
//           style={{ fontFamily: "'Roboto', sans-serif" }}
//         >
//           {resending ? 'Resending...' : 'Resend Confirmation Email'}
//         </button>
//         {message && <p className="text-green-500 mt-4">{message}</p>}
//         {error && <p className="text-red-500 mt-4">{error}</p>}
//       </div>
//     </div>
//   );
// }