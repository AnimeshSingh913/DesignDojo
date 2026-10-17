'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { OAuthButtons } from './OAuthButtons';
import { User as UserIcon, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SignupForm() {
  const { setAuthModalView } = useAuth();
  
  const [name, setName] = useState('');
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Switch to login view after successful signup
        setAuthModalView('login');
      } else {
        setError(data.message || 'Signup failed');
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
        <h2 className="text-2xl font-bold text-primary-ink">Create an account</h2>
        <p className="text-primary/70 mt-2 text-sm">Join DesignDojo to start designing better systems.</p>
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
          <label className="block text-sm font-medium text-primary mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-primary/40" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-primary/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-bg/50 hover:bg-bg transition-colors sm:text-sm text-primary-ink outline-none"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

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
          <label className="block text-sm font-medium text-primary mb-1">Password</label>
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
              minLength={8}
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
          <p className="mt-1 text-xs text-primary/60">Must be at least 8 characters.</p>
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
              Create account
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-primary/70">Already have an account? </span>
        <button 
          onClick={() => setAuthModalView('login')} 
          className="cursor-pointer font-bold text-primary hover:text-primary-ink transition-colors"
        >
          Sign in
        </button>
      </div>
    </>
  );
}
