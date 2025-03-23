'use server';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { JwtPayload, User } from '../client/auth';

// Constants
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env';
const JWT_EXPIRES_IN = '7d';

// Password hashing functions
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

// JWT token functions
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Authentication middleware for API routes
export const authenticate = async (req: NextRequest) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Authorization header missing or invalid' };
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return { authenticated: false, error: 'Invalid or expired token' };
    }

    return { 
      authenticated: true, 
      userId: payload.userId, 
      email: payload.email,
      isAdmin: payload.isAdmin || false
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
};

// Helper to extract user from cookies (for server components)
export const getUserFromCookie = (cookies: { [key: string]: string }): JwtPayload | null => {
  const token = cookies.authToken;
  if (!token) return null;
  
  return verifyToken(token);
};

// Cookie-based authentication for pages
export const authenticateFromCookies = async (cookieHeader: string | null): Promise<{
  authenticated: boolean;
  userId?: string;
  email?: string;
  isAdmin?: boolean;
  error?: string;
}> => {
  try {
    if (!cookieHeader) {
      return { authenticated: false, error: 'No cookies provided' };
    }

    // Parse cookies from the cookie header
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      const value = rest.join('=');
      if (name) cookies[name.trim()] = decodeURIComponent(value);
    });

    const token = cookies.authToken;
    if (!token) {
      return { authenticated: false, error: 'No auth token in cookies' };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return { authenticated: false, error: 'Invalid or expired token' };
    }

    return { 
      authenticated: true, 
      userId: payload.userId, 
      email: payload.email,
      isAdmin: payload.isAdmin || false
    };
  } catch (error) {
    console.error('Cookie authentication error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
};

// Admin authentication middleware for API routes
export const requireAdmin = async (req: NextRequest) => {
  try {
    // First authenticate the user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return { authorized: false, error: authResult.error };
    }

    // Check if the user is an admin
    if (!authResult.isAdmin) {
      return { authorized: false, error: 'Admin access required' };
    }

    return { authorized: true, userId: authResult.userId, email: authResult.email };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { authorized: false, error: 'Admin authentication failed' };
  }
};