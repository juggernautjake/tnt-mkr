import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  // try {
  //   const { username, email, password, guestSessionId } = await req.json();

  //   if (!username || !email || !password) {
  //     return NextResponse.json(
  //       { message: 'All fields are required.' },
  //       { status: 400 }
  //     );
  //   }

  //   const backendApiUrl = process.env.BACKEND_API_URL;
  //   if (!backendApiUrl) {
  //     return NextResponse.json(
  //       { message: 'Backend API URL not configured.' },
  //       { status: 500 }
  //     );
  //   }

  //   const payload = { username, email, password, guestSessionId };

  //   // Ensure the full Strapi endpoint is used
  //   const response = await axios.post(`${backendApiUrl}/auth/local/register`, payload, {
  //     headers: { 'Content-Type': 'application/json' },
  //   });

  //   if (response.status === 200 || response.status === 201) {
  //     return NextResponse.json(
  //       { message: 'Registration successful. Please check your email to confirm your account.' },
  //       { status: 200 }
  //     );
  //   } else {
  //     return NextResponse.json(
  //       { message: 'Registration failed.' },
  //       { status: response.status }
  //     );
  //   }
  // } catch (error: unknown) {
  //   console.error('Registration error:', error);
  //   if (axios.isAxiosError(error) && error.response) {
  //     const status = error.response.status;
  //     const errorData = error.response.data?.error;
  //     const message = errorData?.message || 'An error occurred during registration.';
      
  //     // Handle Strapi unique constraint errors
  //     if (status === 400 && errorData?.details?.errors?.length) {
  //       const fieldErrors = errorData.details.errors.map((err: any) => err.message).join(', ');
  //       return NextResponse.json({ message: fieldErrors }, { status });
  //     }
  //     return NextResponse.json({ message }, { status });
  //   }
  //   return NextResponse.json(
  //     { message: 'An unexpected error occurred.' },
  //     { status: 500 }
  //   );
  // }
  return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}