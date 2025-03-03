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