'use client';

import * as React from 'react';

export default function ForgotPassword() {
  return <div>This is the forgot password page.</div>;
}

// 'use client';

// import { useState } from 'react';
// import axios from 'axios';
// import Link from 'next/link';
// import styles from './forgotPassword.module.css';

// export default function ForgotPassword(): JSX.Element {
//   const [email, setEmail] = useState('');
//   const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
//   const [errorMessage, setErrorMessage] = useState('');

//   const handleForgotPassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus('loading');
//     setErrorMessage('');
//     try {
//       const response = await axios.post('/api/auth/forgot-password', {
//         email,
//         url: `${window.location.origin}/reset-password`,
//       });
//       if (response.status === 200) {
//         setStatus('sent');
//       }
//     } catch (err: unknown) {
//       console.error('Forgot password error:', err);
//       setStatus('error');
//       setErrorMessage('Failed to send password reset email. Please check the email address.');
//     }
//   };

//   return (
//     <main className={styles.forgotPasswordMain}>
//       <div className={styles.forgotPasswordContainer}>
//         <h1 className={styles.title}>Forgot Password</h1>
//         <p className={styles.instructions}>
//           Please enter the email address associated with your account. We will send you a link to reset your password.
//         </p>
//         {status === 'sent' ? (
//           <p className={styles.successMessage}>
//             A password reset email has been sent to your inbox.{' '}
//             <Link href="/login" className={styles.link}>
//               Back to Login
//             </Link>
//           </p>
//         ) : (
//           <form onSubmit={handleForgotPassword}>
//             <label className={styles.label}>Email Address</label>
//             <input
//               type="email"
//               className={styles.input}
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             {status === 'error' && <p className={styles.errorMessage}>{errorMessage}</p>}
//             <button
//               type="submit"
//               disabled={status === 'loading'}
//               className={`${styles.button} ${status === 'loading' ? styles.buttonDisabled : ''}`}
//             >
//               {status === 'loading' ? 'Sending...' : 'Send Reset Email'}
//             </button>
//           </form>
//         )}
//       </div>
//     </main>
//   );
// }