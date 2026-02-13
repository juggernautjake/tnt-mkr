import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  // try {
  //   const { email } = await req.json();

  //   if (!email) {
  //     return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
  //   }

  //   // Ensure BACKEND_API_URL is configured
  //   const backendApiUrl = process.env.BACKEND_API_URL;
  //   if (!backendApiUrl) {
  //     return NextResponse.json({ message: 'Backend API URL not configured.' }, { status: 500 });
  //   }

  //   // Call the existing backend endpoint for resending confirmation email
  //   const response = await axios.post(
  //     `${backendApiUrl}/auth/resend-confirmation`,
  //     { email }
  //   );

  //   if (response.status === 200) {
  //     return NextResponse.json({ message: 'Confirmation email sent.' }, { status: 200 });
  //   } else {
  //     return NextResponse.json({ message: 'Failed to send confirmation email.' }, { status: response.status });
  //   }
  // } catch (error: unknown) {
  //   console.error('Resend confirmation email error:', error);
  //   if (axios.isAxiosError(error)) {
  //     const status = error.response?.status || 500;
  //     const message =
  //       error.response?.data?.message ||
  //       'An error occurred while resending the confirmation email.';
  //     return NextResponse.json({ message }, { status });
  //   }
  //   return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  // }
  return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}