import { render, screen } from '@testing-library/react';
import ShopPage from '@/app/shop/page';

describe('Shop Page', () => {
  it('renders the shop page heading', () => {
    render(<ShopPage />);
    
    // Check if the main heading is rendered
    expect(screen.getByText('Shop AI-Generated T-Shirts')).toBeInTheDocument();
  });

  it('displays filter options', () => {
    render(<ShopPage />);
    
    // Check if the filter section is rendered
    expect(screen.getByText('Filters')).toBeInTheDocument();
    
    // Check if the categories section is rendered
    expect(screen.getByText('Categories')).toBeInTheDocument();
    
    // Check if specific filter categories are rendered
    expect(screen.getByText('Abstract')).toBeInTheDocument();
    expect(screen.getByText('Nature')).toBeInTheDocument();
    expect(screen.getByText('Geometric')).toBeInTheDocument();
    
    // Check if price filter is rendered
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    
    // Check if filter button is rendered
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
  });

  it('displays product grid with items', () => {
    render(<ShopPage />);
    
    // Check if showing items text is rendered
    expect(screen.getByText('Showing 9 of 24 designs')).toBeInTheDocument();
    
    // Check if sort options are rendered
    expect(screen.getByText('Sort by: Featured')).toBeInTheDocument();
    
    // Check if product cards are rendered (9 cards)
    expect(screen.getAllByText(/AI Design #/i)).toHaveLength(9);
    
    // Check if "Add to Cart" buttons are rendered for each product
    expect(screen.getAllByText('Add to Cart')).toHaveLength(9);
  });
});