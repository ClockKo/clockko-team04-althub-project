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
  const [authToken, setAuthTokenState] = useState<string | null>(null);

  // Check localStorage for a token when the app loads
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthTokenState(token);
    }
  }, []);

  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    setAuthTokenState(token);
  };

  const logout = () => {
    setAuthToken(null);
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