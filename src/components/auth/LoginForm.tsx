'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { OAuthButtons } from './OAuthButtons';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const { setUser, setAuthModalView, closeAuthModal } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        closeAuthModal();
        if (data.user?.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-primary-ink">Welcome back</h2>
        <p className="text-primary/70 mt-2 text-sm">Please enter your details to sign in.</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-warn/10 text-warn rounded-lg text-sm font-medium text-center border border-warn/20"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <OAuthButtons />


      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Email address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-primary/40" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-primary/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-bg/50 hover:bg-bg transition-colors sm:text-sm text-primary-ink outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-primary">Password</label>
            <button 
              type="button" 
              onClick={() => setAuthModalView('forgot-password')} 
              className="cursor-pointer text-xs font-semibold text-primary hover:text-primary-ink transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-primary/40" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-primary/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-bg/50 hover:bg-bg transition-colors sm:text-sm text-primary-ink outline-none"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary/40 hover:text-primary-ink transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-[0_4px_10px_rgba(53,66,89,0.08)] text-sm font-semibold text-surface bg-primary hover:bg-primary-ink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4 group"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-primary/70">Don't have an account? </span>
        <button 
          onClick={() => setAuthModalView('signup')} 
          className="cursor-pointer font-bold text-primary hover:text-primary-ink transition-colors"
        >
          Sign up
        </button>
      </div>
    </>
  );
}
