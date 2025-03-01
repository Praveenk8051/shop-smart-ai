import { render, screen } from '@testing-library/react';
import Layout from '@/components/layout/Layout';

// Mock the Navigation component
jest.mock('@/components/navigation/Navigation', () => {
  return function MockNavigation() {
    return <div data-testid="navigation">Navigation Component</div>;
  };
});

describe('Layout Component', () => {
  it('renders the navigation, main content and footer', () => {
    render(
      <Layout>
        <div data-testid="content">Test Content</div>
      </Layout>
    );
    
    // Check if navigation is rendered
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    
    // Check if content is rendered
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check if footer is rendered
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    
    // Check if current year is in the footer
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });
});