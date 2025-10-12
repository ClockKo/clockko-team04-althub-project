/* ├── AuthContext.tsx     // Context/provider for user and auth state */ 

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of the context state
interface AuthContextType {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

// Create the context with a default value of undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage synchronously to avoid a false unauthenticated render
  const [authToken, setAuthTokenState] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });

  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    setAuthTokenState(token);
  };

  const logout = () => {
    // Clear the app token
    setAuthToken(null);
    
    // Try to sign out from Google OAuth session
    try {
      const googleWindow = window as any;
      if (googleWindow.google && googleWindow.google.accounts) {
        googleWindow.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      console.warn('Could not disable Google auto-select:', error);
    }
  };

  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};