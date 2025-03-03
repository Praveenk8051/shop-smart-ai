import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  verifyTokenClientSide
} from '@/lib/auth/client/auth';
import {
  hashPassword, 
  comparePasswords, 
  generateToken, 
  verifyToken, 
  authenticate, 
  authenticateFromCookies,
  getUserFromCookie
} from '@/lib/auth/server/auth';
import { NextRequest } from 'next/server';

// Mock external modules
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('next/server', () => ({
  NextRequest: jest.fn()
}));

describe('Auth Utilities', () => {
  const mockJwtSecret = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset document.cookie for browser tests
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
    
    // Mock implementation for jwt methods
    (jwt.sign as jest.Mock).mockImplementation((payload, secret) => {
      if (secret !== mockJwtSecret) {
        throw new Error('Invalid secret');
      }
      return 'mocked-jwt-token';
    });
    
    (jwt.verify as jest.Mock).mockImplementation((token, secret) => {
      if (token === 'invalid-token') {
        throw new Error('Invalid token');
      }
      if (secret !== mockJwtSecret) {
        throw new Error('Invalid secret');
      }
      return { userId: 'user-123', email: 'test@example.com' };
    });
    
    // Mock implementation for bcrypt methods
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockImplementation(async (plain, hashed) => {
      return plain === 'correct-password';
    });
  });

  describe('Password Utilities', () => {
    it('should hash a password', async () => {
      const result = await hashPassword('password123');
      expect(result).toBe('hashed-password');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should correctly compare passwords', async () => {
      const validResult = await comparePasswords('correct-password', 'hashed-password');
      const invalidResult = await comparePasswords('wrong-password', 'hashed-password');
      
      expect(validResult).toBe(true);
      expect(invalidResult).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledTimes(2);
    });
  });

  describe('JWT Token Utilities', () => {
    it('should generate a token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const token = generateToken(payload);
      
      expect(token).toBe('mocked-jwt-token');
      expect(jwt.sign).toHaveBeenCalledWith(payload, mockJwtSecret, { expiresIn: '7d' });
    });

    it('should verify a valid token', () => {
      const result = verifyToken('valid-token');
      
      expect(result).toEqual({ userId: 'user-123', email: 'test@example.com' });
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', mockJwtSecret);
    });

    it('should return null for an invalid token', () => {
      const result = verifyToken('invalid-token');
      
      expect(result).toBeNull();
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', mockJwtSecret);
    });
  });

  describe('API Authentication', () => {
    it('should authenticate a valid request', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('Bearer valid-token')
        }
      } as unknown as NextRequest;
      
      const result = await authenticate(mockRequest);
      
      expect(result).toEqual({ 
        authenticated: true, 
        userId: 'user-123', 
        email: 'test@example.com' 
      });
      expect(mockRequest.headers.get).toHaveBeenCalledWith('authorization');
    });

    it('should reject a request with missing auth header', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as unknown as NextRequest;
      
      const result = await authenticate(mockRequest);
      
      expect(result).toEqual({ 
        authenticated: false, 
        error: 'Authorization header missing or invalid' 
      });
    });

    it('should reject a request with invalid token format', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('InvalidFormat token')
        }
      } as unknown as NextRequest;
      
      const result = await authenticate(mockRequest);
      
      expect(result).toEqual({ 
        authenticated: false, 
        error: 'Authorization header missing or invalid' 
      });
    });

    it('should reject a request with invalid token', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('Bearer invalid-token')
        }
      } as unknown as NextRequest;
      
      const result = await authenticate(mockRequest);
      
      expect(result).toEqual({ 
        authenticated: false, 
        error: 'Invalid or expired token' 
      });
    });
  });

  describe('Cookie Authentication', () => {
    it('should extract user from cookies', () => {
      const cookies = { authToken: 'valid-token' };
      const result = getUserFromCookie(cookies);
      
      expect(result).toEqual({ userId: 'user-123', email: 'test@example.com' });
    });

    it('should return null if no token in cookies', () => {
      const cookies = { otherCookie: 'value' };
      const result = getUserFromCookie(cookies);
      
      expect(result).toBeNull();
    });

    it('should authenticate from valid cookie header', async () => {
      const cookieHeader = 'authToken=valid-token; otherCookie=value';
      const result = await authenticateFromCookies(cookieHeader);
      
      expect(result).toEqual({ 
        authenticated: true, 
        userId: 'user-123', 
        email: 'test@example.com' 
      });
    });

    it('should handle missing cookie header', async () => {
      const result = await authenticateFromCookies(null);
      
      expect(result).toEqual({ 
        authenticated: false, 
        error: 'No cookies provided' 
      });
    });

    it('should handle missing auth token in cookies', async () => {
      const cookieHeader = 'otherCookie=value';
      const result = await authenticateFromCookies(cookieHeader);
      
      expect(result).toEqual({ 
        authenticated: false, 
        error: 'No auth token in cookies' 
      });
    });

    it('should handle invalid token in cookies', async () => {
      const cookieHeader = 'authToken=invalid-token; otherCookie=value';
      const result = await authenticateFromCookies(cookieHeader);
      
      expect(result).toEqual({ 
        authenticated: false, 
        error: 'Invalid or expired token' 
      });
    });
  });

  describe('Browser Auth Utilities', () => {
    it('should set auth token in cookies', () => {
      setAuthToken('test-token');
      
      expect(document.cookie).toContain('authToken=test-token');
      expect(document.cookie).toContain('path=/');
      expect(document.cookie).toContain('max-age=604800'); // 7 days
    });

    it('should clear auth token from cookies', () => {
      document.cookie = 'authToken=test-token; path=/; max-age=604800';
      clearAuthToken();
      
      expect(document.cookie).toContain('authToken=');
      expect(document.cookie).toContain('max-age=0');
    });

    it('should get auth token from cookies', () => {
      document.cookie = 'authToken=test-token; otherCookie=value';
      const token = getAuthToken();
      
      expect(token).toBe('test-token');
    });

    it('should return null if no auth token in cookies', () => {
      document.cookie = 'otherCookie=value';
      const token = getAuthToken();
      
      expect(token).toBeNull();
    });

    it('should check if user is authenticated with valid token', () => {
      document.cookie = 'authToken=valid-token';
      const result = isAuthenticated();
      
      expect(result).toBe(true);
    });

    it('should check if user is not authenticated with invalid token', () => {
      document.cookie = 'authToken=invalid-token';
      const result = isAuthenticated();
      
      expect(result).toBe(false);
    });

    it('should check if user is not authenticated with no token', () => {
      document.cookie = 'otherCookie=value';
      const result = isAuthenticated();
      
      expect(result).toBe(false);
    });
  });
});