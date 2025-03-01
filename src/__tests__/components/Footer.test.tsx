import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '@/components/layout/Footer';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Footer', () => {
  it('renders the footer with all required sections', () => {
    render(<Footer />);
    
    // Check for company name
    expect(screen.getByText('AI T-Shirt Designer')).toBeInTheDocument();
    
    // Check for footer sections
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByText('Connect With Us')).toBeInTheDocument();
    
    // Check for legal links
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    
    // Check for copyright notice
    expect(screen.getByText((content) => {
      return content.includes('All rights reserved');
    })).toBeInTheDocument();
  });
  
  it('renders all links correctly', () => {
    render(<Footer />);
    
    // Check navigation links
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    
    const shopLink = screen.getByText('Shop').closest('a');
    expect(shopLink).toHaveAttribute('href', '/shop');
    
    // Check legal links
    const aboutLink = screen.getByText('About Us').closest('a');
    expect(aboutLink).toHaveAttribute('href', '/about');
    
    const contactLink = screen.getByText('Contact Us').closest('a');
    expect(contactLink).toHaveAttribute('href', '/contact');
    
    const termsLink = screen.getByText('Terms & Conditions').closest('a');
    expect(termsLink).toHaveAttribute('href', '/terms');
    
    const privacyLink = screen.getByText('Privacy Policy').closest('a');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});