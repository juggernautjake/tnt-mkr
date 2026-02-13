'use client';

import * as React from 'react';

export default function Login() {
  return <div>This is the login page.</div>;
}


// 'use client';

// import { useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useAuthContext } from '../../context/AuthContext';
// import { Formik, Form, Field, ErrorMessage } from 'formik';
// import * as Yup from 'yup';
// import Link from 'next/link';

// export default function Login(): JSX.Element {
//   const router = useRouter();
//   const { login } = useAuthContext();
//   const [serverError, setServerError] = useState('');

//   const initialValues = {
//     identifier: '',
//     password: '',
//     rememberMe: false,
//   };

//   const validationSchema = Yup.object({
//     identifier: Yup.string().required('Email or Username is required'),
//     password: Yup.string().required('Password is required'),
//   });

//   const handleSubmit = async (values: typeof initialValues) => {
//     const { identifier, password, rememberMe } = values;
//     try {
//       const response = await axios.post('/api/auth/login', { identifier, password });
//       const { user, token } = response.data;
//       login(token, user, rememberMe); // Pass the token here
//       router.push('/');
//     } catch (err: unknown) {
//       console.error('Login error:', err);
//       const errorMessage =
//         axios.isAxiosError(err) && err.response?.data?.message
//           ? err.response.data.message
//           : 'Login failed. Please check your credentials or ensure your account is confirmed.';
//       setServerError(errorMessage);
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
//         <h1 className="text-2xl font-bold mb-4 text-[var(--orange)]">Login</h1>
//         <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
//           {({ isSubmitting }) => (
//             <Form className="flex flex-col gap-4">
//               <div>
//                 <Field
//                   type="text"
//                   name="identifier"
//                   placeholder="Email or Username"
//                   className="border border-gray-300 p-2 rounded w-full bg-gray-50 text-black"
//                   style={{ fontFamily: "'Roboto', sans-serif" }}
//                 />
//                 <ErrorMessage name="identifier" component="div" className="text-red-500" />
//               </div>
//               <div>
//                 <Field
//                   type="password"
//                   name="password"
//                   placeholder="Password"
//                   className="border border-gray-300 p-2 rounded w-full bg-gray-50 text-black"
//                   style={{ fontFamily: "'Roboto', sans-serif" }}
//                 />
//                 <ErrorMessage name="password" component="div" className="text-red-500" />
//               </div>
//               <div className="flex items-center">
//                 <Field type="checkbox" name="rememberMe" id="rememberMe" className="mr-2" />
//                 <label htmlFor="rememberMe" style={{ fontFamily: "'Roboto', sans-serif" }}>
//                   Remember Me
//                 </label>
//               </div>
//               {serverError && <p className="text-red-500">{serverError}</p>}
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`py-2 px-4 rounded text-white font-bold transition-colors duration-200 ${
//                   isSubmitting
//                     ? 'bg-[var(--orange)] opacity-50 cursor-not-allowed'
//                     : 'bg-[var(--orange)] hover:bg-[#c85200]'
//                 }`}
//                 style={{ fontFamily: "'Roboto', sans-serif" }}
//               >
//                 {isSubmitting ? 'Logging in...' : 'Login'}
//               </button>
//             </Form>
//           )}
//         </Formik>
//         <p className="mt-4" style={{ fontFamily: "'Roboto', sans-serif" }}>
//           Don't have an account?{' '}
//           <Link
//             href="/register"
//             className="underline text-[var(--orange)] hover:text-[#c85200] transition-colors duration-200"
//           >
//             Register here
//           </Link>
//           .
//         </p>
//         <p className="mt-2" style={{ fontFamily: "'Roboto', sans-serif" }}>
//           Forgot your password?{' '}
//           <Link
//             href="/forgot-password"
//             className="underline text-[var(--orange)] hover:text-[#c85200] transition-colors duration-200"
//           >
//             Reset it here
//           </Link>
//           .
//         </p>
//       </div>
//     </main>
//   );
// }