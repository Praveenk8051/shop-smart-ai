'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  getAuthToken, 
  verifyTokenClientSide, 
  clearAuthToken, 
  setAuthToken 
} from './client/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          // Use client-side verification for the browser
          const payload = verifyTokenClientSide(token);
          if (payload) {
            // Get full user data from /api/auth/me
            const response = await fetch('/api/auth/me', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
            } else {
              // Token is invalid or expired
              clearAuthToken();
              setUser(null);
            }
          } else {
            clearAuthToken();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token: string) => {
    setAuthToken(token);
    const payload = verifyTokenClientSide(token);
    if (payload) {
      setUser({
        id: payload.userId,
        email: payload.email,
        name: '' // Will be filled when we fetch from /api/auth/me
      });
      
      // Refresh the page to trigger a full reload with the new token
      router.refresh();
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};