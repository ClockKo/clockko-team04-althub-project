/* ├── ProtectedRoute.tsx  // Wrapper to protect routes for logged-in users*/ 

import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './authcontext';
import { useOnboarding } from '../../contexts/OnboardingContext';

const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isOnboardingComplete, checkBackendOnboardingStatus } = useOnboarding();
  const location = useLocation();

  // Check backend onboarding status when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      checkBackendOnboardingStatus();
    }
  }, [isAuthenticated, checkBackendOnboardingStatus]);

  // If user is not authenticated, redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  // Exception: allow access to onboarding page itself
  if (!isOnboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  // If user has completed onboarding but is trying to access onboarding page, redirect to dashboard
  if (isOnboardingComplete && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" />;
  }

  // If the user is authenticated and has completed onboarding, render the child routes
  return <Outlet />;
};

export default ProtectedRoutes;