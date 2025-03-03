import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { RequireAuth } from '@/lib/auth/RequireAuth';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import * as authUtils from '@/lib/auth/client/auth';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/auth/client/auth', () => ({
  getAuthToken: jest.fn(),
  verifyTokenClientSide: jest.fn(),
  clearAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
}));

jest.mock('@/lib/auth/AuthContext', () => {
  const originalModule = jest.requireActual('@/lib/auth/AuthContext');
  
  return {
    ...originalModule,
    useAuth: jest.fn(),
  };
});

// Mock fetch for the /api/auth/me endpoint
global.fetch = jest.fn();

describe('RequireAuth Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  };
  
  // Mocked child component
  const ProtectedComponent = () => (
    <div data-testid="protected-content">Protected Content</div>
  );
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }),
    });
  });
  
  it('should render loading state while checking authentication', () => {
    // Mock authentication is loading
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn()
    });
    
    render(
      <RequireAuth>
        <ProtectedComponent />
      </RequireAuth>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
  
  it('should redirect to login page if user is not authenticated', async () => {
    // Mock user is not authenticated
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn()
    });
    
    render(
      <RequireAuth>
        <ProtectedComponent />
      </RequireAuth>
    );
    
    expect(mockRouter.push).toHaveBeenCalledWith('/auth');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
  
  it('should render children if user is authenticated', async () => {
    // Mock user is authenticated
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn()
    });
    
    render(
      <RequireAuth>
        <ProtectedComponent />
      </RequireAuth>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});