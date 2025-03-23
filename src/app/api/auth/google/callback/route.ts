import { NextRequest, NextResponse } from 'next/server';
import { generateToken, hashPassword } from '@/lib/auth/server/auth';
import prisma from '@/lib/db/prisma';
import { cookies } from 'next/headers';
import { createApiResponse } from '@/lib/api/validation';

// Google OAuth constants
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function GET(req: NextRequest) {
  try {
    // Extract the authorization code from the URL
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // Handle user denied access
    if (error || !code) {
      console.error('Google OAuth error:', error || 'No code provided');
      return NextResponse.redirect(`${FRONTEND_URL}/auth?error=google_auth_failed`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', await tokenResponse.text());
      return NextResponse.redirect(`${FRONTEND_URL}/auth?error=token_exchange_failed`);
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info:', await userInfoResponse.text());
      return NextResponse.redirect(`${FRONTEND_URL}/auth?error=user_info_failed`);
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Generate a random password for Google users
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await hashPassword(randomPassword);

      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          password: hashedPassword, // Store the hashed random password
          isAdmin: false, // Regular users only via Google SSO
          authProvider: 'google',
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin || false,
    });

    // Set cookies
    const cookieStore = cookies();
    cookieStore.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });

    // Redirect to home page
    return NextResponse.redirect(`${FRONTEND_URL}`);
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(`${FRONTEND_URL}/auth?error=server_error`);
  }
}