import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import * as authUtils from '@/lib/auth/client/auth';
import { useRouter } from 'next/navigation';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the auth utilities
jest.mock('@/lib/auth/client/auth', () => ({
  getAuthToken: jest.fn(),
  verifyTokenClientSide: jest.fn(),
  clearAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
}));

// Mock fetch for the /api/auth/me endpoint
global.fetch = jest.fn();

// Component to test useAuth hook
const TestComponent = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <button onClick={() => login('test-token')} data-testid="login-btn">Login</button>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };
  
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

  it('initializes with loading state and no user', async () => {
    (authUtils.getAuthToken as jest.Mock).mockReturnValue(null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state might be already updated due to the async nature of initialization
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
  });

  it('loads user from valid token in cookies', async () => {
    // Mock a valid token in cookies
    (authUtils.getAuthToken as jest.Mock).mockReturnValue('valid-token');
    (authUtils.verifyTokenClientSide as jest.Mock).mockReturnValue({
      userId: 'user-123',
      email: 'test@example.com'
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete and user to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    
    expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', {
      headers: { Authorization: 'Bearer valid-token' }
    });
  });

  it('handles API error when fetching user data', async () => {
    // Mock a valid token but API error
    (authUtils.getAuthToken as jest.Mock).mockReturnValue('valid-token');
    (authUtils.verifyTokenClientSide as jest.Mock).mockReturnValue({
      userId: 'user-123',
      email: 'test@example.com'
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
    expect(authUtils.clearAuthToken).toHaveBeenCalled();
  });

  it('handles invalid token in cookies', async () => {
    // Mock an invalid token
    (authUtils.getAuthToken as jest.Mock).mockReturnValue('invalid-token');
    (authUtils.verifyTokenClientSide as jest.Mock).mockReturnValue(null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
    expect(authUtils.clearAuthToken).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles login action', async () => {
    const user = userEvent.setup();
    (authUtils.getAuthToken as jest.Mock).mockReturnValue(null);
    (authUtils.verifyTokenClientSide as jest.Mock).mockImplementation((token) => {
      if (token === 'test-token') {
        return {
          userId: 'user-123',
          email: 'login@example.com'
        };
      }
      return null;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    await user.click(screen.getByTestId('login-btn'));
    
    expect(authUtils.setAuthToken).toHaveBeenCalledWith('test-token');
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-email').textContent).toBe('login@example.com');
  });

  it('handles logout action', async () => {
    const user = userEvent.setup();
    // Start with authenticated user
    (authUtils.getAuthToken as jest.Mock).mockReturnValue('valid-token');
    (authUtils.verifyTokenClientSide as jest.Mock).mockReturnValue({
      userId: 'user-123',
      email: 'test@example.com'
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    
    await user.click(screen.getByTestId('logout-btn'));
    
    expect(authUtils.clearAuthToken).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/');
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleErrorSpy.mockRestore();
  });
});