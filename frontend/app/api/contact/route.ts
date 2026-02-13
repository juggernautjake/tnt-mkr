import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import sanitizeHtml from 'sanitize-html';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedName = sanitizeHtml(name);
    const sanitizedEmail = sanitizeHtml(email);
    const sanitizedMessage = sanitizeHtml(message);

    const backendApiUrl = process.env.BACKEND_API_URL;
    if (!backendApiUrl) {
      return NextResponse.json(
        { message: 'Backend API URL is not configured.' },
        { status: 500 }
      );
    }

    // Use Strapi's contact endpoint
    const response = await axios.post(
      `${backendApiUrl}/api/contacts`,
      { data: { name: sanitizedName, email: sanitizedEmail, message: sanitizedMessage } },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.status === 201) {
      return NextResponse.json(
        { message: 'Your message has been sent successfully!' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Failed to send your message. Please try again.' },
        { status: response.status }
      );
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Failed to send your message. Please try again later.' },
      { status: 500 }
    );
  }
}