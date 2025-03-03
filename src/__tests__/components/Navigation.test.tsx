import { render, screen } from '@testing-library/react';
import Navigation from '@/components/navigation/Navigation';
import { AuthProvider } from '@/lib/auth/AuthContext';
import * as authUtils from '@/lib/auth/auth';

// Mock usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  })
}));

// Mock auth utilities
jest.mock('@/lib/auth/auth', () => ({
  getAuthToken: jest.fn(),
  verifyToken: jest.fn(),
  clearAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User'
  })
});

describe('Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authUtils.getAuthToken as jest.Mock).mockReturnValue(null);
  });

  const renderWithAuth = (
    ui: React.ReactElement,
    { authenticated = false } = {}
  ) => {
    if (authenticated) {
      (authUtils.getAuthToken as jest.Mock).mockReturnValue('valid-token');
      (authUtils.verifyToken as jest.Mock).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com'
      });
    }

    return render(<AuthProvider>{ui}</AuthProvider>);
  };

  it('renders the logo and navigation items', () => {
    renderWithAuth(<Navigation />);
    
    // Check if the logo/title is rendered
    expect(screen.getByText('AI T-Shirt Designer')).toBeInTheDocument();
    
    // Check if navigation items are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  it('highlights the active navigation item based on current path', () => {
    renderWithAuth(<Navigation />);
    
    // Since we mocked usePathname to return '/', the Home link should be active
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('bg-blue-500');
    expect(homeLink).toHaveClass('text-white');
    
    // Other links should not be active
    const shopLink = screen.getByText('Shop').closest('a');
    expect(shopLink).not.toHaveClass('bg-blue-500');
    expect(shopLink).toHaveClass('text-gray-700');
  });

  it('shows login button when not authenticated', async () => {
    renderWithAuth(<Navigation />, { authenticated: false });
    
    // Wait for auth to be initialized
    await screen.findByText('Login');
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows logout button when authenticated', async () => {
    renderWithAuth(<Navigation />, { authenticated: true });
    
    // Wait for auth to be initialized
    await screen.findByText('Logout');
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });
});