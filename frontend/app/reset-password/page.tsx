'use client';

import * as React from 'react';

export default function ResetPassword() {
  return <div>This is the reset password page.</div>;
}


// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import axios from 'axios';
// import styles from './resetPassword.module.css';

// /**
//  * Reset Password Page
//  * ---------------------
//  * Allows users to reset their password with a confirmation code.
//  * Uses CSS module for standardized styling with light mode design.
//  */

// export const dynamic = 'force-dynamic';

// export default function ResetPassword(): JSX.Element {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [password, setPassword] = useState('');
//   const [passwordConfirmation, setPasswordConfirmation] = useState('');
//   const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
//   const [errorMessage, setErrorMessage] = useState('');
//   const code = searchParams.get('code');

//   useEffect(() => {
//     if (!code) {
//       setStatus('error');
//       setErrorMessage('Invalid or missing reset token.');
//     }
//   }, [code]);

//   const handleResetPassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (password !== passwordConfirmation) {
//       setStatus('error');
//       setErrorMessage('Passwords do not match.');
//       return;
//     }
//     setStatus('loading');
//     try {
//       const response = await axios.post('/api/auth/reset-password', {
//         code,
//         password,
//         passwordConfirmation,
//       });
//       if (response.status === 200) {
//         setStatus('success');
//         setTimeout(() => router.push('/login'), 2000);
//       }
//     } catch (err) {
//       setStatus('error');
//       setErrorMessage('Failed to reset password. The link may be invalid or expired.');
//       console.error('Reset password error:', err);
//     }
//   };

//   return (
//     <main className={styles.resetPasswordMain}>
//       <div className={styles.resetPasswordContainer}>
//         <h1 className={styles.title}>Reset Password</h1>
//         {status === 'success' ? (
//           <p className={styles.successMessage}>
//             Your password has been reset. <a href="/login">Log in</a>
//           </p>
//         ) : (
//           <form onSubmit={handleResetPassword}>
//             <label className={styles.label}>New Password</label>
//             <input
//               type="password"
//               className={styles.input}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <label className={styles.label}>Confirm Password</label>
//             <input
//               type="password"
//               className={styles.input}
//               value={passwordConfirmation}
//               onChange={(e) => setPasswordConfirmation(e.target.value)}
//               required
//             />
//             {status === 'error' && <p className={styles.errorMessage}>{errorMessage}</p>}
//             <button
//               type="submit"
//               disabled={status === 'loading' || !code}
//               className={styles.button}
//             >
//               {status === 'loading' ? 'Resetting...' : 'Reset Password'}
//             </button>
//           </form>
//         )}
//       </div>
//     </main>
//   );
// }