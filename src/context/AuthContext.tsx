
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { User } from '@supabase/supabase-js';

import {
  supabase,
  signUpWithEmail,
  signInWithEmail,
  signInAsGuest,
  signOutUser,
  getCurrentUser,
} from '../services/supabase';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error?: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string | null }>;
  loginAsGuest: () => Promise<{ error?: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<
    'login' | 'signup'
  >('login');

  // Identify genuine Supabase anonymous users.
  const isGuest = Boolean(
    user?.is_anonymous ||
      user?.app_metadata?.provider === 'anonymous'
  );

  // Initialize authentication and listen for session changes.
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error(
          '[AuthContext] Initial authentication check failed:',
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Subscribe to authentication changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        setIsLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (
    mode: 'login' | 'signup' = 'login'
  ) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  // Register a new email account.
  const signUp = async (
    email: string,
    password: string
  ): Promise<{ error?: string | null }> => {
    setIsLoading(true);

    try {
      const { data, error } = await signUpWithEmail(
        email,
        password
      );

      if (error) {
        return { error };
      }

      if (data?.user) {
        setUser(data.user);
        closeAuthModal();
        return { error: null };
      }

      return {
        error:
          'Account registration was received, but no user session was returned. Please check your email if confirmation is required.',
      };
    } catch (error: any) {
      console.error('[AuthContext] Sign-up failed:', error);

      return {
        error: error?.message || 'Signup failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Log in with an existing email account.
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error?: string | null }> => {
    setIsLoading(true);

    try {
      const { data, error } = await signInWithEmail(
        email,
        password
      );

      if (error) {
        return { error };
      }

      if (data?.user) {
        setUser(data.user);
        closeAuthModal();
        return { error: null };
      }

      return {
        error: 'Login failed. No authenticated user was returned.',
      };
    } catch (error: any) {
      console.error('[AuthContext] Sign-in failed:', error);

      return {
        error: error?.message || 'Login failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Continue as Guest using Supabase Anonymous Authentication.
  const loginAsGuest = async (): Promise<{
    error?: string | null;
  }> => {
    setIsLoading(true);

    try {
      const { data, error } = await signInAsGuest();

      if (error) {
        return { error };
      }

      // A genuine Supabase user UUID is required.
      if (!data?.user?.id) {
        return {
          error:
            'Guest authentication failed. Supabase did not return a valid user session.',
        };
      }

      setUser(data.user);
      closeAuthModal();

      return { error: null };
    } catch (error: any) {
      console.error('[AuthContext] Guest sign-in failed:', error);

      return {
        error:
          error?.message ||
          'Unable to continue as guest. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out the current user.
  const signOut = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const { error } = await signOutUser();

      if (error) {
        console.error('[AuthContext] Sign-out failed:', error);
        return;
      }

      setUser(null);
      closeAuthModal();
    } catch (error) {
      console.error('[AuthContext] Sign-out exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isLoading,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signUp,
        signIn,
        loginAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
