// Placeholder component since registration is disabled
export default function RegisterPage() {
  return (
    <main>
      <h1>Registration is temporarily disabled.</h1>
      <p>Please check back later.</p>
    </main>
  );
}



// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';

// export default function Register(): JSX.Element {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (password !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await axios.post('/api/auth/register', { username, email, password });
//       if (response.status === 200 || response.status === 201) {
//         setSuccess('Registration successful. Please check your email to confirm your account.');
//         setTimeout(() => {
//           router.push('/confirmation/pending');
//         }, 1500);
//       } else {
//         setError(response.data.message || 'Registration failed.');
//       }
//     } catch (err: unknown) {
//       console.error('Registration error:', err);
//       if (axios.isAxiosError(err) && err.response) {
//         setError(err.response.data.message || 'An error occurred during registration.');
//       } else {
//         setError('An unexpected error occurred.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main
//       className="flex flex-col items-center justify-center min-h-screen bg-[#fefaf0] p-10 text-[var(--orange)]"
//       style={{
//         background: 'radial-gradient(circle at top left, #fff 0%, #fefaf0 50%, #fefaf0 100%)',
//         fontFamily: "'Roboto', sans-serif",
//       }}
//     >
//       <div className="bg-white rounded-lg p-6 shadow-md max-w-sm w-full">
//         <h1 className="text-2xl font-bold mb-4 text-[var(--orange)]">Register</h1>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="text"
//             placeholder="Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//             className="border border-gray-300 rounded p-2 bg-gray-50 text-black"
//             style={{ fontFamily: "'Roboto', sans-serif" }}
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="border border-gray-300 rounded p-2 bg-gray-50 text-black"
//             style={{ fontFamily: "'Roboto', sans-serif" }}
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="border border-gray-300 rounded p-2 bg-gray-50 text-black"
//             style={{ fontFamily: "'Roboto', sans-serif" }}
//           />
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//             className="border border-gray-300 rounded p-2 bg-gray-50 text-black"
//             style={{ fontFamily: "'Roboto', sans-serif" }}
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className={`py-2 px-4 rounded text-white font-bold transition-colors duration-200 ${
//               loading
//                 ? 'bg-[var(--orange)] opacity-50 cursor-not-allowed'
//                 : 'bg-[var(--orange)] hover:bg-[#c85200]'
//             }`}
//             style={{ fontFamily: "'Roboto', sans-serif" }}
//           >
//             {loading ? 'Registering...' : 'Register'}
//           </button>
//           {error && <p className="text-red-500">{error}</p>}
//           {success && <p className="text-green-500">{success}</p>}
//         </form>
//       </div>
//     </main>
//   );
// }
