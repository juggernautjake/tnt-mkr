// /app/api/check-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  // Retrieve the token from the "Authorization" header.
  // Expecting a header value of the form: "Bearer <token>"
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  
  // Extract the JWT from the header.
  const jwt = authHeader.split(' ')[1];
  if (!jwt) {
    return NextResponse.json({ error: 'Invalid authorization header format.' }, { status: 401 });
  }

  // Ensure the BACKEND_API_URL is set.
  const backendApiUrl = process.env.BACKEND_API_URL;
  if (!backendApiUrl) {
    return NextResponse.json(
      { error: 'Backend API URL is not configured.' },
      { status: 500 }
    );
  }

  try {
    // Make the API call to the backend to verify the token.
    const response = await axios.get(`${backendApiUrl}/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return NextResponse.json({ user: response.data });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Error verifying authentication:', err.response?.data || err.message);
    } else {
      console.error('Unknown error verifying authentication:', err);
    }
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
  }
}