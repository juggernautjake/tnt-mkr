import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  // try {
  //   const { identifier, password } = await req.json();

  //   if (!identifier || !password) {
  //     return NextResponse.json(
  //       { message: 'Both email/username and password are required.' },
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

  //   const response = await axios.post(`${backendApiUrl}/auth/local`, { identifier, password });

  //   if (response.status === 200) {
  //     const { jwt, user } = response.data;
  //     return NextResponse.json({ user, token: jwt }, { status: 200 });
  //   } else {
  //     return NextResponse.json(
  //       { message: 'Login failed. Please try again.' },
  //       { status: response.status }
  //     );
  //   }
  // } catch (error: unknown) {
  //   console.error('Login error:', error);
  //   if (axios.isAxiosError(error)) {
  //     const status = error.response?.status || 500;
  //     const message = error.response?.data?.error?.message || 'An error occurred during login.';
  //     return NextResponse.json({ message }, { status });
  //   }
  //   return NextResponse.json(
  //     { message: 'An unexpected error occurred.' },
  //     { status: 500 }
  //   );
  // }
  return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}