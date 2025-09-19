import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchUserData } from '@/features/auth/api';
import { useAuth } from '@/features/auth/authcontext';
import type { User } from '../types/typesGlobal';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      // Only try to fetch data if the user is authenticated
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          setError(null);
          const userData = await fetchUserData();
          setUser(userData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch user data');
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If not authenticated, clear user data
        setUser(null);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated]); // This effect runs when the component mounts and whenever isAuthenticated changes

  const refetchUser = () => {
    // This function can be called manually to re-fetch user data
    if (isAuthenticated) {
        const fetchUser = async () => {
            try {
              setIsLoading(true);
              setError(null);
              const userData = await fetchUserData();
              setUser(userData);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to fetch user data');
              setUser(null);
            } finally {
              setIsLoading(false);
            }
        };
        fetchUser();
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        refetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}