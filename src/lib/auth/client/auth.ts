'use client';

// Types
export type JwtPayload = {
  userId: string;
  email: string;
  isAdmin?: boolean;
  exp?: number; // Expiration time
  iat?: number; // Issued at
  purpose?: 'authentication' | 'email_verification' | 'password_reset';
};

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

// Client-side JWT token validator
// This just checks format and expiration, not cryptographic signature
export const verifyTokenClientSide = (token: string): JwtPayload | null => {
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    
    return payload as JwtPayload;
  } catch (error) {
    console.error('Client-side token verification failed:', error);
    return null;
  }
};

// Browser cookie helpers
export const setAuthToken = (token: string): void => {
  document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
};

export const clearAuthToken = (): void => {
  document.cookie = 'authToken=; path=/; max-age=0';
};

export const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null; // Check if we're in a browser

  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    if (name) acc[name] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies.authToken || null;
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  // Use the client-side verification for browser
  const payload = verifyTokenClientSide(token);
  return payload !== null;
};

export const isAdmin = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  // Use the client-side verification for browser
  const payload = verifyTokenClientSide(token);
  if (!payload) return false;
  
  return !!payload.isAdmin;
};