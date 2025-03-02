import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth/auth';
import prisma from '@/lib/db/prisma';
import { createApiResponse } from '@/lib/api/validation';

// Google OAuth constants
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

// Generate Google OAuth URL for the frontend
export async function GET(req: NextRequest) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Google auth is not configured', 500)
      );
    }

    const scope = encodeURIComponent('email profile');
    const responseType = encodeURIComponent('code');
    const clientId = encodeURIComponent(GOOGLE_CLIENT_ID);
    const redirectUri = encodeURIComponent(REDIRECT_URI);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=${scope}&response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&prompt=select_account`;

    // Redirect to Google's OAuth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Failed to initialize Google Sign-In', 500)
    );
  }
}