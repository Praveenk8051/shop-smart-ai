import { render, screen } from '@testing-library/react';
import Navigation from '@/components/navigation/Navigation';

// Mock usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Navigation Component', () => {
  it('renders the logo and navigation items', () => {
    render(<Navigation />);
    
    // Check if the logo/title is rendered
    expect(screen.getByText('AI T-Shirt Designer')).toBeInTheDocument();
    
    // Check if all navigation items are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('My Designs')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Help & FAQs')).toBeInTheDocument();
  });

  it('highlights the active navigation item based on current path', () => {
    render(<Navigation />);
    
    // Since we mocked usePathname to return '/', the Home link should be active
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('bg-blue-500');
    expect(homeLink).toHaveClass('text-white');
    
    // Other links should not be active
    const shopLink = screen.getByText('Shop').closest('a');
    expect(shopLink).not.toHaveClass('bg-blue-500');
    expect(shopLink).toHaveClass('text-gray-700');
  });
});