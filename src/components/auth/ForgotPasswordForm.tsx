'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ForgotPasswordForm() {
  const { setAuthModalView } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Switch to reset password view after a short delay
        setTimeout(() => {
          // Note: we can't easily pass the email param through context without adding it to context, 
          // but we can let the reset form start empty if needed, or we add email to context. 
          // For simplicity, we just switch view.
          setAuthModalView('reset-password');
        }, 2000);
      } else {
        setError(data.message || 'Failed to request password reset');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-primary-ink mb-2">Check your email</h2>
        <p className="text-primary/70 text-sm mb-6">
          We've sent a 6-digit OTP to <span className="font-bold text-primary">{email}</span>.
        </p>
        <div className="flex justify-center items-center text-sm text-primary">
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
          Loading reset form...
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-primary-ink">Forgot password?</h2>
        <p className="text-primary/70 mt-2 text-sm">No worries, we'll send you reset instructions.</p>
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
              Send OTP
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm">
        <button 
          onClick={() => setAuthModalView('login')} 
          className="cursor-pointer font-bold text-primary/70 hover:text-primary transition-colors flex items-center justify-center mx-auto"
        >
          <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
          Back to log in
        </button>
      </div>
    </>
  );
}
