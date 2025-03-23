"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

const NavLink = ({ href, label, isActive }: NavLinkProps) => {
  return (
    <Link 
      href={href}
      className={`px-4 py-2 mx-1 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-500 text-white' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );
};

export default function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading, isAdmin } = useAuth();
  
  // Public nav items (always visible)
  const publicNavItems = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/help', label: 'Help & FAQs' },
  ];
  
  // Protected nav items (only visible when logged in)
  const protectedNavItems = [
    { href: '/my-designs', label: 'My Designs' },
    { href: '/cart', label: 'Cart' },
    { href: '/orders', label: 'Orders' },
    { href: '/profile', label: 'Profile' },
  ];
  
  // Admin nav items (only visible to admin users)
  const adminNavItems = [
    { href: '/admin', label: 'Admin Dashboard' },
  ];

  // Determine which items to show based on auth state and admin role
  const navItems = [
    ...publicNavItems,
    ...(isAuthenticated ? protectedNavItems : []),
    ...(isAdmin ? adminNavItems : [])
  ];

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600 mr-8">AI T-Shirt Designer</h1>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <NavLink 
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
        
        {/* Auth buttons */}
        <div className="flex items-center">
          {isLoading ? (
            <div className="animate-pulse h-10 w-20 bg-gray-200 rounded"></div>
          ) : isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden sm:inline">
                Hello, {user?.name?.split(' ')[0] || 'User'}
              </span>
              <button 
                onClick={logout}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth">
              <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Login / Register
              </button>
            </Link>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden ml-4">
          <button className="p-2 rounded-md hover:bg-gray-100">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}