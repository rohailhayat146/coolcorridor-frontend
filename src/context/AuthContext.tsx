import React, { createContext, useContext, useState, useEffect } from 'react';
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
  signUp: (email: string, password: string) => Promise<{ error?: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error?: string | null }>;
  loginAsGuest: () => Promise<{ error?: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Check whether current user is anonymous guest
  const isGuest = Boolean(
    user?.is_anonymous ||
      (user?.email && user.email.endsWith('@coolcorridor.guest')) ||
      user?.app_metadata?.provider === 'anonymous'
  );

  useEffect(() => {
    // 1. Initial user check
    getCurrentUser().then((u) => {
      setUser(u);
      setIsLoading(false);
    });

    // 2. Listen to Supabase Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await signUpWithEmail(email, password);
    setIsLoading(false);
    if (!error && data?.user) {
      setUser(data.user);
      closeAuthModal();
      return { error: null };
    }
    return { error: error || 'Signup failed' };
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await signInWithEmail(email, password);
    setIsLoading(false);
    if (!error && data?.user) {
      setUser(data.user);
      closeAuthModal();
      return { error: null };
    }
    return { error: error || 'Login failed' };
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    const { data, error } = await signInAsGuest();
    setIsLoading(false);
    if (!error && data?.user) {
      setUser(data.user);
      closeAuthModal();
      return { error: null };
    } else if (!error) {
      // Create lightweight local guest user object if anonymous mode was handled
      const fallbackGuestUser = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        app_metadata: { provider: 'anonymous' },
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        is_anonymous: true,
      } as unknown as User;
      setUser(fallbackGuestUser);
      closeAuthModal();
      return { error: null };
    }
    return { error: error || 'Guest login failed' };
  };

  const signOut = async () => {
    setIsLoading(true);
    await signOutUser();
    setUser(null);
    setIsLoading(false);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
