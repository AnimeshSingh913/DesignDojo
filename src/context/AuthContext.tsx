'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

type User = {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin' | string;
  customLimits?: {
    lldReview?: number | null;
    lldChat?: number | null;
    hldReview?: number | null;
    hldChat?: number | null;
    aiGenerator?: number | null;
    mentorChat?: number | null;
  };
  aiUsage?: {
    lldReview?: number;
    lldChat?: number;
    hldReview?: number;
    hldChat?: number;
    aiGenerator?: number;
    mentorChat?: number;
    totalCalls?: number;
    lastUsedAt?: string | null;
  };
};

export type AuthModalView = 'login' | 'signup' | 'forgot-password' | 'reset-password';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalView: AuthModalView;
  openAuthModal: (view?: AuthModalView) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: AuthModalView) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('login');
  
  // NextAuth Session Hook
  const { data: session, status } = useSession();

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        // /api/auth/me resolves both email/password (JWT cookie) and OAuth (NextAuth) users,
        // and returns the role from the database so OAuth admins get admin access too.
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user && isMounted) {
            setUser(data.user);
            setLoading(false);
            return;
          }
        }

        // Fallback: NextAuth session without a matching DB profile
        if (session && session.user) {
          if (isMounted) {
            setUser({
              id: (session.user as any).id || session.user.email || '',
              name: session.user.name || 'User',
              email: session.user.email || '',
            });
            setLoading(false);
          }
          return;
        }
        
        // If NextAuth is still loading, wait for it before marking user as null
        if (status === 'loading') {
          return;
        }

        // Neither auth method succeeded
        if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        if (!session?.user && isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted && status !== 'loading') {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [session, status]);

  // 24-Hour Inactivity Session Tracker
  const INACTIVITY_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours (1 day)
  const LAST_ACTIVITY_KEY = 'designdojo_last_activity_time';

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      }
      // Clear custom JWT token
      await fetch('/api/auth/logout', { method: 'POST' });
      // Clear NextAuth session (this will trigger a page reload by default)
      if (session) {
        await signOut({ redirect: false });
      }
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Activity tracking and inactivity timeout management
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    // Check if session has already expired due to 24h inactivity
    const checkInactivity = () => {
      const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivityStr) {
        const lastActivity = Number(lastActivityStr);
        if (lastActivity && Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
          console.warn('[AuthContext] 24 hours of inactivity reached. Auto logging out.');
          logout();
          return true;
        }
      }
      return false;
    };

    if (checkInactivity()) return;

    // Record initial activity timestamp
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));

    // Throttled activity updater (at most once every 30 seconds)
    let lastThrottledUpdate = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottledUpdate > 30000) {
        lastThrottledUpdate = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!checkInactivity()) {
          lastThrottledUpdate = Date.now();
          localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
        }
      }
    };

    // Listen to user interactions
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'focus'];
    events.forEach(event => window.addEventListener(event, handleUserActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic check every 60 seconds
    const intervalId = setInterval(checkInactivity, 60000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [user]);

  const openAuthModal = (view: AuthModalView = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        setUser, 
        logout,
        isAuthModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
        setAuthModalView
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
