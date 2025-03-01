import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('Home Page', () => {
  it('renders the main heading and CTA button', () => {
    render(<HomePage />);
    
    // Check if the main heading is rendered
    expect(screen.getByText(/Create Your Own AI-Generated T-Shirt Design/i)).toBeInTheDocument();
    
    // Check if the description text is rendered
    expect(screen.getByText(/Unique designs created just for you/i)).toBeInTheDocument();
    
    // Check if the CTA button is rendered
    expect(screen.getByText('Start Designing')).toBeInTheDocument();
  });

  it('displays featured designs section', () => {
    render(<HomePage />);
    
    // Check if the section heading is rendered
    expect(screen.getByText('Featured Designs')).toBeInTheDocument();
    
    // Check if featured design items are rendered
    expect(screen.getAllByText(/AI Design #/i)).toHaveLength(3);
    
    // Check if "Add to Cart" buttons are rendered for each design
    expect(screen.getAllByText('Add to Cart')).toHaveLength(3);
  });
});