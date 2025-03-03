import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import { useAuth } from '@/lib/auth/AuthContext';

// Mock the auth context
jest.mock('@/lib/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock next/link as it's used in the component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Home Page', () => {
  // Mock window.location.href for redirect tests
  const originalLocation = window.location;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location
    const mockLocation = { ...originalLocation };
    mockLocation.href = '';
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });
  });
  
  afterAll(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  });
  
  it('should show loading state when auth is loading', () => {
    // Mock loading auth state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    });
    
    render(<HomePage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Start Designing')).not.toBeInTheDocument();
    expect(screen.queryByText('Login to Start Designing')).not.toBeInTheDocument();
  });
  
  it('should show design button for authenticated users', () => {
    // Mock authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false
    });
    
    render(<HomePage />);
    
    expect(screen.getByText('Start Designing')).toBeInTheDocument();
    expect(screen.queryByText('Login to Start Designing')).not.toBeInTheDocument();
    expect(screen.getAllByText('Add to Cart').length).toBe(3);
  });
  
  it('should show login button for unauthenticated users', () => {
    // Mock unauthenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    });
    
    render(<HomePage />);
    
    expect(screen.getByText('Login to Start Designing')).toBeInTheDocument();
    expect(screen.queryByText('Start Designing')).not.toBeInTheDocument();
    expect(screen.getAllByText('Login to Add to Cart').length).toBe(3);
  });
  
  it('should redirect to auth page when clicking Add to Cart while unauthenticated', async () => {
    const user = userEvent.setup();
    // Mock unauthenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    });
    
    render(<HomePage />);
    
    const addToCartButtons = screen.getAllByText('Login to Add to Cart');
    await user.click(addToCartButtons[0]);
    
    expect(window.location.href).toBe('/auth');
  });
  
  it('should not redirect when clicking Add to Cart while authenticated', async () => {
    const user = userEvent.setup();
    // Mock authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false
    });
    
    render(<HomePage />);
    
    const addToCartButtons = screen.getAllByText('Add to Cart');
    await user.click(addToCartButtons[0]);
    
    expect(window.location.href).toBe('');
  });
});