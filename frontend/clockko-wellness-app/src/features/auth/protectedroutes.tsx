/* ├── ProtectedRoute.tsx  // Wrapper to protect routes for logged-in users*/ 

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authcontext';

const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // If the user is authenticated, render the child routes (e.g., the dashboard).
  // Otherwise, redirect them to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;