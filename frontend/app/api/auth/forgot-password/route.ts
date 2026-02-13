import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  // try {
  //   const { email, url } = await req.json();

  //   if (!email || !url) {
  //     return NextResponse.json(
  //       { message: 'Email and URL are required.' },
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

  //   const response = await axios.post(
  //     `${backendApiUrl}/auth/forgot-password`,
  //     { email, url },
  //     { headers: { 'Content-Type': 'application/json' } }
  //   );

  //   if (response.status === 200) {
  //     return NextResponse.json(
  //       { message: 'Reset link sent to your email.' },
  //       { status: 200 }
  //     );
  //   } else {
  //     return NextResponse.json(
  //       { message: 'Failed to send reset link.' },
  //       { status: response.status }
  //     );
  //   }
  // } catch (error: unknown) {
  //   console.error('Forgot password error:', error);
  //   if (axios.isAxiosError(error)) {
  //     const status = error.response?.status || 500;
  //     const message = error.response?.data?.message || 'An error occurred while sending the reset link.';
  //     return NextResponse.json({ message }, { status });
  //   }
  //   return NextResponse.json(
  //     { message: 'An unexpected error occurred.' },
  //     { status: 500 }
  //   );
  // }
  return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}