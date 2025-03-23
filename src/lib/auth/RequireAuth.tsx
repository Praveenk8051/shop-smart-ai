'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}

export const RequireAuth = ({ 
  children, 
  redirectTo = '/auth'
}: RequireAuthProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Use effect for redirect to avoid render-time navigation
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  // If still loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">Loading...</div>
    );
  }
  
  // If authenticated, render the protected content, otherwise render nothing
  // (the useEffect will handle the redirect)
  return isAuthenticated ? <>{children}</> : null;
}

interface RequireAdminProps {
  children: ReactNode;
  redirectTo?: string;
}

export const RequireAdmin = ({ 
  children, 
  redirectTo = '/'
}: RequireAdminProps) => {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Use effect for redirect to avoid render-time navigation
  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/auth');
      } 
      // If authenticated but not admin, redirect to specified page
      else if (!isAdmin) {
        router.push(redirectTo);
      }
    }
  }, [isAdmin, isAuthenticated, isLoading, redirectTo, router]);

  // If still loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">Loading...</div>
    );
  }
  
  // Only render if user is an admin
  return (isAuthenticated && isAdmin) ? <>{children}</> : null;
}