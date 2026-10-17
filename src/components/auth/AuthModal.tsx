'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LogoIcon } from '../icons/LogoIcon';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalView } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeAuthModal]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeAuthModal();
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center font-body p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary-ink/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-surface shadow-[0_24px_48px_-12px_rgba(53,66,89,0.25)] rounded-[24px] overflow-hidden border border-primary/10"
          >
            {/* Decorative background elements inside modal */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-muted/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8">
              <button
                onClick={closeAuthModal}
                className="cursor-pointer absolute top-4 right-4 p-2 text-primary/50 hover:text-primary-ink bg-primary/5 hover:bg-primary/10 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-[9px] font-heading font-extrabold text-[24px] text-primary">
                  <LogoIcon />
                  DesignDojo
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={authModalView}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {authModalView === 'login' && <LoginForm />}
                  {authModalView === 'signup' && <SignupForm />}
                  {authModalView === 'forgot-password' && <ForgotPasswordForm />}
                  {authModalView === 'reset-password' && <ResetPasswordForm />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
