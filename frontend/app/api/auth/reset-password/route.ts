import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  // try {
  //   // Parse the JSON body for the reset code and password details.
  //   const { code, password, passwordConfirmation } = await req.json();

  //   // Validate that all required fields are provided.
  //   if (!code || !password || !passwordConfirmation) {
  //     return NextResponse.json(
  //       { message: 'All fields (code, password, passwordConfirmation) are required.' },
  //       { status: 400 }
  //     );
  //   }

  //   // Ensure the new password and confirmation match.
  //   if (password !== passwordConfirmation) {
  //     return NextResponse.json(
  //       { message: 'Passwords do not match.' },
  //       { status: 400 }
  //     );
  //   }

  //   // Retrieve the backend API URL from the environment variables.
  //   const backendApiUrl = process.env.BACKEND_API_URL;
  //   if (!backendApiUrl) {
  //     return NextResponse.json(
  //       { message: 'Backend API URL is not configured.' },
  //       { status: 500 }
  //     );
  //   }

  //   // Make the API call to the backend's reset-password endpoint.
  //   const response = await axios.post(
  //     `${backendApiUrl}/auth/reset-password`,
  //     { code, password, passwordConfirmation },
  //     { headers: { 'Content-Type': 'application/json' } }
  //   );

  //   // Return success or failure based on the response status.
  //   if (response.status === 200) {
  //     return NextResponse.json(
  //       { message: 'Password reset successful.' },
  //       { status: 200 }
  //     );
  //   } else {
  //     return NextResponse.json(
  //       { message: 'Failed to reset password. Please try again.' },
  //       { status: response.status }
  //     );
  //   }
  // } catch (error: unknown) {
  //   // Handle errors from axios or other unexpected errors.
  //   if (axios.isAxiosError(error)) {
  //     const { status, data } = error.response || {
  //       status: 500,
  //       data: { message: 'An error occurred during password reset.' },
  //     };
  //     return NextResponse.json(
  //       { message: data.message || 'An error occurred during password reset.' },
  //       { status }
  //     );
  //   } else {
  //     return NextResponse.json(
  //       { message: 'Unable to connect to the server. Please try again later.' },
  //       { status: 500 }
  //     );
  //   }
  // }
  return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}