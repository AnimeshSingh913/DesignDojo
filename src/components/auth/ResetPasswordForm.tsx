'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, KeyRound, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ResetPasswordForm() {
  const { setAuthModalView, closeAuthModal } = useAuth();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setAuthModalView('login');
        }, 2500);
      } else {
        setError(data.message || 'Failed to reset password');
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
        <h2 className="text-2xl font-bold text-primary-ink mb-2">Password reset successful</h2>
        <p className="text-primary/70 text-sm mb-6">
          Your password has been changed successfully.
        </p>
        <div className="flex justify-center items-center text-sm text-primary">
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
          Switching to login...
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-primary-ink">Set new password</h2>
        <p className="text-primary/70 mt-2 text-sm">Please enter the 6-digit OTP sent to your email and your new password.</p>
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
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2.5 border border-primary/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-bg/50 sm:text-sm outline-none"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">6-Digit OTP</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-primary/40" />
            </div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-primary/15 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-bg/50 hover:bg-bg transition-colors sm:text-sm text-primary-ink outline-none text-center tracking-[0.5em] font-mono text-lg"
              placeholder="000000"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-primary/40" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              Confirm reset
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
